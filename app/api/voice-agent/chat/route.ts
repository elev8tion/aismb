import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createOpenAI, MODELS } from '@/lib/openai/config';
import { KNOWLEDGE_BASE } from '@/lib/voiceAgent/knowledgeBase';
import { KVResponseCache } from '@/lib/voiceAgent/responseCache.kv';
import { classifyQuestion } from '@/lib/voiceAgent/questionClassifier';
import { KVRateLimiter, getClientIP } from '@/lib/security/rateLimiter.kv';
import { validateQuestion, detectPromptInjection } from '@/lib/security/requestValidator';
import { KVCostMonitor } from '@/lib/security/costMonitor.kv';
import { getSessionStorage } from '@/lib/voiceAgent/sessionStorage';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  // Get OpenAI API key and KV namespaces from Cloudflare env
  const { env } = getRequestContext();
  const openai = createOpenAI(env.OPENAI_API_KEY);

  // Initialize KV-backed utilities (with fallback if KV not available yet)
  const rateLimiter = env.RATE_LIMIT_KV ? new KVRateLimiter(env.RATE_LIMIT_KV) : null;
  const costMonitor = env.COST_MONITOR_KV ? new KVCostMonitor(env.COST_MONITOR_KV) : null;
  const responseCache = env.RESPONSE_CACHE_KV ? new KVResponseCache(env.RESPONSE_CACHE_KV) : null;

  try {
    // 🛡️ SECURITY 1: Rate limiting (skip if KV not available)
    if (rateLimiter) {
      const rateLimit = await rateLimiter.check(clientIP);
      if (!rateLimit.allowed) {
        console.warn(`🚫 Rate limit exceeded for IP: ${clientIP}`);
        return NextResponse.json(
          {
            error: rateLimit.reason || 'Too many requests',
            resetTime: new Date(rateLimit.resetTime).toISOString(),
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            },
          }
        );
      }
    }

    const body = await request.json();
    console.log('Chat API received:', body);

    const { question, sessionId } = body as { question: string; sessionId: string };

    if (!sessionId) {
      console.warn(`⚠️ No session ID provided from ${clientIP}`);
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // 🛡️ SECURITY 2: Input validation
    const validation = validateQuestion(question);
    if (!validation.valid) {
      console.warn(`⚠️ Invalid question from ${clientIP}: ${validation.error}`);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const sanitizedQuestion = validation.sanitized!;

    // 🛡️ SECURITY 3: Prompt injection detection (log but allow)
    const injection = detectPromptInjection(sanitizedQuestion);
    if (injection.detected) {
      console.warn(`⚠️ Possible prompt injection detected from ${clientIP}: ${injection.pattern}`);
      // Log but continue - OpenAI has its own safety measures
    }

    // ⚡ OPTIMIZATION 1: Check cache first (skip if KV not available)
    if (responseCache) {
      const cached = await responseCache.get(sanitizedQuestion);
      if (cached) {
        const duration = Date.now() - startTime;
        console.log(`✅ Cache HIT! Response time: ${duration}ms (saved ~2000ms)`);

        // 💰 Track cost (cached = $0)
        if (costMonitor) {
          await costMonitor.track({
            endpoint: 'chat',
            model: MODELS.chat,
            inputTokens: 0,
            outputTokens: 0,
            cached: true,
            ip: clientIP,
          });
        }

        return NextResponse.json({
          response: cached.textResponse,
          success: true,
          cached: true,
          duration,
        });
      }
    }

    console.log('❌ Cache MISS - Processing with OpenAI...');

    // 🛡️ SECURITY 4: Check daily cost limit (skip if KV not available)
    if (costMonitor && await costMonitor.isOverDailyLimit()) {
      console.error(`🚨 DAILY COST LIMIT EXCEEDED for ${clientIP}`);
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable due to high usage. Please try again later.',
        },
        { status: 503 }
      );
    }

    // ⚡ OPTIMIZATION 2: Classify question complexity for smart token limits
    const classification = classifyQuestion(sanitizedQuestion);

    console.log(`📊 Question classified as: ${classification.complexity} (${classification.maxTokens} tokens) - ${classification.reason}`);

    // Get session storage with KV namespace from env
    const sessionStorage = getSessionStorage(env.VOICE_SESSIONS);

    // Get conversation history from session storage
    const conversationHistory = await sessionStorage.getConversationHistory(sessionId);
    console.log(`💬 Session ${sessionId}: ${conversationHistory.length} previous messages`);

    // Call OpenAI Chat Completions API with knowledge base
    // ⚡ OPTIMIZATION 3: OpenAI automatically caches the system prompt (KNOWLEDGE_BASE)
    const completion = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: [
        {
          role: 'system',
          content: KNOWLEDGE_BASE, // Automatically cached by OpenAI
        },
        ...conversationHistory, // Include conversation history from session storage
        {
          role: 'user',
          content: sanitizedQuestion,
        },
      ],
      temperature: 0.7,
      max_tokens: classification.maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try asking again.';

    // Save the conversation to session storage
    await sessionStorage.addMessage(sessionId, 'user', sanitizedQuestion);
    await sessionStorage.addMessage(sessionId, 'assistant', response);
    console.log(`💾 Saved conversation to session ${sessionId}`);

    // Cache the response for future requests
    if (responseCache) {
      await responseCache.set(sanitizedQuestion, response);
    }

    // 💰 Track cost
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    if (costMonitor) {
      await costMonitor.track({
        endpoint: 'chat',
        model: MODELS.chat,
        inputTokens,
        outputTokens,
        cached: false,
        ip: clientIP,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`⏱️ Response generated in ${duration}ms`);

    return NextResponse.json({
      response,
      success: true,
      cached: false,
      duration,
      complexity: classification.complexity,
      usage: completion.usage,
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
