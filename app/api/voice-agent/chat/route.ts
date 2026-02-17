import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import { createOpenAI } from '@/lib/openai/config';
import { validateQuestion, detectPromptInjection } from '@/lib/security/requestValidator';
import { getSessionStorage } from '@/lib/voiceAgent/sessionStorage';
import { getFeatureFlags, logFeatureFlags } from '@/lib/featureFlags';
import { extractLeadInfo, syncLeadToCRM } from '@/lib/voiceAgent/leadManager';
import { calculateLeadScore } from '@/lib/voiceAgent/leadScorer';
import { sendViaEmailIt } from '@/lib/email/sendEmail';
import { classifyIntent } from '@/lib/voiceAgent/intentRouter';
import { runBookingAgent } from '@/lib/voiceAgent/agents/bookingAgent';
import { runROIAgent } from '@/lib/voiceAgent/agents/roiAgent';
import { runInfoAgent } from '@/lib/voiceAgent/agents/infoAgent';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Get env from Cloudflare context OR fallback to process.env for local dev
  const env = getEnv();
  const openai = createOpenAI(env.OPENAI_API_KEY!);

  try {
    const body = await request.json();
    console.log('Chat API received:', body);

    const { question, sessionId, language } = body as {
      question: string;
      sessionId: string;
      language?: 'en' | 'es';
    };

    console.log(`🌐 Language received: ${language || 'not set (defaulting to English)'}`);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Input validation
    const validation = validateQuestion(question);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const sanitizedQuestion = validation.sanitized!;

    // 🛡️ SECURITY 3: Prompt injection detection (log but allow)
    const injection = detectPromptInjection(sanitizedQuestion);
    if (injection.detected) {
      console.warn(`⚠️ Possible prompt injection detected: ${injection.pattern}`);
    }

    // Get session storage with KV namespace from env
    const sessionStorage = getSessionStorage(env.VOICE_SESSIONS);

    // Get conversation history from session storage
    const conversationHistory = await sessionStorage.getConversationHistory(sessionId);
    console.log(`💬 Session ${sessionId}: ${conversationHistory.length} previous messages`);

    // Classify intent (deterministic, no LLM call)
    const intentResult = classifyIntent(sanitizedQuestion, conversationHistory);
    console.log(`🎯 Intent: ${intentResult.intent} (confidence: ${intentResult.confidence}, continuation: ${intentResult.isContinuation})`);

    // Tool context for agents
    const toolContext = { env: env as Record<string, string> };

    // Route to appropriate agent
    let response: string;
    switch (intentResult.intent) {
      case 'booking':
        response = await runBookingAgent(
          openai,
          sanitizedQuestion,
          conversationHistory,
          toolContext,
          { language, isContinuation: intentResult.isContinuation }
        );
        break;

      case 'roi':
        response = await runROIAgent(
          openai,
          sanitizedQuestion,
          conversationHistory,
          toolContext,
          { language }
        );
        break;

      case 'info':
      default:
        response = await runInfoAgent(
          openai,
          sanitizedQuestion,
          conversationHistory,
          { language }
        );
        break;
    }

    // Save the conversation to session storage
    await sessionStorage.addMessage(sessionId, 'user', sanitizedQuestion);
    await sessionStorage.addMessage(sessionId, 'assistant', response);
    console.log(`💾 Saved conversation to session ${sessionId}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // FEATURE FLAGS: Lead Intelligence Pipeline
    // ═══════════════════════════════════════════════════════════════════════════
    const flags = getFeatureFlags(env as Record<string, string | undefined>);
    logFeatureFlags(flags);

    if (flags.VOICE_LEAD_EXTRACTION) {
      const conversationHistory = await sessionStorage.getConversationHistory(sessionId);
      const leadInfo = extractLeadInfo(conversationHistory);

      if (leadInfo.email) {
        console.log(`🎯 Lead extracted: ${leadInfo.email}`);

        // ─── Lead Scoring ─────────────────────────────────────────────
        if (flags.VOICE_LEAD_SCORING) {
          const scoreResult = calculateLeadScore(leadInfo);
          console.log(`📊 Lead score: ${scoreResult.score}/100 (${scoreResult.tier}) - ${scoreResult.factors.join(', ')}`);

          // ─── CRM Sync ─────────────────────────────────────────────
          if (flags.VOICE_CRM_SYNC) {
            const enrichedLead = {
              ...leadInfo,
              email: leadInfo.email!, // TypeScript: we know email exists from line 124 check
              qualified_score: scoreResult.score,
              notes: `Voice Agent | Score: ${scoreResult.tier} (${scoreResult.factors.join(', ')})`,
              source: 'Voice Agent',
              sourceDetail: `Session ${sessionId.slice(0, 8)}`,
            };

            try {
              const crmLead = await syncLeadToCRM(enrichedLead, env as Record<string, string>);
              if (crmLead) {
                console.log(`✅ Lead synced to CRM: ID ${crmLead.id}`);

                // ─── Admin Alerts (High-Value Leads Only) ─────────
                if (flags.VOICE_ADMIN_ALERTS && scoreResult.tier === 'high' && env.ADMIN_EMAIL && env.EMAILIT_API_KEY) {
                  await sendViaEmailIt({
                    apiKey: env.EMAILIT_API_KEY,
                    to: env.ADMIN_EMAIL,
                    subject: `🔥 High-Value Lead from Voice Agent`,
                    html: `
                      <h2>New High-Value Lead</h2>
                      <p><strong>Email:</strong> ${enrichedLead.email}</p>
                      <p><strong>Industry:</strong> ${enrichedLead.industry || 'N/A'}</p>
                      <p><strong>Employee Count:</strong> ${enrichedLead.employeeCount || 'N/A'}</p>
                      <p><strong>Score:</strong> ${scoreResult.score}/100 (${scoreResult.tier})</p>
                      <p><strong>Factors:</strong> ${scoreResult.factors.join(', ')}</p>
                      ${leadInfo.pain_points ? `<p><strong>Pain Points:</strong> ${leadInfo.pain_points}</p>` : ''}
                      ${leadInfo.sentiment ? `<p><strong>Sentiment:</strong> ${leadInfo.sentiment}</p>` : ''}
                      <p><a href="https://app.kre8tion.com/leads">View in CRM →</a></p>
                    `,
                    tags: ['kre8tion', 'landing', 'voice-alert'],
                  });
                  console.log(`📧 Admin alert sent for high-value lead`);
                }
              }
            } catch (error) {
              console.error('❌ Failed to sync lead to CRM:', error);
            }
          }
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`⏱️ Response generated in ${duration}ms`);

    return NextResponse.json({
      response,
      success: true,
      duration,
    });

  } catch (error) {
    console.error('Chat completion error:', error);
    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 30;
