import { NextResponse } from 'next/server';
import { responseCache } from '@/lib/voiceAgent/responseCache';
import { getClassificationStats } from '@/lib/voiceAgent/questionClassifier';

export async function GET() {
  try {
    const cacheStats = responseCache.getStats();
    const classificationStats = getClassificationStats();

    return NextResponse.json({
      success: true,
      cache: cacheStats,
      classification: classificationStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to get cache stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
