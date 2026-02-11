import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI, MODELS } from '@/lib/openai/config';
import { validateText } from '@/lib/security/requestValidator';
import { KVRateLimiter, getClientIP } from '@/lib/security/rateLimiter.kv';
import { getEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const env = getEnv();

  try {
    // Rate limiting (KV-backed)
    if (env.RATE_LIMIT_KV) {
      const rateLimiter = new KVRateLimiter(env.RATE_LIMIT_KV as unknown as KVNamespace);
      const clientIP = getClientIP(request);
      const rateCheck = await rateLimiter.check(clientIP);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: rateCheck.reason || 'Rate limit exceeded' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.resetTime - Date.now()) / 1000)) } },
        );
      }
    }

    const { text, language } = await request.json() as { text: string; language?: 'en' | 'es' };

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

    const selectedVoice = (() => {
      if (language === 'es') return MODELS.voice; // keep current unless changed later
      return MODELS.voice;
    })();

    if (!env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing OPENAI_API_KEY' }, { status: 500 });
    }
    const openai = createOpenAI(env.OPENAI_API_KEY as string);

    // Call OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model: MODELS.tts,
      voice: selectedVoice,
      input: sanitizedText,
      response_format: 'mp3',
      speed: 1.0,
    });

    // Convert response to buffer (edge runtime compatible)
    const buffer = new Uint8Array(await mp3.arrayBuffer());

    const duration = Date.now() - startTime;

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
