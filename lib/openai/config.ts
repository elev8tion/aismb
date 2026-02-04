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
  chat: 'gpt-4o-mini',
  tts: 'tts-1',
  voice: 'echo',
} as const;

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  windowMs: 60 * 1000,
};
