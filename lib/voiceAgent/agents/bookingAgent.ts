/**
 * Booking Agent — handles ALL scheduling (consultations and assessments)
 *
 * Uses tool_choice: 'required' on first call so the LLM physically cannot
 * skip availability checks. The respond_to_user tool is the escape valve
 * for conversational questions ("What's your email?").
 */

import type OpenAI from 'openai';
import { BOOKING_AGENT_PROMPT, SPANISH_INSTRUCTION } from './prompts';
import { BOOKING_TOOLS, executeTool, type ToolContext } from '../tools';
import { MODELS, TOKEN_LIMITS } from '@/lib/openai/config';

/** Booking tools WITHOUT respond_to_user — used on first call to force availability check */
const AVAILABILITY_ONLY_TOOLS = BOOKING_TOOLS.filter(
  (t) => t.type === 'function' && t.function.name !== 'respond_to_user',
);
import type { ConversationMessage } from '../sessionStorage';

export interface BookingAgentOptions {
  language?: 'en' | 'es';
}

export async function runBookingAgent(
  openai: OpenAI,
  question: string,
  history: ConversationMessage[],
  toolCtx: ToolContext,
  options: BookingAgentOptions = {},
): Promise<string> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [];

  // Language instruction
  if (options.language === 'es') {
    messages.push({ role: 'system', content: SPANISH_INSTRUCTION });
  }

  // Agent system prompt (no knowledge base — saves ~575 lines of tokens)
  messages.push({ role: 'system', content: BOOKING_AGENT_PROMPT });

  // Conversation history
  messages.push(...history.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  })));

  // Current question
  messages.push({ role: 'user', content: question });

  // First call: tool_choice 'required' with ONLY availability/booking tools
  // respond_to_user is excluded so the LLM cannot bail out — it MUST check availability
  const completion = await openai.chat.completions.create({
    model: MODELS.chat,
    messages,
    temperature: 0.5,
    max_tokens: TOKEN_LIMITS.withTools,
    tools: AVAILABILITY_ONLY_TOOLS,
    tool_choice: 'required',
  });

  let responseMessage = completion.choices[0]?.message;
  let toolRound = 0;

  // Tool execution loop
  while (responseMessage?.tool_calls?.length && toolRound < TOKEN_LIMITS.maxToolRounds) {
    toolRound++;

    // Check if respond_to_user was called — return the message directly
    const respondCall = responseMessage.tool_calls.find(
      (tc) => tc.type === 'function' && tc.function.name === 'respond_to_user',
    );
    if (respondCall && respondCall.type === 'function') {
      const args = JSON.parse(respondCall.function.arguments);
      return (args.message as string) || 'How can I help with your booking?';
    }

    // Execute all other tool calls
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

    // Follow-up calls use tool_choice 'auto' so the LLM can respond with text
    const followUp = await openai.chat.completions.create({
      model: MODELS.chat,
      messages,
      temperature: 0.5,
      max_tokens: TOKEN_LIMITS.withTools,
      tools: BOOKING_TOOLS,
      tool_choice: 'auto',
    });
    responseMessage = followUp.choices[0]?.message;
  }

  return responseMessage?.content || 'I apologize, I could not process your booking request.';
}
