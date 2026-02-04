/// <reference types="@cloudflare/workers-types" />

// Extend the CloudflareEnv interface defined by @cloudflare/next-on-pages
declare global {
  interface CloudflareEnv {
    OPENAI_API_KEY: string;
    VOICE_SESSIONS: KVNamespace;
  }
}

export {};
