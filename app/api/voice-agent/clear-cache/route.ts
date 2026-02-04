import { NextResponse } from 'next/server';
import { responseCache } from '@/lib/voiceAgent/responseCache';

export async function POST() {
  try {
    responseCache.clear();

    return NextResponse.json({
      success: true,
      message: 'All caches cleared successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to clear cache',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
