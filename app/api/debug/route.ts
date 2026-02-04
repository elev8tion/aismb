import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export async function GET() {
  try {
    const { env } = getRequestContext();

    return NextResponse.json({
      success: true,
      hasOpenAIKey: !!env.OPENAI_API_KEY,
      hasVoiceSessions: !!env.VOICE_SESSIONS,
      openAIKeyLength: env.OPENAI_API_KEY?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export const runtime = 'edge';
