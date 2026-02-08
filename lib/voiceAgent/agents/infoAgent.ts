/**
 * Info Agent — answers business Q&A (pricing, services, process, FAQ, case studies)
 *
 * No tools. Uses knowledge base + question classifier for dynamic token limits.
 */

import type OpenAI from 'openai';
import { INFO_AGENT_PROMPT, SPANISH_INSTRUCTION, HIGH_VALUE_NUDGE } from './prompts';
import { INFO_KNOWLEDGE_BASE } from '../knowledgeBase';
import { classifyQuestion } from '../questionClassifier';
import { MODELS } from '@/lib/openai/config';
import type { ConversationMessage } from '../sessionStorage';

export interface InfoAgentOptions {
  language?: 'en' | 'es';
  leadScoreTier?: string;
}

export async function runInfoAgent(
  openai: OpenAI,
  question: string,
  history: ConversationMessage[],
  options: InfoAgentOptions = {},
): Promise<string> {
  const classification = classifyQuestion(question);
  const messages: OpenAI.ChatCompletionMessageParam[] = [];

  // Language instruction
  if (options.language === 'es') {
    messages.push({ role: 'system', content: SPANISH_INSTRUCTION });
  }

  // Agent system prompt
  let prompt = INFO_AGENT_PROMPT;
  if (options.leadScoreTier === 'high') {
    prompt += '\n' + HIGH_VALUE_NUDGE;
  }
  messages.push({ role: 'system', content: prompt });

  // Knowledge base (trimmed — no tool-use guidelines)
  messages.push({ role: 'system', content: INFO_KNOWLEDGE_BASE });

  // Conversation history
  messages.push(...history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  })));

  // Current question
  messages.push({ role: 'user', content: question });

  const completion = await openai.chat.completions.create({
    model: MODELS.chat,
    messages,
    temperature: 0.7,
    max_tokens: classification.maxTokens,
  });

  return completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
}
