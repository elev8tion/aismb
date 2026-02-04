import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { createOpenAI, MODELS } from '@/lib/openai/config';
import { rateLimiter, getClientIP } from '@/lib/security/rateLimiter';
import { validateText } from '@/lib/security/requestValidator';
import { costMonitor, estimateTTSCost } from '@/lib/security/costMonitor';

// Simple TTS cache (text -> audio buffer)
// Separate from responseCache since we cache by text, not question
const ttsCache = new Map<string, Buffer>();
const TTS_CACHE_MAX_SIZE = 50;
const TTS_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface TTSCacheEntry {
  buffer: Buffer;
  timestamp: number;
}

const ttsCacheWithTimestamp = new Map<string, TTSCacheEntry>();

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

    const { text } = await request.json() as { text: string };

    // 🛡️ SECURITY 2: Input validation
    const validation = validateText(text);
    if (!validation.valid) {
      console.warn(`⚠️ Invalid text from ${clientIP}: ${validation.error}`);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const sanitizedText = validation.sanitized!;

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

    // ⚡ OPTIMIZATION: Check TTS cache first
    const cacheKey = sanitizedText.substring(0, 200); // Use first 200 chars as key
    const cached = ttsCacheWithTimestamp.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < TTS_CACHE_TTL) {
      const duration = Date.now() - startTime;
      console.log(`✅ TTS Cache HIT! Response time: ${duration}ms (saved ~3000ms)`);

      // 💰 Track cost (cached = $0)
      costMonitor.track({
        endpoint: 'tts',
        model: MODELS.tts,
        inputTokens: 0,
        outputTokens: 0,
        cached: true,
        ip: clientIP,
      });

      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cached.buffer.length.toString(),
          'X-Cache': 'HIT',
          'X-Duration': duration.toString(),
        },
      });
    }

    console.log('❌ TTS Cache MISS - Generating audio...');

    // Call OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model: MODELS.tts,
      voice: MODELS.voice,
      input: sanitizedText,
      response_format: 'mp3',
      speed: 1.0,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Cache the audio buffer
    if (ttsCacheWithTimestamp.size >= TTS_CACHE_MAX_SIZE) {
      // Remove oldest entry (simple LRU)
      const oldestKey = ttsCacheWithTimestamp.keys().next().value;
      if (oldestKey) {
        ttsCacheWithTimestamp.delete(oldestKey);
      }
    }

    ttsCacheWithTimestamp.set(cacheKey, {
      buffer,
      timestamp: Date.now(),
    });

    // 💰 Track cost
    costMonitor.track({
      endpoint: 'tts',
      model: MODELS.tts,
      inputTokens: 0,
      outputTokens: sanitizedText.length, // TTS charges per character
      cached: false,
      ip: clientIP,
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ TTS generated in ${duration}ms`);

    // Return audio file
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'X-Cache': 'MISS',
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
