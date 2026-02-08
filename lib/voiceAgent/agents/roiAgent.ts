/**
 * ROI Agent — handles ROI calculations
 *
 * Gathers inputs conversationally, calls calculate_roi, presents results.
 * tool_choice: 'auto' — can respond conversationally to gather info first.
 */

import type OpenAI from 'openai';
import { ROI_AGENT_PROMPT, SPANISH_INSTRUCTION } from './prompts';
import { ROI_TOOLS, executeTool, type ToolContext } from '../tools';
import { MODELS, TOKEN_LIMITS } from '@/lib/openai/config';
import type { ConversationMessage } from '../sessionStorage';

export interface ROIAgentOptions {
  language?: 'en' | 'es';
}

export async function runROIAgent(
  openai: OpenAI,
  question: string,
  history: ConversationMessage[],
  toolCtx: ToolContext,
  options: ROIAgentOptions = {},
): Promise<string> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [];

  // Language instruction
  if (options.language === 'es') {
    messages.push({ role: 'system', content: SPANISH_INSTRUCTION });
  }

  // Agent system prompt (no knowledge base)
  messages.push({ role: 'system', content: ROI_AGENT_PROMPT });

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
    max_tokens: TOKEN_LIMITS.roiAgent,
    tools: ROI_TOOLS,
    tool_choice: 'auto',
  });

  let responseMessage = completion.choices[0]?.message;
  let toolRound = 0;

  while (responseMessage?.tool_calls?.length && toolRound < TOKEN_LIMITS.maxToolRounds) {
    toolRound++;
    messages.push(responseMessage as OpenAI.ChatCompletionMessageParam);

    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall.type !== 'function') continue;
      const args = JSON.parse(toolCall.function.arguments);
      let result: string;
      try {
        result = await executeTool(toolCall.function.name, args, toolCtx);
      } catch (err) {
        result = JSON.stringify({ error: err instanceof Error ? err.message : 'Tool failed' });
      }
      messages.push({ role: 'tool', tool_call_id: toolCall.id, content: result });
    }

    const followUp = await openai.chat.completions.create({
      model: MODELS.chat,
      messages,
      temperature: 0.7,
      max_tokens: TOKEN_LIMITS.roiAgent,
      tools: ROI_TOOLS,
      tool_choice: 'auto',
    });
    responseMessage = followUp.choices[0]?.message;
  }

  return responseMessage?.content || 'I apologize, I could not calculate the ROI.';
}
