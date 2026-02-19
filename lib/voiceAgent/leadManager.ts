/**
 * Lead Manager - Handles lead extraction and CRM integration
 *
 * This utility identifies lead information from conversation history
 * and synchronizes it with the NCB CRM database.
 */

import { ncbRequest } from '@/lib/ncb/client';

export interface LeadData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  employeeCount?: string;
  source?: string;
  sourceDetail?: string;
  notes?: string;
  // Rich CRM fields populated from voice agent analysis
  sentiment?: string;
  intents?: string;
  pain_points?: string;
  objections?: string;
  outcome?: string;
  qualified_score?: number;
}

interface NCBRecord {
  id: string;
  email?: string;
  industry?: string;
  employeeCount?: string;
  notes?: string;
  sentiment?: string;
  intents?: string;
  pain_points?: string;
  objections?: string;
  outcome?: string;
  qualified_score?: number;
  [key: string]: unknown;
}

// NCB leads table valid enum values
const NCB_INDUSTRY_ENUM = ['hvac', 'plumbing', 'property management', 'construction', 'retail', 'e-commerce', 'professional services', 'real estate', 'other'] as const;
const NCB_EMPLOYEE_COUNT_ENUM = ['1-5', '5-10', '10-25', '25-50', '50+'] as const;

/**
 * Normalize a free-text industry string → valid NCB industry enum value.
 * Falls back to "other" for unrecognized values.
 */
function normalizeIndustry(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (NCB_INDUSTRY_ENUM.includes(s as typeof NCB_INDUSTRY_ENUM[number])) return s;
  if (/hvac|heat|cool|air.cond/i.test(s)) return 'hvac';
  if (/plumb/i.test(s)) return 'plumbing';
  if (/property.manage|prop.mgmt|prop.manage/i.test(s)) return 'property management';
  if (/construct|contractor|builder|build|trades?|electrical|electrician|roofi/i.test(s)) return 'construction';
  if (/retail|shop|store|boutique/i.test(s)) return 'retail';
  if (/e.?commerce|ecommerce|online.store|shopify/i.test(s)) return 'e-commerce';
  if (/real.estate|realtor|broker|mortgage|propery(?!.manage)/i.test(s)) return 'real estate';
  if (/agency|consult|legal|law|account|market|PR\b|staffing|recruit|insurance|financial|finance/i.test(s)) return 'professional services';
  return 'other';
}

/**
 * Normalize a free-text employee count → valid NCB employee_count enum value.
 * Handles ranges ("5-10"), plain numbers ("9"), and labels ("50+").
 */
function normalizeEmployeeCount(raw: string): string | undefined {
  const s = raw.trim();
  // Already a valid enum value
  if (NCB_EMPLOYEE_COUNT_ENUM.includes(s as typeof NCB_EMPLOYEE_COUNT_ENUM[number])) return s;
  // Parse a plain number
  const n = parseInt(s, 10);
  if (!isNaN(n)) {
    if (n <= 5)  return '1-5';
    if (n <= 10) return '5-10';
    if (n <= 25) return '10-25';
    if (n <= 50) return '25-50';
    return '50+';
  }
  // Parse a range like "6-12" — use the upper bound
  const rangeMatch = s.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const upper = parseInt(rangeMatch[2], 10);
    if (upper <= 5)  return '1-5';
    if (upper <= 10) return '5-10';
    if (upper <= 25) return '10-25';
    if (upper <= 50) return '25-50';
    return '50+';
  }
  // "50+" style already handled above; "100+" or similar
  if (/50\+|51\+|100\+|\blarge\b|\benter/i.test(s)) return '50+';
  return undefined; // omit if unrecognizable
}

/**
 * Map LeadData (camelCase) → NCB leads table payload (snake_case).
 * Only includes fields that exist in the NCB schema.
 * NCB leads columns: id, user_id, email, first_name, last_name, phone,
 *   company_name, source, source_detail, industry, employee_count, status, lead_score
 *
 * industry and employee_count are normalized to valid NCB enum values.
 */
