import { demoReadOnlyResponse, getDemoRows } from './data';

const DEMO_ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  leads: '/leads',
  contacts: '/contacts',
  companies: '/companies',
  pipeline: '/pipeline',
  bookings: '/bookings',
  partnerships: '/partnerships',
  roi_calculations: '/roi-calculations',
  reports_weekly: '/reports/weekly',
  help: '/help',
};

const READ_ONLY_TOOLS = new Set([
  'create_lead', 'update_lead_status', 'create_opportunity', 'move_deal',
  'create_contact', 'create_company', 'confirm_booking', 'cancel_booking',
  'block_date', 'unblock_date', 'create_partnership', 'update_partnership_phase',
  'update_satisfaction_score', 'log_partner_interaction', 'log_activity',
  'schedule_followup', 'bulk_update_lead_status', 'bulk_assign_leads',
  'draft_email', 'draft_sms', 'run_roi_calculation', 'ui_open_new', 'ui_open_edit',
]);

type Row = Record<string, unknown>;

function text(value: unknown): string {
  return String(value ?? '').toLowerCase();
}

function includes(row: Row, query: string, fields: string[]): boolean {
  const q = query.toLowerCase();
  return fields.some((field) => text(row[field]).includes(q));
}

function leadName(row: Row): string {
  return `${row.first_name || ''} ${row.last_name || ''}`.trim() || String(row.email || 'lead');
}

function leadCard(row: Row) {
  return { name: leadName(row), email: row.email, company: row.company_name, status: row.status, score: row.lead_score };
}

export const DEMO_AGENT_PROMPT = `Public demo mode:
Use only the tool results from this demo workspace. The records are fictional: Northstar Dental, River Park HVAC, Lumen Legal Group, BrightWire Electric, and Oak & Stone Landscaping.
You can answer questions and navigate the demo pages. You cannot create, edit, email, invoice, or delete anything. If a tool says the demo is read-only, say that plainly.`;

export function executeDemoTool(name: string, params: Record<string, unknown>): unknown {
  if (READ_ONLY_TOOLS.has(name)) return demoReadOnlyResponse();

  const leads = getDemoRows('leads');
  const bookings = getDemoRows('bookings');
  const opportunities = getDemoRows('opportunities');
  const contacts = getDemoRows('contacts');
  const companies = getDemoRows('companies');
  const partnerships = getDemoRows('partnerships');
  const activities = getDemoRows('activities');
  const roi = getDemoRows('roi_calculations');
  const query = String(params.query || '');

  switch (name) {
    case 'list_leads':
      return {
        leads: leads
          .filter((row) => !params.status || row.status === params.status)
          .slice(0, Number(params.limit) || 20)
          .map(leadCard),
        total: leads.length,
      };
    case 'search_leads':
      return {
        leads: leads.filter((row) => includes(row, query, ['first_name', 'last_name', 'email', 'company_name'])).map(leadCard),
      };
    case 'count_leads': {
      const byStatus: Record<string, number> = {};
      for (const row of leads) byStatus[String(row.status)] = (byStatus[String(row.status)] || 0) + 1;
      return { total: leads.length, by_status: byStatus };
    }
    case 'score_lead': {
      const match = leads.find((row) => includes(row, query || String(params.name || ''), ['first_name', 'last_name', 'company_name', 'email']));
      return match ? { name: leadName(match), score: match.lead_score, status: match.status } : { error: 'No matching demo lead' };
    }
    case 'get_lead_summary':
      return { total: leads.length, qualified: leads.filter((row) => row.status === 'qualified').length, leads: leads.map(leadCard) };
    case 'list_bookings':
    case 'get_upcoming_bookings':
    case 'get_todays_bookings':
    case 'get_booking_summary':
      return {
        bookings: bookings.map((row) => ({ guest: row.guest_name, company: row.company_name, date: row.booking_date, time: row.start_time, status: row.status })),
        total: bookings.length,
      };
    case 'get_availability':
      return { bookings: bookings.length, blocked_dates: 0, note: 'Demo calendar shows the two sample bookings only.' };
    case 'list_opportunities':
    case 'get_pipeline_summary':
    case 'get_top_opportunities':
      return {
        opportunities: opportunities.map((row) => ({ name: row.name, stage: row.stage, value: row.total_contract_value })),
        pipeline_value: opportunities.reduce((sum, row) => sum + Number(row.total_contract_value || 0), 0),
      };
    case 'search_contacts':
    case 'get_contact':
      return { contacts: contacts.filter((row) => !query || includes(row, query, ['first_name', 'last_name', 'email'])).map((row) => ({ name: `${row.first_name} ${row.last_name}`, title: row.title, email: row.email })) };
    case 'search_companies':
      return { companies: companies.filter((row) => !query || includes(row, query, ['name', 'industry'])).map((row) => ({ name: row.name, industry: row.industry, city: row.city })) };
    case 'get_company_contacts':
      return { contacts: contacts.map((row) => ({ name: `${row.first_name} ${row.last_name}`, company_id: row.company_id, title: row.title })) };
    case 'list_partnerships':
    case 'get_partnership_summary':
      return { partnerships: partnerships.map((row) => ({ company: row.company_name, phase: row.phase, health: row.health_score, delivered: `${row.systems_delivered}/${row.total_systems}` })) };
    case 'get_dashboard_stats':
      return {
        total_leads: leads.length,
        total_bookings: bookings.length,
        total_opportunities: opportunities.length,
        pipeline_value: opportunities.reduce((sum, row) => sum + Number(row.total_contract_value || 0), 0),
      };
    case 'get_daily_summary':
    case 'get_recent_activities':
      return { activities: activities.slice(0, Number(params.limit) || 4).map((row) => ({ type: row.type, subject: row.subject })) };
    case 'get_roi_calculation_insights':
      return { calculations: roi.length, tiers: roi.map((row) => row.selected_tier) };
    case 'get_conversion_rate':
      return { leads: leads.length, won: opportunities.filter((row) => row.stage === 'closed-won').length };
    case 'get_revenue_forecast':
      return { open_pipeline: opportunities.filter((row) => row.stage !== 'closed-won').reduce((sum, row) => sum + Number(row.total_contract_value || 0), 0) };
    case 'get_stale_leads':
      return { leads: [] };
    case 'get_voice_session_insights':
      return { sessions: 0, note: 'This demo has no stored voice-session history.' };
    case 'navigate': {
      const target = String(params.target || '').toLowerCase();
      const route = DEMO_ROUTES[target];
      if (!route) return { ok: false, error: 'That page is hidden in the public demo.' };
      return { ok: true, target, route, client_action: { type: 'navigate', route, target } };
    }
    case 'ui_set_filter':
    case 'ui_search':
    case 'ui_open_view':
      return { ok: true, client_action: { type: 'ui_action', action: name.replace('ui_', ''), ...params } };
    default:
      return demoReadOnlyResponse();
  }
}
