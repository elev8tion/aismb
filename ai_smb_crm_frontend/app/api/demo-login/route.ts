import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import { demoSessionPayload } from '@/lib/demo/session';
import { createDemoSessionToken, setDemoSessionCookie } from '@/lib/demo/token';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json(
    { enabled: true, mode: 'read-only' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: NextRequest) {
  const token = await createDemoSessionToken(getEnv());
  if (!token) {
    return NextResponse.json(
      { error: 'Demo access is not configured' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const response = NextResponse.json(demoSessionPayload(), {
    headers: { 'Cache-Control': 'no-store' },
  });
  response.headers.append('Set-Cookie', setDemoSessionCookie(token, req.nextUrl.protocol === 'https:'));
  return response;
}
