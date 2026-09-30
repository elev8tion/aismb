import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';

export const runtime = 'edge';

function getConfig() {
  const env = getEnv();
  const email = env.DEMO_LOGIN_EMAIL || env.TEST_EMAIL;
  const password = env.DEMO_LOGIN_PASSWORD || env.TEST_PASSWORD;
  const instance = env.NCB_INSTANCE;
  const apiUrl = env.NCB_AUTH_API_URL;
  const explicitOff = env.DEMO_LOGIN_ENABLED === 'false';
  const hasCreds = Boolean(email && password && instance && apiUrl);
  // Testers get one-click demo whenever the demo account exists, unless explicitly off.
  const enabled = hasCreds && !explicitOff;
  return { enabled, email, password, instance, apiUrl };
}

function transformSetCookie(cookie: string): string {
  const parts = cookie.split(';');
  const nameValue = parts[0].trim();
  const cleanedNameValue = nameValue
    .replace(/^__Secure-better-auth\./, 'better-auth.')
    .replace(/^__Host-better-auth\./, 'better-auth.');
  const attributes = parts.slice(1).map((part) => part.trim()).filter((part) => {
    const lower = part.toLowerCase();
    return !lower.startsWith('domain=') && !lower.startsWith('secure') && !lower.startsWith('samesite=');
  });
  attributes.push('SameSite=Lax');
  return [cleanedNameValue, ...attributes].join('; ');
}

export async function GET() {
  const config = getConfig();
  return NextResponse.json(
    { enabled: Boolean(config.enabled && config.email && config.password && config.instance && config.apiUrl) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: NextRequest) {
  const config = getConfig();
  if (!config.enabled || !config.email || !config.password || !config.instance || !config.apiUrl) {
    return NextResponse.json({ error: 'Demo access is not enabled' }, { status: 404 });
  }

  const url = `${config.apiUrl}/sign-in/email?instance=${encodeURIComponent(config.instance)}`;
  const origin = req.headers.get('origin') || req.nextUrl.origin;
  const upstream = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Database-Instance': config.instance,
      Origin: origin,
    },
    body: JSON.stringify({ email: config.email, password: config.password }),
  });

  const response = new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

  for (const cookie of upstream.headers.getSetCookie?.() || []) {
    response.headers.append('Set-Cookie', transformSetCookie(cookie));
  }

  return response;
}
