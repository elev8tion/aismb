import { NextResponse } from 'next/server';
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

export async function GET() {
  try {
    const ctx = getOptionalRequestContext(); const env = (ctx?.env || process.env) as any;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'KV-backed security stats - use KV namespaces for detailed stats',
      kvBindings: {
        rateLimit: !!env.RATE_LIMIT_KV,
        costMonitor: !!env.COST_MONITOR_KV,
        responseCache: !!env.RESPONSE_CACHE_KV,
        voiceSessions: !!env.VOICE_SESSIONS,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get security stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
