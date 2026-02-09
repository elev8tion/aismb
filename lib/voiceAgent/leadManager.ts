/**
 * Lead Manager - Handles lead extraction and CRM integration
 *
 * This utility identifies lead information from conversation history
 * and synchronizes it with the NCB CRM database.
 */

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
  lead_score?: number;
  voice_session_id?: string;
  roi_calculation_id?: string;
}

interface NCBRecord {
  id: string;
  email?: string;
  industry?: string;
  employeeCount?: string;
  notes?: string;
  [key: string]: unknown;
}

/**
 * NCB API Utility for server-side CRM operations
 */
async function ncbRequest<T>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  env: Record<string, string>,
  body?: Record<string, unknown>
): Promise<T | null> {
  const instance = env.NCB_INSTANCE;
  const openApiUrl = env.NCB_OPENAPI_URL;
  const secretKey = env.NCB_SECRET_KEY;

  if (!instance || !openApiUrl || !secretKey) {
    console.error('Missing NCB environment variables');
    return null;
  }

  const url = `${openApiUrl}/${path}?Instance=${instance}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`NCB API Error (${path}):`, res.status, errorText);
      return null;
    }

    const result = (await res.json()) as { data?: T };
    return (result.data || result) as T;
  } catch (error) {
    console.error(`NCB API Exception (${path}):`, error);
    return null;
  }
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
  timeOnCalculator?: number;
  adjustmentsCount?: number;
  reportSentAt?: string;
}, env: Record<string, string>): Promise<NCBRecord | null> {
  // First, ensure the lead exists or update it
  await syncLeadToCRM({
    email: data.email,
    industry: data.industry,
    employeeCount: data.employeeCount,
    source: 'ROI Calculator'
  }, env);

  // Then save the ROI calculation linked to the lead if possible
  const record: Record<string, unknown> = {
    email: data.email,
    industry: data.industry,
    employee_count: data.employeeCount,
    hourly_rate: data.hourlyRate,
    selected_tier: data.selectedTier,
    calculations: data.calculations,
  };
  if (data.timeOnCalculator !== undefined) record.time_on_calculator = data.timeOnCalculator;
  if (data.adjustmentsCount !== undefined) record.adjustments_count = data.adjustmentsCount;
  if (data.reportSentAt) record.report_sent_at = data.reportSentAt;

  const roiResult = await ncbRequest<NCBRecord>('POST', 'create/roi_calculations', env, record);

  // Link ROI calculation back to the lead (FK: roi_calculation_id)
  if (roiResult && roiResult.id) {
    const lead = await getLeadByEmail(data.email, env);
    if (lead) {
      await ncbRequest('PUT', `update/leads/${lead.id}`, env, {
        roi_calculation_id: roiResult.id,
      });
    }
  }

  return roiResult;
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
  bookingId?: number | string;
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

  // Link booking back to the lead (FK: booking_id)
  if (data.bookingId) {
    const lead = await getLeadByEmail(data.email, env);
    if (lead) {
      await ncbRequest('PUT', `update/leads/${lead.id}`, env, {
        booking_id: data.bookingId,
      });
    }
  }

  return true;
}

/**
 * Extract lead data from conversation history using pattern matching.
 * Scans all user messages for email, name, phone, company, industry, and employee count.
 */
export function extractLeadInfo(messages: { role: string, content: string }[]): Partial<LeadData> {
  const info: Partial<LeadData> = {};

  const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
  const conversation = userMessages.join(' ');
  const conversationLower = conversation.toLowerCase();

  // Email extraction
  const emailMatch = conversation.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) info.email = emailMatch[0].toLowerCase();

  // Name extraction — "my name is X", "I'm X", "this is X", "call me X"
  const namePatterns = [
    /(?:my name is|i'm|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:^|\.\s+)([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:here|speaking)/i,
  ];
  for (const pattern of namePatterns) {
    for (const msg of userMessages) {
      const match = msg.match(pattern);
      if (match && match[1]) {
        const parts = match[1].trim().split(/\s+/);
        info.firstName = parts[0];
        if (parts.length > 1) info.lastName = parts.slice(1).join(' ');
        break;
      }
    }
    if (info.firstName) break;
  }

  // Phone extraction — 10-digit US numbers with optional formatting
  const phonePatterns = [
    /(?:phone|number|cell|mobile|call me at|reach me at|text me at)\s*(?:is\s*)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/i,
    /\b(\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4})\b/,
    /\b(\d{10})\b/,
  ];
  for (const pattern of phonePatterns) {
    const match = conversation.match(pattern);
    if (match && match[1]) {
      info.phone = match[1].replace(/[^\d]/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');
      break;
    }
  }

  // Company name extraction — "I own X", "my company is X", "we're X", "I run X", "work at X"
  const companyPatterns = [
    /(?:i (?:own|run)|my (?:company|business|shop) is|we're|i work (?:at|for)|company (?:is|called))\s+([A-Z][\w\s&'.-]+?)(?:\s*[.,]|\s+(?:and|we|it|in|with|for|but|so|$))/i,
    /\b([A-Z][\w\s&'.-]*?\s+(?:LLC|Inc|Co|Corp|Services|Solutions|Plumbing|HVAC|Construction|Properties|Landscaping|Electric))\b/,
  ];
  for (const pattern of companyPatterns) {
    for (const msg of userMessages) {
      const match = msg.match(pattern);
      if (match && match[1] && match[1].trim().length > 2) {
        info.companyName = match[1].trim();
        break;
      }
    }
    if (info.companyName) break;
  }

  // Industry detection
  const industries = [
    'hvac', 'plumbing', 'construction', 'real estate', 'retail',
    'property management', 'legal', 'landscaping', 'electrical',
    'roofing', 'painting', 'cleaning', 'automotive', 'restaurant',
  ];
  for (const industry of industries) {
    if (conversationLower.includes(industry)) {
      info.industry = industry.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // Employee count detection — ranges or raw numbers
  const empMatch = conversation.match(/\b(5-10|10-25|25-50|50\+)\b/);
  if (empMatch) {
    info.employeeCount = empMatch[0];
  } else {
    const numMatch = conversation.match(/\b(\d{1,3})\s*(?:employees?|staff|workers|people|guys|techs|technicians)\b/i);
    if (numMatch) {
      const n = parseInt(numMatch[1], 10);
      if (n <= 5) info.employeeCount = '1-5';
      else if (n <= 10) info.employeeCount = '5-10';
      else if (n <= 25) info.employeeCount = '10-25';
      else if (n <= 50) info.employeeCount = '25-50';
      else info.employeeCount = '50+';
    }
  }

  return info;
}

/**
 * Sync voice session data from KV to NCB voice_sessions table.
 * Upserts by external_session_id so repeated calls update the same record.
 */
export async function syncVoiceSessionToNCB(data: {
  sessionId: string;
  messages: { role: string; content: string }[];
  language: string;
  startTime: number;
  intent?: string;
}, env: Record<string, string>): Promise<void> {
  const userMessages = data.messages.filter(m => m.role === 'user');
  const totalQuestions = userMessages.length;
  const durationSeconds = Math.round((Date.now() - data.startTime) / 1000);

  const record: Record<string, unknown> = {
    external_session_id: data.sessionId,
    messages: JSON.stringify(data.messages),
    language: data.language || 'en',
    total_questions: totalQuestions,
    start_time: new Date(data.startTime).toISOString(),
    duration: durationSeconds,
    sentiment: 'neutral',
  };
  if (data.intent) record.intents = JSON.stringify([data.intent]);

  // Check if session already exists in NCB
  const existing = await ncbRequest<NCBRecord[]>('GET', 'read/voice_sessions', env, {
    external_session_id: data.sessionId,
  });

  if (existing && existing.length > 0) {
    await ncbRequest('PUT', `update/voice_sessions/${existing[0].id}`, env, record);
  } else {
    await ncbRequest('POST', 'create/voice_sessions', env, record);
  }
}
