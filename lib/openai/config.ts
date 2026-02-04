import OpenAI from 'openai';

// Lazy initialization to work in edge runtime
let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// For backwards compatibility
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    return getOpenAIClient()[prop as keyof OpenAI];
  },
});

// Model configurations based on research
export const MODELS = {
  transcription: 'whisper-1', // GPT-4o-mini-transcribe alternative
  chat: 'gpt-4o-mini',        // Best cost/performance for Q&A
  tts: 'tts-1',               // Standard quality TTS
  voice: 'echo',              // Professional, clear voice
} as const;

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  windowMs: 60 * 1000, // 1 minute
};
