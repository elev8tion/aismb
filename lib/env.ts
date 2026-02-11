import { getRequestContext } from '@cloudflare/next-on-pages';

// Unified environment accessor for Edge (Cloudflare) and local dev.
// - In production/edge: returns Cloudflare env bindings via getRequestContext().env
// - In local dev or non-edge: falls back to process.env for string values
export function getEnv(): Record<string, unknown> {
  try {
    const { env } = getRequestContext();
    if (env && typeof env === 'object') {
      return env as unknown as Record<string, unknown>;
    }
  } catch {
    // getRequestContext not available — fall back below
  }

  const p = typeof process !== 'undefined' ? process.env : undefined;
  const record: Record<string, unknown> = {};

  if (p) {
    // Core keys used by voice agent and booking flows
    record.OPENAI_API_KEY = p.OPENAI_API_KEY ?? '';

    // CRM / NCB
    record.NCB_INSTANCE = p.NCB_INSTANCE ?? '';
    record.NCB_DATA_API_URL = p.NCB_DATA_API_URL ?? '';
    record.NCB_AUTH_API_URL = p.NCB_AUTH_API_URL ?? '';
    record.NCB_OPENAPI_URL = p.NCB_OPENAPI_URL ?? '';
    record.NCB_SECRET_KEY = p.NCB_SECRET_KEY ?? '';

    // Email / Stripe
    record.EMAILIT_API_KEY = p.EMAILIT_API_KEY ?? '';
    record.STRIPE_SECRET_KEY = p.STRIPE_SECRET_KEY ?? '';
    record.STRIPE_WEBHOOK_SECRET = p.STRIPE_WEBHOOK_SECRET ?? '';
    record.STRIPE_ASSESSMENT_PRICE_ID = p.STRIPE_ASSESSMENT_PRICE_ID ?? '';

    // Site URL mapping for redirects (fallback to NEXT_PUBLIC_SITE_URL)
    record.SITE_URL = p.SITE_URL ?? p.NEXT_PUBLIC_SITE_URL ?? '';
  }

  return record;
}
