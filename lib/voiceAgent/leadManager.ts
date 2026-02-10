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

/**
 * Create or update a lead in the CRM
 */
export async function syncLeadToCRM(leadData: LeadData, env: Record<string, string>): Promise<NCBRecord | null> {
  if (!leadData.email) return null;

  // 1. Check if lead exists
  const existingLeads = await ncbRequest<NCBRecord[]>('GET', `read/leads`, env, {
    email: leadData.email
  });

  if (existingLeads && existingLeads.length > 0) {
    // 2. Update existing lead
    const leadId = existingLeads[0].id;
    console.log(`Updating existing lead ${leadId} (${leadData.email})`);
    return await ncbRequest<NCBRecord>('PUT', `update/leads/${leadId}`, env, {
      ...leadData,
      updated_at: new Date().toISOString()
    });
  } else {
    // 3. Create new lead
    console.log(`Creating new lead for ${leadData.email}`);
    return await ncbRequest<NCBRecord>('POST', 'create/leads', env, {
      ...leadData,
      status: 'new',
      created_at: new Date().toISOString()
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
 * Sync ROI Calculation data to CRM
 */
export async function syncROICalcToCRM(data: {
  email: string;
  industry: string;
  employeeCount: string;
  hourlyRate: number;
  selectedTier: string;
  calculations: Record<string, unknown>;
}, env: Record<string, string>): Promise<NCBRecord | null> {
  // First, ensure the lead exists or update it
  await syncLeadToCRM({
    email: data.email,
    industry: data.industry,
    employeeCount: data.employeeCount,
    source: 'ROI Calculator'
  }, env);

  // Then save the ROI calculation linked to the lead if possible
  return await ncbRequest<NCBRecord>('POST', 'create/roi_calculations', env, {
    email: data.email,
    industry: data.industry,
    employee_count: data.employeeCount,
    hourly_rate: data.hourlyRate,
    selected_tier: data.selectedTier,
    calculations: data.calculations,
    created_at: new Date().toISOString()
  });
}

/**
 * Sync Booking data to CRM and update lead status
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
}, env: Record<string, string>): Promise<boolean> {
  await syncLeadToCRM({
    email: data.email,
    firstName: data.name.split(' ')[0],
    lastName: data.name.split(' ').slice(1).join(' '),
    phone: data.phone,
    companyName: data.companyName,
    industry: data.industry,
    employeeCount: data.employeeCount,
    notes: `Booked strategy call for ${data.date} at ${data.time}. Challenge: ${data.challenge || 'None'}`,
    source: 'Calendar Booking'
  }, env);

  return true;
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
