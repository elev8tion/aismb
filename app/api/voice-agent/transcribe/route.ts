import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI, MODELS } from '@/lib/openai/config';
import { validateAudioFile } from '@/lib/security/requestValidator';
import { KVRateLimiter, getClientIP } from '@/lib/security/rateLimiter.kv';
import { getEnv } from '@/lib/cloudflare/env';

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
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string | null)?.toLowerCase();

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate audio file size and type
    const validation = validateAudioFile(audioFile);
    if (!validation.valid) {
      console.warn(`⚠️ Invalid audio file: ${validation.error}`);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert File to Uint8Array for OpenAI API (edge runtime compatible)
    const buffer = new Uint8Array(await audioFile.arrayBuffer());

    // Use correct file extension based on MIME type
    const getExtension = (mimeType: string): string => {
      if (mimeType.includes('webm')) return 'webm';
      if (mimeType.includes('mp4')) return 'm4a'; // Safari audio/mp4 needs m4a extension
      if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
      if (mimeType.includes('ogg')) return 'ogg';
      if (mimeType.includes('wav')) return 'wav';
      if (mimeType.includes('flac')) return 'flac';
      if (mimeType.includes('m4a')) return 'm4a';
      return 'webm'; // Default fallback
    };
    const extension = getExtension(audioFile.type);
    const fileName = `audio.${extension}`;
    const file = new File([buffer], fileName, { type: audioFile.type });

    if (!env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: Missing OPENAI_API_KEY' }, { status: 500 });
    }
    const openai = createOpenAI(env.OPENAI_API_KEY as string);

    // Call OpenAI Whisper API (optionally hint language if provided)
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: MODELS.transcription,
      response_format: 'json',
      ...(language === 'es' || language === 'en' ? { language } : {}),
    });

    const duration = Date.now() - startTime;

    return NextResponse.json({
      text: transcription.text,
      success: true,
      duration,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    const duration = Date.now() - startTime;

    // Extract detailed error info
    let errorDetails = 'Unknown error';
    if (error instanceof Error) {
      errorDetails = error.message;
      // Check for OpenAI API errors
      if ('status' in error) {
        errorDetails = `OpenAI API error (${(error as { status: number }).status}): ${error.message}`;
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to transcribe audio',
        details: errorDetails,
        duration,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 30; // 30 seconds timeout
