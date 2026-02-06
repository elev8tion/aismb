/**
 * Analytics Agent - Aggregates data for business insights
 *
 * Provides summaries of leads, ROI calculations, and bookings.
 */

interface NCBLead {
  id: string;
  firstName?: string;
  industry?: string;
  status?: string;
  notes?: string;
  created_at?: string;
}

interface NCBBooking {
  id: string;
  booking_date: string;
  status?: string;
}

interface NCBRoiCalc {
  id: string;
  created_at?: string;
}

async function fetchFromNCB<T>(tableName: string, filters?: Record<string, string>): Promise<T[]> {
  const instance = process.env.NCB_INSTANCE;
  const dataApiUrl = process.env.NCB_DATA_API_URL;

  if (!instance || !dataApiUrl) return [];

  const params = new URLSearchParams({ instance });
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => params.set(k, v));
  }

  try {
    const res = await fetch(`${dataApiUrl}/read/${tableName}?${params.toString()}`, {
      headers: { 'X-Database-Instance': instance }
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: T[] };
    return (data.data || []) as T[];
  } catch {
    return [];
  }
}

export async function getDailySummary(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  const leads = await fetchFromNCB<NCBLead>('leads', { created_at: today });
  const bookings = await fetchFromNCB<NCBBooking>('bookings', { booking_date: today });
  const roiCalcs = await fetchFromNCB<NCBRoiCalc>('roi_calculations', { created_at: today });

  const highValueLeads = leads.filter(l => l.notes?.includes('high priority')).length;

  let summary = `Today's Overview: You have ${leads.length} new leads`;
  if (highValueLeads > 0) summary += ` (${highValueLeads} high-value)`;
  summary += `, ${bookings.length} new bookings, and ${roiCalcs.length} ROI calculations performed.`;

  return summary;
}

export async function getHighPriorityLeadsReport(): Promise<string> {
  const leads = await fetchFromNCB<NCBLead>('leads');

  const highPriority = leads.filter(l =>
    l.notes?.includes('high priority') ||
    l.notes?.includes('priority: high')
  );

  if (highPriority.length === 0) {
    return "You don't have any new high-priority leads since your last check. Focus on following up with your existing pipeline.";
  }

  let report = `You have ${highPriority.length} high-priority leads waiting for you. `;

  highPriority.slice(0, 3).forEach((l, i) => {
    const industry = l.industry || 'a specialized';
    report += `${i + 1}: ${l.firstName || 'A lead'} from the ${industry} industry. `;
  });

  if (highPriority.length > 3) {
    report += `And ${highPriority.length - 3} others. `;
  }

  report += "Would you like me to send you their contact details via email?";

  return report;
}

export async function getLeadStats(): Promise<{
  total: number;
  byIndustry: Record<string, number>;
  byStatus: Record<string, number>;
  highValue: number;
}> {
  const leads = await fetchFromNCB<NCBLead>('leads');

  const stats = {
    total: leads.length,
    byIndustry: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    highValue: leads.filter(l => l.notes?.includes('high priority')).length
  };

  leads.forEach(l => {
    if (l.industry) stats.byIndustry[l.industry] = (stats.byIndustry[l.industry] || 0) + 1;
    if (l.status) stats.byStatus[l.status] = (stats.byStatus[l.status] || 0) + 1;
  });

  return stats;
}
