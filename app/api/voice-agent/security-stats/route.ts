import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/security/rateLimiter';
import { costMonitor } from '@/lib/security/costMonitor';
import { responseCache } from '@/lib/voiceAgent/responseCache';
import { getClassificationStats } from '@/lib/voiceAgent/questionClassifier';

export async function GET() {
  try {
    const rateLimitStats = rateLimiter.getStats();
    const costStats = costMonitor.getStats();
    const cacheStats = responseCache.getStats();
    const classificationStats = getClassificationStats();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      rateLimiting: {
        ...rateLimitStats,
        limits: {
          perMinute: 10,
          perHour: 100,
          blockDuration: '1 hour',
        },
      },
      costs: costStats,
      cache: cacheStats,
      classification: classificationStats,
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
