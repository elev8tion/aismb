/**
 * ROI Agent — handles ROI calculations
 *
 * Gathers inputs conversationally, calls calculate_roi, presents results.
 * tool_choice: 'auto' — can respond conversationally to gather info first.
 */

import type OpenAI from 'openai';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import { ROI_AGENT_PROMPT, ROI_AGENT_PROMPT_ES } from './prompts';
import { ROI_TOOLS, executeTool, type ToolContext } from '../tools';
import { MODELS, TOKEN_LIMITS, buildChatParams } from '@/lib/openai/config';
import { historyToMessages } from './utils';
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

  // Agent system prompt — native language version
  messages.push({ role: 'system', content: options.language === 'es' ? ROI_AGENT_PROMPT_ES : ROI_AGENT_PROMPT });

  // Conversation history
  messages.push(...historyToMessages(history));

  // Current question
  messages.push({ role: 'user', content: question });

  const completion = await openai.chat.completions.create({
    ...buildChatParams(MODELS.chat, messages, {
      temperature: 0.7,
      max_tokens: TOKEN_LIMITS.roiAgent,
      tools: ROI_TOOLS,
    }),
    tool_choice: 'auto',
  } as ChatCompletionCreateParamsNonStreaming);

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
      ...buildChatParams(MODELS.chat, messages, {
        temperature: 0.7,
        max_tokens: TOKEN_LIMITS.roiAgent,
        tools: ROI_TOOLS,
      }),
      tool_choice: 'auto',
    } as ChatCompletionCreateParamsNonStreaming);
    responseMessage = followUp.choices[0]?.message;
  }

  return responseMessage?.content || (options.language === 'es' ? 'Lo siento, no pude calcular el ROI. Por favor intente de nuevo.' : 'I apologize, I could not calculate the ROI.');
}
