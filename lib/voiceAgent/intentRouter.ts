/**
 * Deterministic Intent Router
 *
 * Keyword + regex scoring function that routes user messages to the correct
 * specialist agent. Zero latency, zero cost — no LLM call.
 */

import type { ConversationMessage } from './sessionStorage';

export type Intent = 'management' | 'booking' | 'roi' | 'info';

export interface IntentResult {
  intent: Intent;
  confidence: number;
}

// ─── Signal patterns ────────────────────────────────────────────────────────

const MANAGEMENT_SIGNALS = [
  'status of my leads',
  'high priority leads',
  'leads report',
  'daily summary',
  'how are we doing',
  'lead dashboard',
  'analytics',
];

const BOOKING_KEYWORDS = [
  'book',
  'schedule',
  'available',
  'appointment',
  'meeting',
  'consultation',
  'assessment',
  'reserve',
  'slot',
  'calendar',
  // Spanish booking keywords
  'agendar',
  'reservar',
  'cita',
  'disponible',
  'reunión',
  'reunion',
];

const BOOKING_SCHEDULING_KEYWORDS = [
  'morning',
  'afternoon',
  'evening',
  'am',
  'pm',
  'o\'clock',
  'oclock',
];

const DAY_NAMES = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'tomorrow', 'next week', 'this week',
  // Spanish
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
  'mañana',
];

const ROI_SIGNALS = [
  'roi',
  'savings',
  'calculate',
  'payback',
  'hours saved',
  'return on investment',
  'cost savings',
  'how much can i save',
  'how much would i save',
  'what would i save',
];

// Date patterns: "Feb 12", "February 12", "2/12", "2026-02-12"
const DATE_PATTERN = /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2})\b/i;

// Patterns that indicate the assistant was asking for booking details
const BOOKING_CONTINUATION_PATTERNS = [
  /what(?:'s| is) your (?:name|email|phone)/i,
  /(?:could|can) (?:i|you) (?:get|have) your (?:name|email)/i,
  /what (?:name|email)/i,
  /(?:which|what) (?:date|time|day)/i,
  /(?:preferred|preferred) (?:date|time)/i,
  /(?:morning or afternoon|am or pm)/i,
  /(?:what|which) (?:slot|time) (?:works|would you)/i,
  /let me (?:check|look up) (?:available|availability)/i,
];

// Info-only signals that override weak booking signals
const INFO_OVERRIDE_KEYWORDS = [
  'how much does',
  'what does',
  'cost of',
  'price of',
  'pricing',
  'what is',
  'what are',
  'tell me about',
  'explain',
  'how does',
  'what\'s included',
  'what comes with',
  'difference between',
];

/**
 * Classify user intent using keyword + pattern scoring.
 * No LLM call — pure deterministic function.
 */
export function classifyIntent(
  question: string,
  conversationHistory: ConversationMessage[],
): IntentResult {
  const q = question.toLowerCase().trim();

  // ─── 1. Management (highest priority — owner-only commands) ──────────
  for (const signal of MANAGEMENT_SIGNALS) {
    if (q.includes(signal)) {
      return { intent: 'management', confidence: 1.0 };
    }
  }

  // ─── 2. Booking continuation (check if last assistant msg asked for details) ──
  const lastAssistantMsg = getLastAssistantMessage(conversationHistory);
  if (lastAssistantMsg) {
    for (const pattern of BOOKING_CONTINUATION_PATTERNS) {
      if (pattern.test(lastAssistantMsg)) {
        return { intent: 'booking', confidence: 0.9 };
      }
    }
  }

  // ─── 3. Score booking vs info vs roi signals ──────────────────────────
  let bookingScore = 0;
  let roiScore = 0;
  let infoOverride = false;

  // Booking keywords
  for (const kw of BOOKING_KEYWORDS) {
    if (q.includes(kw)) bookingScore += 2;
  }

  // Scheduling keywords (time-of-day)
  for (const kw of BOOKING_SCHEDULING_KEYWORDS) {
    if (q.includes(kw)) bookingScore += 1.5;
  }

  // Day names are strong scheduling signals
  for (const day of DAY_NAMES) {
    if (q.includes(day)) bookingScore += 2;
  }

  // Date pattern match
  if (DATE_PATTERN.test(q)) bookingScore += 2;

  // ROI signals
  for (const signal of ROI_SIGNALS) {
    if (q.includes(signal)) roiScore += 2;
  }

  // Task-hour context (e.g. "15 employees", "20 hours a week")
  if (/\d+\s*(?:employees?|staff|workers|people)/i.test(q)) roiScore += 1;
  if (/\d+\s*(?:hours?(?:\s*(?:a|per)\s*week)?)/i.test(q)) roiScore += 1;

  // Info override check
  for (const kw of INFO_OVERRIDE_KEYWORDS) {
    if (q.includes(kw)) {
      infoOverride = true;
      break;
    }
  }

  // ─── 4. Ambiguity resolution ──────────────────────────────────────────
  // If booking + info both present but no strong scheduling keyword → info
  if (bookingScore > 0 && infoOverride && bookingScore < 3) {
    return { intent: 'info', confidence: 0.7 };
  }

  // Clear booking intent
  if (bookingScore >= 2) {
    return { intent: 'booking', confidence: Math.min(0.95, 0.5 + bookingScore * 0.1) };
  }

  // Clear ROI intent
  if (roiScore >= 2) {
    return { intent: 'roi', confidence: Math.min(0.95, 0.5 + roiScore * 0.1) };
  }

  // ─── 5. Default to info ───────────────────────────────────────────────
  return { intent: 'info', confidence: 0.6 };
}

function getLastAssistantMessage(history: ConversationMessage[]): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'assistant') {
      return history[i].content.toLowerCase();
    }
  }
  return null;
}
