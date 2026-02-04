/// <reference types="@cloudflare/workers-types" />

// Extend the CloudflareEnv interface defined by @cloudflare/next-on-pages
declare global {
  interface CloudflareEnv {
    OPENAI_API_KEY: string;
    VOICE_SESSIONS: KVNamespace;
    RATE_LIMIT_KV: KVNamespace;
    COST_MONITOR_KV: KVNamespace;
    RESPONSE_CACHE_KV: KVNamespace;
  }
}

export {};
