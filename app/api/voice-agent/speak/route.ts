import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createOpenAI, MODELS } from '@/lib/openai/config';
import { validateText } from '@/lib/security/requestValidator';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Get OpenAI API key from Cloudflare env
  const { env } = getRequestContext();
  const openai = createOpenAI(env.OPENAI_API_KEY);

  try {
    const { text } = await request.json() as { text: string };

    // Input validation
    const validation = validateText(text);
    if (!validation.valid) {
      console.warn(`⚠️ Invalid text: ${validation.error}`);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const sanitizedText = validation.sanitized!;

    console.log('🔊 Generating TTS audio...');

    // Call OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model: MODELS.tts,
      voice: MODELS.voice,
      input: sanitizedText,
      response_format: 'mp3',
      speed: 1.0,
    });

    // Convert response to buffer (edge runtime compatible)
    const buffer = new Uint8Array(await mp3.arrayBuffer());

    const duration = Date.now() - startTime;
    console.log(`⏱️ TTS generated in ${duration}ms`);

    // Return audio file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'X-Duration': duration.toString(),
      },
    });

  } catch (error) {
    console.error('TTS error:', error);
    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        error: 'Failed to generate speech',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 30;
