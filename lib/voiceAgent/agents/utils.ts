import type OpenAI from 'openai';
import type { ConversationMessage } from '../sessionStorage';

/**
 * Convert internal conversation history to OpenAI message format.
 * Used by all 3 voice agents.
 */
export function historyToMessages(
  history: ConversationMessage[]
): OpenAI.ChatCompletionMessageParam[] {
  return history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));
}
