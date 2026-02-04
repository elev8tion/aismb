import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai/config';
import { KNOWLEDGE_BASE } from '@/lib/voiceAgent/knowledgeBase';
import { responseCache } from '@/lib/voiceAgent/responseCache';
import { classifyQuestion, trackClassification } from '@/lib/voiceAgent/questionClassifier';
import { rateLimiter, getClientIP } from '@/lib/security/rateLimiter';
import { validateQuestion, detectPromptInjection } from '@/lib/security/requestValidator';
import { costMonitor } from '@/lib/security/costMonitor';
import { getSessionStorage } from '@/lib/voiceAgent/sessionStorage';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  try {
    // 🛡️ SECURITY 1: Rate limiting
    const rateLimit = rateLimiter.check(clientIP);
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

    // ⚡ OPTIMIZATION 1: Check cache first
    const cached = responseCache.get(sanitizedQuestion);
    if (cached) {
      const duration = Date.now() - startTime;
      console.log(`✅ Cache HIT! Response time: ${duration}ms (saved ~2000ms)`);

      // 💰 Track cost (cached = $0)
      costMonitor.track({
        endpoint: 'chat',
        model: MODELS.chat,
        inputTokens: 0,
        outputTokens: 0,
        cached: true,
        ip: clientIP,
      });

      return NextResponse.json({
        response: cached.textResponse,
        success: true,
        cached: true,
        duration,
      });
    }

    console.log('❌ Cache MISS - Processing with OpenAI...');

    // 🛡️ SECURITY 4: Check daily cost limit
    if (costMonitor.isOverDailyLimit()) {
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
    trackClassification(classification.complexity);

    console.log(`📊 Question classified as: ${classification.complexity} (${classification.maxTokens} tokens) - ${classification.reason}`);

    // Get session storage (KV on Cloudflare, in-memory locally)
    const sessionStorage = getSessionStorage();

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
    responseCache.set(sanitizedQuestion, response);

    // 💰 Track cost
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;

    costMonitor.track({
      endpoint: 'chat',
      model: MODELS.chat,
      inputTokens,
      outputTokens,
      cached: false,
      ip: clientIP,
    });

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
