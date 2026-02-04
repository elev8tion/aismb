import { NextResponse } from 'next/server';

// Test imports one by one
import { rateLimiter } from '@/lib/security/rateLimiter';
import { costMonitor } from '@/lib/security/costMonitor';
import { responseCache } from '@/lib/voiceAgent/responseCache';
import { getClassificationStats } from '@/lib/voiceAgent/questionClassifier';

export async function GET() {
  try {
    // Test each module
    const tests = {
      rateLimiter: 'loaded',
      costMonitor: 'loaded',
      responseCache: 'loaded',
      questionClassifier: 'loaded',
    };

    // Try calling methods
    try {
      const rateLimitStats = rateLimiter.getStats();
      tests.rateLimiter = 'working';
    } catch (e) {
      tests.rateLimiter = `error: ${e instanceof Error ? e.message : String(e)}`;
    }

    try {
      const costStats = costMonitor.getStats();
      tests.costMonitor = 'working';
    } catch (e) {
      tests.costMonitor = `error: ${e instanceof Error ? e.message : String(e)}`;
    }

    try {
      const cacheStats = responseCache.getStats();
      tests.responseCache = 'working';
    } catch (e) {
      tests.responseCache = `error: ${e instanceof Error ? e.message : String(e)}`;
    }

    try {
      const classStats = getClassificationStats();
      tests.questionClassifier = 'working';
    } catch (e) {
      tests.questionClassifier = `error: ${e instanceof Error ? e.message : String(e)}`;
    }

    return NextResponse.json({
      success: true,
      tests,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

export const runtime = 'edge';
