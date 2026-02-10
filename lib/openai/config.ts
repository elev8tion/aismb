import OpenAI from 'openai';

/**
 * Create OpenAI client with API key from Cloudflare env
 * Must be called inside request handler with env from getRequestContext()
 */
export function createOpenAI(apiKey: string): OpenAI {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }
  return new OpenAI({ apiKey });
}

// Model configurations
export const MODELS = {
  transcription: 'whisper-1',
  chat: 'gpt-4.1-nano',
  tts: 'gpt-4o-mini-tts',
  voice: 'echo',
} as const;

// Per-token / per-minute costs (single source of truth for cost monitoring)
export const MODEL_COSTS = {
  [MODELS.chat]: { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 },
  [MODELS.tts]: { input: 0.60 / 1_000_000, output: 12.00 / 1_000_000 },
  [MODELS.transcription]: { perMinute: 0.006 },
} as const;

// Token limits for chat completions
export const TOKEN_LIMITS = {
  withTools: 400,
  maxToolRounds: 3,
  roiAgent: 300,
} as const;

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  windowMs: 60 * 1000,
};
