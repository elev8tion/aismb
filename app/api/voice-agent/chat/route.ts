import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai/config';
import { KNOWLEDGE_BASE } from '@/lib/voiceAgent/knowledgeBase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Chat API received:', body);

    const { question } = body;

    if (!question || typeof question !== 'string') {
      console.error('Invalid question:', { question, type: typeof question });
      return NextResponse.json(
        { error: 'Invalid question provided', received: body },
        { status: 400 }
      );
    }

    // Call OpenAI Chat Completions API with knowledge base
    const completion = await openai.chat.completions.create({
      model: MODELS.chat,
      messages: [
        {
          role: 'system',
          content: KNOWLEDGE_BASE,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 200, // Keep responses concise for voice
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try asking again.';

    return NextResponse.json({
      response,
      success: true,
      usage: completion.usage, // For monitoring costs
    });

  } catch (error) {
    console.error('Chat completion error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
