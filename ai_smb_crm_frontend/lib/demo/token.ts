import { DEMO_COOKIE } from './session';

const TOKEN_VERSION = 'v1';
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const DEV_SECRET = 'kre8tion-local-demo-session-only';

interface DemoSecretEnv {
  DEMO_SESSION_SECRET?: string;
  NCB_SECRET_KEY?: string;
}

function resolveSecret(env: DemoSecretEnv): string | null {
  const configured = env.DEMO_SESSION_SECRET || env.NCB_SECRET_KEY;
  if (configured) return configured;
  return process.env.NODE_ENV === 'production' ? null : DEV_SECRET;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string): ArrayBuffer | null {
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer as ArrayBuffer;
  } catch {
    return null;
  }
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function readCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === DEMO_COOKIE) return value.join('=') || null;
  }
  return null;
}

export async function createDemoSessionToken(
  env: DemoSecretEnv,
  nowMs = Date.now(),
): Promise<string | null> {
  const secret = resolveSecret(env);
  if (!secret) return null;

  const expiresAt = Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS;
  const nonce = encodeBase64Url(crypto.getRandomValues(new Uint8Array(12)));
  const payload = `${TOKEN_VERSION}.${expiresAt}.${nonce}`;
  const signature = await crypto.subtle.sign('HMAC', await importKey(secret), new TextEncoder().encode(payload));
  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function hasValidDemoSession(
  cookieHeader: string | null | undefined,
  env: DemoSecretEnv,
  nowMs = Date.now(),
): Promise<boolean> {
  const token = readCookie(cookieHeader);
  const secret = resolveSecret(env);
  if (!token || !secret) return false;

  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) return false;

  const expiresAt = Number(parts[1]);
  const nowSeconds = Math.floor(nowMs / 1000);
  if (!Number.isInteger(expiresAt) || expiresAt <= nowSeconds || expiresAt > nowSeconds + SESSION_TTL_SECONDS) {
    return false;
  }

  const signature = decodeBase64Url(parts[3]);
  if (!signature) return false;

  const payload = parts.slice(0, 3).join('.');
  return crypto.subtle.verify(
    'HMAC',
    await importKey(secret),
    signature,
    new TextEncoder().encode(payload),
  );
}

export function setDemoSessionCookie(token: string, secure: boolean): string {
  return [
    `${DEMO_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

export function clearDemoSessionCookie(secure = false): string {
  return [
    `${DEMO_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}
