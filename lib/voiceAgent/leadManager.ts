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
  body?: Record<string, unknown>
): Promise<T | null> {
  const instance = process.env.NCB_INSTANCE;
  const dataApiUrl = process.env.NCB_DATA_API_URL;

  if (!instance || !dataApiUrl) {
    console.error('Missing NCB environment variables');
    return null;
  }

  const url = `${dataApiUrl}/${path}?instance=${instance}`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Database-Instance': instance,
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
export async function syncLeadToCRM(leadData: LeadData): Promise<NCBRecord | null> {
  if (!leadData.email) return null;

  // 1. Check if lead exists
  const existingLeads = await ncbRequest<NCBRecord[]>('GET', `read/leads`, {
    email: leadData.email
  });

  if (existingLeads && existingLeads.length > 0) {
    // 2. Update existing lead
    const leadId = existingLeads[0].id;
    console.log(`Updating existing lead ${leadId} (${leadData.email})`);
    return await ncbRequest<NCBRecord>('PUT', `update/leads/${leadId}`, {
      ...leadData,
      updated_at: new Date().toISOString()
    });
  } else {
    // 3. Create new lead
    console.log(`Creating new lead for ${leadData.email}`);
    return await ncbRequest<NCBRecord>('POST', 'create/leads', {
      ...leadData,
      status: 'new',
      created_at: new Date().toISOString()
    });
  }
}

/**
 * Retrieve lead data by email
 */
export async function getLeadByEmail(email: string): Promise<NCBRecord | null> {
  const leads = await ncbRequest<NCBRecord[]>('GET', `read/leads`, {
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
}): Promise<NCBRecord | null> {
  // First, ensure the lead exists or update it
  await syncLeadToCRM({
    email: data.email,
    industry: data.industry,
    employeeCount: data.employeeCount,
    source: 'ROI Calculator'
  });

  // Then save the ROI calculation linked to the lead if possible
  return await ncbRequest<NCBRecord>('POST', 'create/roi_calculations', {
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
}): Promise<boolean> {
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
  });

  return true;
}

/**
 * Extract lead data from conversation history using simple pattern matching
 */
export function extractLeadInfo(messages: { role: string, content: string }[]): Partial<LeadData> {
  const info: Partial<LeadData> = {};

  const conversation = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  // Email extraction
  const emailMatch = conversation.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) info.email = emailMatch[0].toLowerCase();

  // Industry detection (basic keywords)
  const industries = ['hvac', 'plumbing', 'construction', 'real estate', 'retail', 'property management', 'legal'];
  for (const industry of industries) {
    if (conversation.toLowerCase().includes(industry)) {
      info.industry = industry.charAt(0).toUpperCase() + industry.slice(1);
      break;
    }
  }

  // Employee count detection
  const empMatch = conversation.match(/\b(5-10|10-25|25-50|50\+)\b/);
  if (empMatch) info.employeeCount = empMatch[0];

  return info;
}
