import { NextRequest, NextResponse } from 'next/server';
import { openai, MODELS } from '@/lib/openai/config';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid text provided' },
        { status: 400 }
      );
    }

    // Call OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model: MODELS.tts,
      voice: MODELS.voice,
      input: text,
      response_format: 'mp3',
      speed: 1.0,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return audio file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
