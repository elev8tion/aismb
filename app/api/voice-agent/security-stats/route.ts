import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';

export async function GET() {
  try {
    const env = getEnv();

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
      featureFlags: {
        FF_VOICE_LEAD_EXTRACTION: env.FF_VOICE_LEAD_EXTRACTION,
        FF_VOICE_LEAD_SCORING: env.FF_VOICE_LEAD_SCORING,
        FF_VOICE_CRM_SYNC: env.FF_VOICE_CRM_SYNC,
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
