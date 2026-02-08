import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type OpenAI from 'openai';
import { createOpenAI, MODELS, TOKEN_LIMITS } from '@/lib/openai/config';
import { KNOWLEDGE_BASE } from '@/lib/voiceAgent/knowledgeBase';
import { classifyQuestion } from '@/lib/voiceAgent/questionClassifier';
import { validateQuestion, detectPromptInjection } from '@/lib/security/requestValidator';
import { getSessionStorage } from '@/lib/voiceAgent/sessionStorage';
import { extractLeadInfo, syncLeadToCRM } from '@/lib/voiceAgent/leadManager';
import { calculateLeadScore } from '@/lib/voiceAgent/leadScorer';
import { getHighPriorityLeadsReport, getDailySummary } from '@/lib/voiceAgent/analyticsAgent';
import { VOICE_AGENT_TOOLS, executeTool, type ToolContext } from '@/lib/voiceAgent/tools';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Get OpenAI API key and KV namespace from Cloudflare env
  const { env } = getRequestContext();
  const openai = createOpenAI(env.OPENAI_API_KEY);

  try {
    const body = await request.json();
    console.log('Chat API received:', body);

    const { question, sessionId, language } = body as {
      question: string;
      sessionId: string;
      language?: 'en' | 'es';
    };

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Input validation
    const validation = validateQuestion(question);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitizedQuestion = validation.sanitized!;
    const q = sanitizedQuestion.toLowerCase();

    // 🛠️ MANAGEMENT INTENT DETECTION (For Solo Operator)
    if (q.includes('status of my leads') || q.includes('high priority leads') || q.includes('leads report')) {
      console.log('📈 Management Intent detected: High Priority Report');
      const report = await getHighPriorityLeadsReport(env as unknown as Record<string, string>);
      return NextResponse.json({ response: report, success: true, duration: Date.now() - startTime });
    }

    if (q.includes('daily summary') || q.includes('how are we doing today')) {
      console.log('📈 Management Intent detected: Daily Summary');
      const summary = await getDailySummary(env as unknown as Record<string, string>);
      return NextResponse.json({ response: summary, success: true, duration: Date.now() - startTime });
    }

    const injection = detectPromptInjection(sanitizedQuestion);
    if (injection.detected) console.warn(`⚠️ Possible prompt injection: ${injection.pattern}`);

    // Classify question
    const classification = classifyQuestion(sanitizedQuestion);
    const sessionStorage = getSessionStorage(env.VOICE_SESSIONS);
    const conversationHistory = await sessionStorage.getConversationHistory(sessionId);

    // 🔍 LEAD PROFILING & SCORING (Pre-response analysis)
    const leadInfo = extractLeadInfo([...conversationHistory, { role: 'user', content: sanitizedQuestion }]);
    const leadScore = calculateLeadScore(leadInfo);
    
    // Build messages
    const messages: Array<OpenAI.ChatCompletionMessageParam> = [];

    // Language instruction
    if (language === 'es') {
      messages.push({
        role: 'system',
        content: 'INSTRUCCIÓN OBLIGATORIA DE IDIOMA: Eres un asistente que SOLO responde en español. Toda tu comunicación debe ser en español natural. Mantén etiquetas: [ACTION:SCROLL_TO_...].',
      });
    }

    // Dynamic Strategist Instructions based on Score
    let strategistPrompt = `
STRATEGIST MODE: You are an AI Business Strategist for AI KRE8TION Partners.
Your goal is to identify AI opportunities. 
1. Ask about industry and size if unknown.
2. Suggest the ROI calculator if you've identified needs.
`;

    if (leadScore.tier === 'high') {
      strategistPrompt += `
CRITICAL: This lead is a HIGH-VALUE MATCH. 
Focus your response on booking a 'Comprehension Meeting' immediately. 
Use a persuasive, consultative tone. Mention that for businesses of their scale, 
the ROI is typically 300%+. [ACTION:SCROLL_TO_BOOKING]
`;
    } else {
      strategistPrompt += `3. Keep it conversational and concise.`;
    }

    messages.push({ role: 'system', content: strategistPrompt });
    messages.push({ role: 'system', content: KNOWLEDGE_BASE });
    messages.push(...conversationHistory);
    messages.push({ role: 'user', content: sanitizedQuestion });

    // Call OpenAI with tool support
    const toolCtx: ToolContext = { env: env as unknown as Record<string, string> };

    const completion = await openai.chat.completions.create({
      model: MODELS.chat,
      messages,
      temperature: 0.7,
      max_tokens: TOKEN_LIMITS.withTools,
      tools: VOICE_AGENT_TOOLS,
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
        max_tokens: TOKEN_LIMITS.withTools,
        tools: VOICE_AGENT_TOOLS,
        tool_choice: 'auto',
      });
      responseMessage = followUp.choices[0]?.message;
    }

    const response = responseMessage?.content || 'I apologize, I could not generate a response.';

    // Save and Sync
    await sessionStorage.addMessage(sessionId, 'user', sanitizedQuestion);
    await sessionStorage.addMessage(sessionId, 'assistant', response);
    
    if (leadInfo.email) {
      console.log(`🎯 Syncing Scored Lead (${leadScore.score}/100):`, leadInfo.email);
      syncLeadToCRM({
        ...leadInfo,
        email: leadInfo.email!,
        source: 'Voice Agent',
        sourceDetail: `${language === 'es' ? 'Spanish' : 'English'} (${leadScore.tier} priority)`,
        notes: `AI Scored as ${leadScore.tier} (${leadScore.score}/100). Factors: ${leadScore.factors.join(', ')}`
      }, env as unknown as Record<string, string>).catch(err => console.error('Failed to sync lead:', err));
    }

    const duration = Date.now() - startTime;
    return NextResponse.json({ response, success: true, duration });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

export const runtime = 'edge';
export const maxDuration = 30;
