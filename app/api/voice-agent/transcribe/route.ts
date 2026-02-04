import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createOpenAI, MODELS } from '@/lib/openai/config';
import { rateLimiter, getClientIP } from '@/lib/security/rateLimiter';
import { validateAudioFile } from '@/lib/security/requestValidator';
import { costMonitor, estimateWhisperCost } from '@/lib/security/costMonitor';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  // Get OpenAI API key from Cloudflare env
  const { env } = getRequestContext();
  const openai = createOpenAI(env.OPENAI_API_KEY);

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
          },
        }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // 🛡️ SECURITY 2: Validate audio file size and type
    const validation = validateAudioFile(audioFile);
    if (!validation.valid) {
      console.warn(`⚠️ Invalid audio file from ${clientIP}: ${validation.error}`);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 🛡️ SECURITY 3: Check daily cost limit
    if (costMonitor.isOverDailyLimit()) {
      console.error(`🚨 DAILY COST LIMIT EXCEEDED for ${clientIP}`);
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable due to high usage. Please try again later.',
        },
        { status: 503 }
      );
    }

    console.log(`📤 Transcribing audio: ${audioFile.size} bytes, type: ${audioFile.type}`);

    // Convert File to Buffer for OpenAI API
    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Use correct file extension based on MIME type
    const extension = audioFile.type.includes('mp4') ? 'mp4' :
                      audioFile.type.includes('webm') ? 'webm' :
                      audioFile.type.includes('ogg') ? 'ogg' : 'audio';
    const file = new File([buffer], `audio.${extension}`, { type: audioFile.type });

    // Call OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: MODELS.transcription,
      response_format: 'json',
    });

    console.log('Transcription result:', transcription.text);

    // 💰 Track cost (estimate based on typical speaking rate)
    // Rough estimate: 1MB ≈ 1 minute of audio at standard quality
    const estimatedMinutes = audioFile.size / (1024 * 1024);
    const estimatedCost = estimateWhisperCost(estimatedMinutes * 60);

    costMonitor.track({
      endpoint: 'transcribe',
      model: MODELS.transcription,
      inputTokens: Math.round(estimatedMinutes * 150), // ~150 words/minute
      outputTokens: 0,
      cached: false,
      ip: clientIP,
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ Transcription completed in ${duration}ms`);

    return NextResponse.json({
      text: transcription.text,
      success: true,
      duration,
    });

  } catch (error) {
    console.error('Transcription error:', error);
    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error',
        duration,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 30; // 30 seconds timeout
