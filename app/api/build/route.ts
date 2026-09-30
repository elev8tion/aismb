import { NextResponse } from 'next/server';
import { BUILD_SHA } from '@/lib/buildInfo';

export const runtime = 'edge';

export function GET() {
  return NextResponse.json(
    { app: 'landing', sha: BUILD_SHA },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
