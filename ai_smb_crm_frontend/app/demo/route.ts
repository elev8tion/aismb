import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import { createDemoSessionToken, setDemoSessionCookie } from '@/lib/demo/token';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const token = await createDemoSessionToken(getEnv());
  if (!token) {
    return NextResponse.redirect(new URL('/login?demo=unavailable', req.url));
  }

  const response = NextResponse.redirect(new URL('/dashboard', req.url));
  response.headers.set('Cache-Control', 'no-store');
  response.headers.append('Set-Cookie', setDemoSessionCookie(token, req.nextUrl.protocol === 'https:'));
  return response;
}