function toNCBLeadPayload(leadData: Partial<LeadData>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (leadData.email !== undefined)         payload.email          = leadData.email;
  if (leadData.firstName !== undefined)     payload.first_name     = leadData.firstName;
  if (leadData.lastName !== undefined)      payload.last_name      = leadData.lastName;
  if (leadData.phone !== undefined)         payload.phone          = leadData.phone;
  if (leadData.companyName !== undefined)   payload.company_name   = leadData.companyName;
  // Normalize to valid NCB enum values before sending
  if (leadData.industry !== undefined)      payload.industry       = normalizeIndustry(leadData.industry);
  if (leadData.employeeCount !== undefined) {
    const normalized = normalizeEmployeeCount(leadData.employeeCount);
    if (normalized !== undefined)           payload.employee_count = normalized;
  }
  if (leadData.source !== undefined)        payload.source         = leadData.source;
  if (leadData.sourceDetail !== undefined)  payload.source_detail  = leadData.sourceDetail;
  // qualified_score maps to lead_score in NCB schema
  if (leadData.qualified_score !== undefined) payload.lead_score   = leadData.qualified_score;
  // sentiment, intents, pain_points, objections, outcome, notes are not NCB columns — omitted
  return payload;
}

/**
 * Create or update a lead in the CRM
 */
export async function syncLeadToCRM(leadData: LeadData, env: Record<string, string>): Promise<NCBRecord | null> {
  if (!leadData.email) return null;

  const payload = toNCBLeadPayload(leadData);

  // 1. Check if lead exists
  const existingLeads = await ncbRequest<NCBRecord[]>('GET', `read/leads`, env, {
    email: leadData.email
  });

  if (existingLeads && existingLeads.length > 0) {
    // 2. Update existing lead — PUT returns { status: "success" } with no id,
    //    so return the pre-fetched record (which has the correct id).
    const existingLead = existingLeads[0];
    await ncbRequest<NCBRecord>('PUT', `update/leads/${existingLead.id}`, env, payload);
    return existingLead;
  } else {
    // 3. Create new lead
    return await ncbRequest<NCBRecord>('POST', 'create/leads', env, {
      ...payload,
      user_id: env.NCB_DEFAULT_USER_ID || 'GlF8YbrMWMq3YsUF3jlLovv3VtKsWyQp',
      status: 'new',
    });
  }
}

/**
 * Retrieve lead data by email
 */
export async function getLeadByEmail(email: string, env: Record<string, string>): Promise<NCBRecord | null> {
  const leads = await ncbRequest<NCBRecord[]>('GET', `read/leads`, env, {
    email: email.toLowerCase()
  });
  return (leads && leads.length > 0) ? leads[0] : null;
}

/**
 * Sync Booking data to CRM and update lead status.
 * Returns the NCB lead ID on success, null on failure.
 */
export async function syncBookingToCRM(data: {
  email: string;
  name: string;
  phone?: string;
  date: string;
  time: string;
  timezone: string;
  companyName?: string;
  industry?: string;
  employeeCount?: string;
  challenge?: string;
  leadScore?: number;
}, env: Record<string, string>): Promise<string | null> {
  try {
    const record = await syncLeadToCRM({
      email: data.email,
      firstName: data.name.split(' ')[0],
      lastName: data.name.split(' ').slice(1).join(' '),
      phone: data.phone,
      companyName: data.companyName,
      industry: data.industry,
      employeeCount: data.employeeCount,
      source: 'other',
      sourceDetail: `${data.date} at ${data.time}${data.challenge ? ` — ${data.challenge}` : ''}`,
      qualified_score: data.leadScore,
    }, env);

    return record ? String(record.id) : null;
  } catch (err) {
    console.error('[syncBookingToCRM] unexpected error:', err);
    return null;
  }
}

// ─── Keyword patterns for extraction ─────────────────────────────────────────

