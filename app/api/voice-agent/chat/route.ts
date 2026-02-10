import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createOpenAI, MODELS } from '@/lib/openai/config';
import { validateQuestion, detectPromptInjection } from '@/lib/security/requestValidator';
import { KVRateLimiter, getClientIP } from '@/lib/security/rateLimiter.kv';
import { KVCostMonitor } from '@/lib/security/costMonitor.kv';
import { responseCache } from '@/lib/voiceAgent/responseCache';
import { getSessionStorage } from '@/lib/voiceAgent/sessionStorage';
import { extractLeadInfo, syncLeadToCRM } from '@/lib/voiceAgent/leadManager';
import { calculateLeadScore } from '@/lib/voiceAgent/leadScorer';
import { getHighPriorityLeadsReport, getDailySummary } from '@/lib/voiceAgent/analyticsAgent';
import { classifyIntent } from '@/lib/voiceAgent/intentRouter';
import { runInfoAgent, runBookingAgent, runROIAgent } from '@/lib/voiceAgent/agents';
import type { ToolContext } from '@/lib/voiceAgent/tools';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Get OpenAI API key and KV namespace from Cloudflare env
  const { env } = getRequestContext();
  const openai = createOpenAI(env.OPENAI_API_KEY);

  // Rate limiting (KV-backed)
  if (env.RATE_LIMIT_KV) {
    const rateLimiter = new KVRateLimiter(env.RATE_LIMIT_KV);
    const clientIP = getClientIP(request);
    const rateCheck = await rateLimiter.check(clientIP);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.reason || 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetTime - Date.now()) / 1000)) } },
      );
    }
  }

  try {
    const body = await request.json();
    console.log('Chat API received:', body);

    const { question, sessionId, language } = body as {
      question: string;
      sessionId: string;
      language?: 'en' | 'es';
    };

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Input validation
    const validation = validateQuestion(question);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitizedQuestion = validation.sanitized!;

    const injection = detectPromptInjection(sanitizedQuestion);
    if (injection.detected) console.warn(`Warning: Possible prompt injection: ${injection.pattern}`);

    // Load session + conversation history
    const sessionStorage = getSessionStorage(env.VOICE_SESSIONS);
    const conversationHistory = await sessionStorage.getConversationHistory(sessionId);

    // Lead profiling & scoring (pre-response analysis)
    const leadInfo = extractLeadInfo([...conversationHistory, { role: 'user', content: sanitizedQuestion }]);
    const leadScore = calculateLeadScore(leadInfo);

    // ─── Intent classification (deterministic, no LLM) ──────────────────
    const { intent, isContinuation } = classifyIntent(sanitizedQuestion, conversationHistory);
    console.log(`Intent: ${intent}${isContinuation ? ' (continuation)' : ''} for: "${sanitizedQuestion.slice(0, 60)}"`);

    // ─── Management intent (handled directly, no LLM) ───────────────────
    if (intent === 'management') {
      const q = sanitizedQuestion.toLowerCase();
      let report: string;
      if (q.includes('daily summary') || q.includes('how are we doing')) {
        report = await getDailySummary(env as unknown as Record<string, string>);
      } else {
        report = await getHighPriorityLeadsReport(env as unknown as Record<string, string>);
      }
      return NextResponse.json({ response: report, success: true, duration: Date.now() - startTime });
    }

    // ─── Cache check (info intent only — booking/ROI are stateful) ─────
    if (intent === 'info') {
      const cached = responseCache.get(sanitizedQuestion);
      if (cached) {
        await sessionStorage.addMessage(sessionId, 'user', sanitizedQuestion);
        await sessionStorage.addMessage(sessionId, 'assistant', cached.textResponse);
        return NextResponse.json({
          response: cached.textResponse,
          success: true,
          cached: true,
          duration: Date.now() - startTime,
        });
      }
    }

    // ─── Dispatch to specialist agent ───────────────────────────────────
    const toolCtx: ToolContext = { env: env as unknown as Record<string, string> };
    const agentOptions = { language, leadScoreTier: leadScore.tier };
    let response: string;

    switch (intent) {
      case 'booking':
        response = await runBookingAgent(openai, sanitizedQuestion, conversationHistory, toolCtx, { ...agentOptions, isContinuation });
        break;
      case 'roi':
        response = await runROIAgent(openai, sanitizedQuestion, conversationHistory, toolCtx, agentOptions);
        break;
      case 'info':
      default:
        response = await runInfoAgent(openai, sanitizedQuestion, conversationHistory, agentOptions);
        // Cache info responses for instant replay on common questions
        responseCache.set(sanitizedQuestion, response);
        break;
    }

    // ─── Save conversation + sync lead (UNCHANGED) ──────────────────────
    await sessionStorage.addMessage(sessionId, 'user', sanitizedQuestion);
    await sessionStorage.addMessage(sessionId, 'assistant', response);

    if (leadInfo.email) {
      // Derive outcome from the routed intent
      const outcome = intent === 'booking' ? 'booking_initiated'
        : intent === 'roi' ? 'roi_calculated'
        : 'info_provided';

      console.log(`Syncing Scored Lead (${leadScore.score}/100):`, leadInfo.email);
      syncLeadToCRM({
        ...leadInfo,
        email: leadInfo.email!,
        source: 'Voice Agent',
        sourceDetail: `${language === 'es' ? 'Spanish' : 'English'} (${leadScore.tier} priority)`,
        notes: `AI Scored as ${leadScore.tier} (${leadScore.score}/100). Factors: ${leadScore.factors.join(', ')}`,
        intents: intent,
        qualified_score: leadScore.score,
        outcome,
      }, env as unknown as Record<string, string>).catch(err => console.error('Failed to sync lead:', err));
    }

    // Cost tracking (KV-backed, best-effort)
    if (env.COST_MONITOR_KV) {
      const costMonitor = new KVCostMonitor(env.COST_MONITOR_KV);
      costMonitor.track({
        endpoint: '/api/voice-agent/chat',
        model: MODELS.chat,
        inputTokens: sanitizedQuestion.length,
        outputTokens: response.length,
        ip: getClientIP(request),
      }).catch((err) => console.error('[CostMonitor] tracking failed:', err));
    }

    const duration = Date.now() - startTime;
    return NextResponse.json({ response, success: true, duration });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

export const runtime = 'edge';
export const maxDuration = 30;
