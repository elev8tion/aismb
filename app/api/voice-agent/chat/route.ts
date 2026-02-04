import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createOpenAI, MODELS } from '@/lib/openai/config';
import { KNOWLEDGE_BASE } from '@/lib/voiceAgent/knowledgeBase';
import { classifyQuestion } from '@/lib/voiceAgent/questionClassifier';
import { validateQuestion, detectPromptInjection } from '@/lib/security/requestValidator';
import { getSessionStorage } from '@/lib/voiceAgent/sessionStorage';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Get OpenAI API key and KV namespace from Cloudflare env
  const { env } = getRequestContext();
  const openai = createOpenAI(env.OPENAI_API_KEY);

  try {
    const body = await request.json();
    console.log('Chat API received:', body);

    const { question, sessionId } = body as { question: string; sessionId: string };

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

    // Classify question complexity for smart token limits
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