const PAIN_POINT_PATTERNS = [
  /(?:waste|wasting|losing)\s+(?:time|hours|money)/i,
  /too much (?:time|paperwork|manual)/i,
  /(?:can't|cannot|don't) keep up/i,
  /(?:overwhelmed|understaffed|short-?staffed|burned out)/i,
  /(?:scheduling|dispatching|invoicing|billing)\s+(?:is|takes|nightmare|headache|mess)/i,
  /no-?shows?/i,
  /(?:missed|missing|late)\s+(?:calls?|appointments?|follow-?ups?)/i,
  /(?:customer|client)\s+(?:complaints?|frustrated|unhappy)/i,
  /(?:slow|inefficient|disorganized|outdated)\s+(?:process|system|workflow)/i,
  /(?:can't|cannot)\s+(?:scale|grow|keep track)/i,
];

const OBJECTION_PATTERNS = [
  /(?:too (?:expensive|costly|much)|can't afford|budget|price)/i,
  /(?:not sure|don't know|skeptical|sounds? too good)/i,
  /(?:not ready|maybe later|need to think|give me time)/i,
  /(?:tried (?:something|this) before|didn't work|failed)/i,
  /(?:my team|staff|employees?) (?:won't|wouldn't|can't)\s+(?:use|adopt|learn)/i,
  /(?:what if|what happens if|guarantee|risk)/i,
];

const POSITIVE_SIGNALS = [
  'excited', 'interested', 'love', 'amazing', 'great', 'perfect',
  'sounds good', 'let\'s do it', 'sign me up', 'ready', 'when can we start',
  'impressed', 'exactly what', 'need this',
];

const NEGATIVE_SIGNALS = [
  'not interested', 'no thanks', 'waste of time', 'scam', 'don\'t need',
  'too expensive', 'pass', 'not for me', 'don\'t think so',
];

/**
 * Extract lead data from conversation history using simple pattern matching
 */
export function extractLeadInfo(messages: { role: string, content: string }[]): Partial<LeadData> {
  const info: Partial<LeadData> = {};

  const conversation = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  const conversationLower = conversation.toLowerCase();

  // Email extraction
  const emailMatch = conversation.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) info.email = emailMatch[0].toLowerCase();

  // Industry detection (basic keywords)
  const industries = ['hvac', 'plumbing', 'construction', 'real estate', 'retail', 'property management', 'legal'];
  for (const industry of industries) {
    if (conversationLower.includes(industry)) {
      info.industry = industry.charAt(0).toUpperCase() + industry.slice(1);
      break;
    }
  }

  // Employee count detection
  const empMatch = conversation.match(/\b(5-10|10-25|25-50|50\+)\b/);
  if (empMatch) info.employeeCount = empMatch[0];

  // Sentiment detection
  let positiveCount = 0;
  let negativeCount = 0;
  for (const signal of POSITIVE_SIGNALS) {
    if (conversationLower.includes(signal)) positiveCount++;
  }
  for (const signal of NEGATIVE_SIGNALS) {
    if (conversationLower.includes(signal)) negativeCount++;
  }
  if (positiveCount > 0 || negativeCount > 0) {
    info.sentiment = positiveCount > negativeCount ? 'positive'
      : negativeCount > positiveCount ? 'negative'
      : 'neutral';
  }

  // Pain point extraction
  const painPoints: string[] = [];
  for (const pattern of PAIN_POINT_PATTERNS) {
    const match = conversation.match(pattern);
    if (match) painPoints.push(match[0]);
  }
  if (painPoints.length > 0) {
    info.pain_points = painPoints.slice(0, 5).join('; ');
  }

  // Objection extraction
  const objections: string[] = [];
  for (const pattern of OBJECTION_PATTERNS) {
    const match = conversation.match(pattern);
    if (match) objections.push(match[0]);
  }
  if (objections.length > 0) {
    info.objections = objections.slice(0, 5).join('; ');
  }

  return info;
}
