import { DEMO_USER } from './session';

function isoDaysFromNow(days: number, hour = 14): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}

function dateDaysFromNow(days: number): string {
  return isoDaysFromNow(days).slice(0, 10);
}

const createdThisWeek = isoDaysFromNow(-1, 15);
const createdEarlier = isoDaysFromNow(-12, 16);

const rows: Record<string, Record<string, unknown>[]> = {
  user_profiles: [
    {
      id: 1,
      user_id: DEMO_USER.id,
      role: 'team_member',
      display_name: DEMO_USER.name,
      phone: null,
      timezone: 'America/New_York',
      notification_preferences: null,
      onboarding_progress: JSON.stringify({
        create_account: true,
        set_availability: true,
        block_dates: true,
        connect_calendar: true,
        review_help: true,
      }),
      onboarding_dismissed: true,
      created_at: createdEarlier,
      updated_at: createdThisWeek,
    },
  ],
  leads: [
    {
      id: 101,
      email: 'ava@northstardental.example',
      first_name: 'Ava',
      last_name: 'Chen',
      phone: '(555) 014-2100',
      company_name: 'Northstar Dental',
      source: 'roi-calculator',
      source_detail: 'Scheduling ROI report',
      industry: 'Other',
      employee_count: '10-25',
      lead_score: 92,
      status: 'qualified',
      voice_session_id: null,
      roi_calculation_id: 501,
      user_id: DEMO_USER.id,
      created_at: createdThisWeek,
      updated_at: createdThisWeek,
    },
    {
      id: 102,
      email: 'marcus@riverparkhvac.example',
      first_name: 'Marcus',
      last_name: 'Hale',
      phone: '(555) 014-7724',
      company_name: 'River Park HVAC',
      source: 'referral',
      source_detail: 'Partner referral',
      industry: 'HVAC',
      employee_count: '10-25',
      lead_score: 84,
      status: 'contacted',
      voice_session_id: null,
      roi_calculation_id: null,
      user_id: DEMO_USER.id,
      created_at: createdThisWeek,
      updated_at: createdThisWeek,
    },
    {
      id: 103,
      email: 'priya@lumenlegal.example',
      first_name: 'Priya',
      last_name: 'Shah',
      phone: '(555) 014-8841',
      company_name: 'Lumen Legal Group',
      source: 'other',
      source_detail: 'Website inquiry',
      industry: 'Other',
      employee_count: '5-10',
      lead_score: 67,
      status: 'new',
      voice_session_id: null,
      roi_calculation_id: 502,
      user_id: DEMO_USER.id,
      created_at: createdThisWeek,
      updated_at: createdThisWeek,
    },
    {
      id: 104,
      email: 'diego@brightwire.example',
      first_name: 'Diego',
      last_name: 'Ruiz',
      phone: '(555) 014-6118',
      company_name: 'BrightWire Electric',
      source: 'roi-calculator',
      source_detail: 'Dispatch ROI report',
      industry: 'Electrical',
      employee_count: '25-50',
      lead_score: 78,
      status: 'converted',
      voice_session_id: null,
      roi_calculation_id: 503,
      user_id: DEMO_USER.id,
      created_at: createdEarlier,
      updated_at: createdThisWeek,
    },
  ],
  companies: [
    { id: 201, name: 'Northstar Dental', industry: 'Other', employee_count: '10-25', website: 'https://northstardental.example', ai_maturity_score: 4, city: 'Raleigh', state: 'NC', user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
    { id: 202, name: 'River Park HVAC', industry: 'HVAC', employee_count: '10-25', website: 'https://riverparkhvac.example', ai_maturity_score: 6, city: 'Charlotte', state: 'NC', user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
    { id: 203, name: 'Lumen Legal Group', industry: 'Other', employee_count: '5-10', website: 'https://lumenlegal.example', ai_maturity_score: 3, city: 'Durham', state: 'NC', user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
    { id: 204, name: 'BrightWire Electric', industry: 'Electrical', employee_count: '25-50', website: 'https://brightwire.example', ai_maturity_score: 8, city: 'Greensboro', state: 'NC', user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
  ],
  contacts: [
    { id: 301, first_name: 'Ava', last_name: 'Chen', email: 'ava@northstardental.example', phone: '(555) 014-2100', company_id: 201, title: 'Practice Manager', role: 'Operations Manager', decision_maker: 1, user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
    { id: 302, first_name: 'Marcus', last_name: 'Hale', email: 'marcus@riverparkhvac.example', phone: '(555) 014-7724', company_id: 202, title: 'Owner', role: 'Owner', decision_maker: 1, user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
    { id: 303, first_name: 'Priya', last_name: 'Shah', email: 'priya@lumenlegal.example', phone: '(555) 014-8841', company_id: 203, title: 'Managing Partner', role: 'Owner', decision_maker: 1, user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
    { id: 304, first_name: 'Diego', last_name: 'Ruiz', email: 'diego@brightwire.example', phone: '(555) 014-6118', company_id: 204, title: 'COO', role: 'Operations Manager', decision_maker: 1, user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
  ],
  opportunities: [
    { id: 401, name: 'Northstar intake automation', company_id: 201, tier: 'foundation', stage: 'discovery-call', setup_fee: 9000, monthly_fee: 1500, total_contract_value: 27000, expected_close_date: dateDaysFromNow(18), user_id: DEMO_USER.id, created_at: createdThisWeek, updated_at: createdThisWeek },
    { id: 402, name: 'River Park dispatch assistant', company_id: 202, tier: 'architect', stage: 'proposal-sent', setup_fee: 15000, monthly_fee: 2500, total_contract_value: 45000, expected_close_date: dateDaysFromNow(12), user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
    { id: 403, name: 'Lumen client intake', company_id: 203, tier: 'discovery', stage: 'contacted', setup_fee: 4000, monthly_fee: 750, total_contract_value: 13000, expected_close_date: dateDaysFromNow(28), user_id: DEMO_USER.id, created_at: createdThisWeek, updated_at: createdThisWeek },
    { id: 404, name: 'BrightWire field ops system', company_id: 204, tier: 'architect', stage: 'closed-won', setup_fee: 15000, monthly_fee: 2500, total_contract_value: 45000, expected_close_date: dateDaysFromNow(-20), user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
  ],
  partnerships: [
    { id: 601, company_name: 'BrightWire Electric', company_id: 204, opportunity_id: 404, tier: 'architect', status: 'active', phase: 'deploy', health_score: 91, systems_delivered: 3, total_systems: 4, monthly_revenue: 2500, start_date: dateDaysFromNow(-45), next_meeting: isoDaysFromNow(5, 16), notes: 'Field team rollout is on schedule.', payment_status: 'setup_paid', customer_email: 'diego@brightwire.example', stripe_customer_id: null, contact_name: 'Diego Ruiz', user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
    { id: 602, company_name: 'Oak & Stone Landscaping', company_id: null, opportunity_id: null, tier: 'foundation', status: 'active', phase: 'co-create', health_score: 86, systems_delivered: 1, total_systems: 3, monthly_revenue: 1500, start_date: dateDaysFromNow(-24), next_meeting: isoDaysFromNow(3, 15), notes: 'Lead routing prototype approved.', payment_status: 'setup_paid', customer_email: 'ops@oakandstone.example', stripe_customer_id: null, contact_name: 'Jordan Brooks', user_id: DEMO_USER.id, created_at: createdEarlier, updated_at: createdThisWeek },
  ],
  delivered_systems: [
    { id: 701, partnership_id: 601, name: 'AI call intake', status: 'live', deployed_at: isoDaysFromNow(-21) },
    { id: 702, partnership_id: 601, name: 'Estimate follow-up', status: 'live', deployed_at: isoDaysFromNow(-12) },
    { id: 703, partnership_id: 601, name: 'Dispatch summary', status: 'pilot', deployed_at: isoDaysFromNow(-4) },
    { id: 704, partnership_id: 602, name: 'Lead routing', status: 'pilot', deployed_at: isoDaysFromNow(-6) },
  ],
  activities: [
    { id: 801, type: 'call', title: 'Discovery with Ava', subject: 'Discovery with Ava', description: 'Mapped intake bottlenecks and after-hours call volume.', related_to: 'lead', related_id: 101, status: 'completed', user_id: DEMO_USER.id, created_at: isoDaysFromNow(0, 15), updated_at: isoDaysFromNow(0, 15) },
    { id: 802, type: 'email', title: 'River Park proposal sent', subject: 'River Park proposal sent', description: 'Shared the Architect plan and implementation timeline.', related_to: 'opportunity', related_id: 402, status: 'completed', user_id: DEMO_USER.id, created_at: isoDaysFromNow(-1, 18), updated_at: isoDaysFromNow(-1, 18) },
    { id: 803, type: 'task', title: 'Prepare Lumen workflow map', subject: 'Prepare Lumen workflow map', description: 'Draft the client-intake automation map before Friday.', related_to: 'opportunity', related_id: 403, status: 'pending', user_id: DEMO_USER.id, created_at: isoDaysFromNow(-1, 13), updated_at: isoDaysFromNow(-1, 13) },
    { id: 804, type: 'meeting', title: 'BrightWire rollout review', subject: 'BrightWire rollout review', description: 'Review field adoption and dispatch quality metrics.', related_to: 'partnership', related_id: 601, status: 'pending', user_id: DEMO_USER.id, created_at: isoDaysFromNow(-2, 16), updated_at: isoDaysFromNow(-2, 16) },
  ],
  roi_calculations: [
    { id: '501', industry: 'Other', employee_count: '10-25', hourly_rate: 34, weekly_admin_hours: 28, calculations: JSON.stringify({ timeSaved: 18, weeklyValue: 612, totalValue: 31824, investment: 9000, roi: 254, paybackWeeks: 15 }), selected_tier: 'foundation', email_captured: 1, email: 'ava@northstardental.example', report_requested: 1, report_sent_at: createdThisWeek, time_on_calculator: 194, adjustments_count: 3, created_at: createdThisWeek, updated_at: createdThisWeek },
    { id: '502', industry: 'Other', employee_count: '5-10', hourly_rate: 48, weekly_admin_hours: 16, calculations: JSON.stringify({ timeSaved: 10, weeklyValue: 480, totalValue: 24960, investment: 4000, roi: 524, paybackWeeks: 9 }), selected_tier: 'discovery', email_captured: 1, email: 'priya@lumenlegal.example', report_requested: 0, time_on_calculator: 142, adjustments_count: 2, created_at: createdThisWeek, updated_at: createdThisWeek },
    { id: '503', industry: 'Electrical', employee_count: '25-50', hourly_rate: 39, weekly_admin_hours: 42, calculations: JSON.stringify({ timeSaved: 27, weeklyValue: 1053, totalValue: 54756, investment: 15000, roi: 265, paybackWeeks: 15 }), selected_tier: 'architect', email_captured: 1, email: 'diego@brightwire.example', report_requested: 1, report_sent_at: createdEarlier, time_on_calculator: 261, adjustments_count: 5, created_at: createdEarlier, updated_at: createdThisWeek },
  ],
  bookings: [
    { id: '901', guest_name: 'Ava Chen', guest_email: 'ava@northstardental.example', guest_phone: '(555) 014-2100', booking_date: dateDaysFromNow(2), start_time: '14:00', end_time: '14:30', timezone: 'America/New_York', notes: 'Review intake workflow.', company_name: 'Northstar Dental', industry: 'Other', employee_count: '10-25', challenge: 'Missed after-hours calls', referral_source: 'ROI calculator', website_url: 'https://northstardental.example', status: 'confirmed', booking_type: 'discovery', stripe_session_id: null, payment_status: null, payment_amount_cents: null, calendar_provider: null, calendar_event_id: null, meeting_link: null, created_at: createdThisWeek },
    { id: '902', guest_name: 'Marcus Hale', guest_email: 'marcus@riverparkhvac.example', guest_phone: '(555) 014-7724', booking_date: dateDaysFromNow(5), start_time: '10:30', end_time: '11:00', timezone: 'America/New_York', notes: 'Proposal follow-up.', company_name: 'River Park HVAC', industry: 'HVAC', employee_count: '10-25', challenge: 'Dispatch follow-up', referral_source: 'Referral', website_url: 'https://riverparkhvac.example', status: 'pending', booking_type: 'discovery', stripe_session_id: null, payment_status: null, payment_amount_cents: null, calendar_provider: null, calendar_event_id: null, meeting_link: null, created_at: createdThisWeek },
  ],
  drafts: [],
  voice_sessions: [],
  documents: [],
  availability_settings: [],
  blocked_dates: [],
};

export function getDemoRows(table: string | null): Record<string, unknown>[] {
  if (!table) return [];
  return (rows[table] || []).map((row) => ({ ...row }));
}

export function demoReadResponse(table: string | null) {
  const data = getDemoRows(table);
  return { data, total: data.length, demo: true };
}

export function demoReadOnlyResponse() {
  return {
    error: 'The public demo is read-only. Changes are disabled.',
    code: 'DEMO_READ_ONLY',
  };
}
