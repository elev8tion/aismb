import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
  maxRequestsPerMinute: parseInt(process.env.VOICE_AGENT_RATE_LIMIT || '10'),
  windowMs: 60 * 1000, // 1 minute
};
