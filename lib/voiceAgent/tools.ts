/**
 * Voice Agent Function-Calling Tools
 *
 * Defines OpenAI tool schemas and server-side execution handlers
 * for booking, availability, ROI, and assessment checkout.
 */

import type OpenAI from 'openai';
import {
  AvailabilitySetting,
  BlockedDate,
  LandingPageBooking as Booking,
  DEFAULT_AVAILABILITY,
  MEETING_DURATION,
} from '@kre8tion/shared-types';
import {
  getAvailableDates,
  getAvailableSlots,
  calculateEndTime,
  timeToMinutes,
  formatTimeLabel,
  formatDateDisplay,
} from '@/lib/booking/availability';
import { sendViaEmailIt } from '@/lib/email/sendEmail';
import { calculateROI } from '@/lib/voiceAgent/roiCalculator';
import { fetchFromNCB, createInNCB } from '@/lib/ncb/client';
import { runBookingPipeline } from '@/lib/booking/createBooking';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ToolContext {
  env: Record<string, string>;
}

// ─── Availability helpers ───────────────────────────────────────────────────

async function loadSettings(env: Record<string, string>) {
  let settings: AvailabilitySetting[];
  try {
    settings = await fetchFromNCB<AvailabilitySetting>(env, 'availability_settings');
    if (!settings?.length) {
      settings = DEFAULT_AVAILABILITY.map((s, idx) => ({ id: `default-${idx}`, ...s }));
    }
  } catch (err) {
    console.error('Failed to load availability settings, using defaults:', err);
    settings = DEFAULT_AVAILABILITY.map((s, idx) => ({ id: `default-${idx}`, ...s }));
  }

  let blockedDates: BlockedDate[];
  try {
    blockedDates = await fetchFromNCB<BlockedDate>(env, 'blocked_dates');
  } catch (err) {
    console.error('Failed to load blocked dates:', err);
    blockedDates = [];
  }

  return { settings, blockedDates };
}

// ─── Tool Definitions ───────────────────────────────────────────────────────

export const VOICE_AGENT_TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_available_dates',
      description: 'Get available dates for booking in the next 30 days',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_available_slots',
      description: 'Get available time slots for a specific date',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          timezone: { type: 'string', description: 'IANA timezone (default: America/Los_Angeles)' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_consultation_booking',
      description: 'Book a free 30-minute strategy consultation call. ONLY use when the booking form is NOT open. If the form is open, use FILL actions instead.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          time: { type: 'string', description: 'Time in HH:mm format' },
          name: { type: 'string', description: 'Guest full name' },
          email: { type: 'string', description: 'Guest email address' },
          companyName: { type: 'string', description: 'Company name' },
          industry: { type: 'string', description: 'Business industry' },
          employeeCount: { type: 'string', description: 'Number of employees' },
          phone: { type: 'string', description: 'Phone number (optional)' },
          timezone: { type: 'string', description: 'IANA timezone (default: America/Los_Angeles)' },
        },
        required: ['date', 'time', 'name', 'email', 'companyName', 'industry'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_assessment_checkout',
      description: 'Create a $250 Stripe checkout link for the onsite assessment and email it to the user. ONLY use when the booking form is NOT open. If the form is open, use FILL actions instead.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          time: { type: 'string', description: 'Time in HH:mm format' },
          name: { type: 'string', description: 'Guest full name' },
          email: { type: 'string', description: 'Guest email address' },
          companyName: { type: 'string', description: 'Company name' },
          industry: { type: 'string', description: 'Business industry' },
          employeeCount: { type: 'string', description: 'Number of employees' },
          phone: { type: 'string', description: 'Phone number (optional)' },
          timezone: { type: 'string', description: 'IANA timezone (default: America/Los_Angeles)' },
        },
        required: ['date', 'time', 'name', 'email', 'companyName', 'industry'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_roi',
      description: 'Calculate estimated ROI for AI automation partnership',
      parameters: {
        type: 'object',
        properties: {
          industry: { type: 'string', description: 'Business industry' },
          employees: { type: 'number', description: 'Number of employees' },
          hourlyLaborCost: { type: 'number', description: 'Average hourly labor cost in dollars (default: 25)' },
          tier: { type: 'string', enum: ['discovery', 'foundation', 'architect'], description: 'Partnership tier (default: foundation)' },
          schedulingHours: { type: 'number', description: 'Weekly hours on scheduling (default: 6)' },
          communicationHours: { type: 'number', description: 'Weekly hours on customer communication (default: 8)' },
          dataEntryHours: { type: 'number', description: 'Weekly hours on data entry (default: 5)' },
          leadResponseHours: { type: 'number', description: 'Weekly hours on lead response (default: 4)' },
          reportingHours: { type: 'number', description: 'Weekly hours on reporting (default: 3)' },
          inventoryHours: { type: 'number', description: 'Weekly hours on inventory (default: 4)' },
          socialMediaHours: { type: 'number', description: 'Weekly hours on social media (default: 5)' },
          monthlyRevenue: { type: 'number', description: 'Monthly revenue in dollars' },
          avgDealValue: { type: 'number', description: 'Average deal value in dollars' },
          lostLeadsPerMonth: { type: 'number', description: 'Lost leads per month' },
          closeRate: { type: 'number', description: 'Close rate percentage (0-100)' },
        },
        required: [],
      },
    },
  },
];

// ─── respond_to_user tool (escape valve for booking agent) ──────────────────

const RESPOND_TO_USER_TOOL: OpenAI.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'respond_to_user',
    description: 'Ask the user for their personal details (name, email, company, industry) during the booking flow. ONLY use this to collect user info. NEVER use this to discuss availability or dates — use get_available_dates or get_available_slots for that.',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'A question asking for the user\'s name, email, company, or industry' },
      },
      required: ['message'],
    },
  },
};

// ─── Agent-specific tool subsets ────────────────────────────────────────────

/** Booking Agent tools: 4 booking tools + respond_to_user escape valve */
export const BOOKING_TOOLS: OpenAI.ChatCompletionTool[] = [
  VOICE_AGENT_TOOLS[0], // get_available_dates
  VOICE_AGENT_TOOLS[1], // get_available_slots
  VOICE_AGENT_TOOLS[2], // create_consultation_booking
  VOICE_AGENT_TOOLS[3], // create_assessment_checkout
  RESPOND_TO_USER_TOOL,
];

/** ROI Agent tools: just calculate_roi */
export const ROI_TOOLS: OpenAI.ChatCompletionTool[] = [
  VOICE_AGENT_TOOLS[4], // calculate_roi
];

// ─── Tool Execution ─────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  switch (name) {
    case 'get_available_dates':
      return handleGetAvailableDates(ctx);
    case 'get_available_slots':
      return handleGetAvailableSlots(args, ctx);
    case 'create_consultation_booking':
      return handleCreateConsultation(args, ctx);
    case 'create_assessment_checkout':
      return handleCreateAssessmentCheckout(args, ctx);
    case 'calculate_roi':
      return handleCalculateROI(args);
    case 'respond_to_user':
      return (args.message as string) || '';
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleGetAvailableDates(ctx: ToolContext): Promise<string> {
  const { settings, blockedDates } = await loadSettings(ctx.env);
  // Fetch existing bookings so fully-booked days are excluded from results
  const allBookings = await fetchFromNCB<Booking>(ctx.env, 'bookings').catch(() => []);
  const dates = getAvailableDates(30, settings, blockedDates, allBookings);
  return JSON.stringify({
    available_dates: dates,
    count: dates.length,
    IMPORTANT: 'This is the COMPLETE list of bookable dates. Any date NOT in this list is BLOCKED or FULLY BOOKED. Only offer dates from this list.',
  });
}

async function handleGetAvailableSlots(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  const date = args.date as string;
  const timezone = (args.timezone as string) || 'America/Los_Angeles';

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD.' });
  }

  const { settings, blockedDates } = await loadSettings(ctx.env);
  // Filter client-side — NCB datetime filter doesn't match date strings
  const allBookings = await fetchFromNCB<Booking>(ctx.env, 'bookings');
  const bookings = allBookings.filter((b) => b.booking_date.startsWith(date));
  const slots = getAvailableSlots(date, settings, blockedDates, bookings, timezone);
  const available = slots.filter((s) => s.available);
  const booked = slots.filter((s) => !s.available);

  return JSON.stringify({
    date,
    timezone,
    available_slots: available.map((s) => ({ time: s.time, label: s.label })),
    available_count: available.length,
    booked_slots: booked.map((s) => ({ time: s.time, label: s.label })),
    booked_count: booked.length,
    IMPORTANT: 'You ARE seeing real-time booking data. "available_slots" are OPEN and can be offered. "booked_slots" are TAKEN and must NOT be offered. If the user requested a time that appears in booked_slots, tell them it is already booked and suggest times from available_slots instead.',
  });
}

async function handleCreateConsultation(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  const date = args.date as string;
  const time = args.time as string;
  const name = args.name as string;
  const email = (args.email as string)?.trim().toLowerCase();
  const companyName = args.companyName as string;
  const industry = args.industry as string;
  const employeeCount = (args.employeeCount as string) || 'Unknown';
  const phone = (args.phone as string) || '';
  const timezone = (args.timezone as string) || 'America/Los_Angeles';

  if (!date || !time || !name || !email) {
    return JSON.stringify({ error: 'Missing required fields: date, time, name, email' });
  }

  // Check slot availability — filter client-side (NCB datetime filter issue)
  const allBookings = await fetchFromNCB<Booking>(ctx.env, 'bookings');
  const bookings = allBookings.filter((b) => b.booking_date.startsWith(date));
  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + MEETING_DURATION;
  const isBooked = bookings.some((b) => {
    if (b.status === 'cancelled') return false;
    const bStart = timeToMinutes(b.start_time);
    const bEnd = timeToMinutes(b.end_time);
    return slotStart < bEnd && slotEnd > bStart;
  });

  if (isBooked) {
    return JSON.stringify({ error: 'That time slot is no longer available. Please pick another.' });
  }

  const endTime = calculateEndTime(time, MEETING_DURATION);

  const bookingData: Partial<Booking> = {
    guest_name: name,
    guest_email: email,
    guest_phone: phone || null,
    booking_date: date,
    start_time: time,
    end_time: endTime,
    timezone,
    company_name: companyName || null,
    industry: industry || null,
    employee_count: employeeCount || null,
    status: 'confirmed',
    booking_type: 'consultation',
  };

  const booking = await createInNCB<Booking>(ctx.env, 'bookings', bookingData);
  if (!booking) {
    return JSON.stringify({ error: 'Failed to create booking. Please try again.' });
  }

  // Run the shared booking pipeline (calendar links, emails, CRM sync, admin dossier)
  await runBookingPipeline({
    booking,
    bookingType: 'consultation',
    env: ctx.env,
    companyName,
    industry,
    employeeCount,
    referralSource: 'Voice Agent',
  });

  return JSON.stringify({
    success: true,
    booking: {
      date: formatDateDisplay(date),
      time: formatTimeLabel(time),
      name,
      email,
      timezone,
    },
    message: `Consultation booked for ${formatDateDisplay(date)} at ${formatTimeLabel(time)}. Confirmation email sent to ${email}.`,
  });
}

async function handleCreateAssessmentCheckout(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<string> {
  const date = args.date as string;
  const time = args.time as string;
  const name = args.name as string;
  const email = (args.email as string)?.trim().toLowerCase();
  const companyName = args.companyName as string;
  const industry = args.industry as string;
  const employeeCount = (args.employeeCount as string) || 'Unknown';
  const phone = (args.phone as string) || '';
  const timezone = (args.timezone as string) || 'America/Los_Angeles';

  if (!date || !time || !name || !email) {
    return JSON.stringify({ error: 'Missing required fields: date, time, name, email' });
  }

  const stripeKey = ctx.env.STRIPE_SECRET_KEY;
  const assessmentPriceId = ctx.env.STRIPE_ASSESSMENT_PRICE_ID;

  if (!stripeKey || !assessmentPriceId) {
    return JSON.stringify({ error: 'Payment system is not configured. Please use the website to book an assessment.' });
  }

  // Dynamic import Stripe (it's already a dependency)
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

  const baseUrl = ctx.env.SITE_URL || 'https://kre8tion.com';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: assessmentPriceId, quantity: 1 }],
    metadata: {
      booking_type: 'assessment',
      date,
      time,
      name: name.trim(),
      email,
      phone,
      timezone,
      company_name: companyName.trim(),
      industry: industry.trim(),
      employee_count: employeeCount.trim(),
    },
    success_url: `${baseUrl}/booking/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/#pricing`,
  });

  if (!session.url) {
    return JSON.stringify({ error: 'Failed to create payment session.' });
  }

  // Email the checkout link — must await on edge runtime
  if (ctx.env.EMAILIT_API_KEY) {
    await sendViaEmailIt({
      apiKey: ctx.env.EMAILIT_API_KEY,
      to: email,
      subject: 'Complete Your Onsite AI Assessment Booking — $250',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2>Complete Your Assessment Booking</h2>
          <p>Hi ${name},</p>
          <p>Thank you for your interest in an onsite AI assessment! To confirm your booking for
          <strong>${date} at ${time}</strong>, please complete the $250 payment below:</p>
          <p style="text-align:center;margin:30px 0;">
            <a href="${session.url}" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Complete Payment — $250
            </a>
          </p>
          <p style="color:#666;font-size:14px;">This link expires in 24 hours. If you have questions, reply to this email.</p>
          <p>— AI KRE8TION Partners</p>
        </div>
      `,
      text: `Hi ${name}, complete your $250 assessment payment here: ${session.url}`,
      tags: ['kre8tion', 'landing', 'voice-assessment'],
    }).catch((err) => console.error('Assessment checkout email failed:', err));
  }

  return JSON.stringify({
    success: true,
    message: `A payment link for the $250 onsite assessment has been emailed to ${email}. They should check their inbox to complete the booking.`,
  });
}

function handleCalculateROI(args: Record<string, unknown>): string {
  const taskHours: Record<string, number> = {};
  if (args.schedulingHours != null) taskHours.scheduling = args.schedulingHours as number;
  if (args.communicationHours != null) taskHours.communication = args.communicationHours as number;
  if (args.dataEntryHours != null) taskHours.dataEntry = args.dataEntryHours as number;
  if (args.leadResponseHours != null) taskHours.leadResponse = args.leadResponseHours as number;
  if (args.reportingHours != null) taskHours.reporting = args.reportingHours as number;
  if (args.inventoryHours != null) taskHours.inventory = args.inventoryHours as number;
  if (args.socialMediaHours != null) taskHours.socialMedia = args.socialMediaHours as number;

  const revenue: Record<string, number> = {};
  if (args.monthlyRevenue != null) revenue.monthlyRevenue = args.monthlyRevenue as number;
  if (args.avgDealValue != null) revenue.avgDealValue = args.avgDealValue as number;
  if (args.lostLeadsPerMonth != null) revenue.lostLeadsPerMonth = args.lostLeadsPerMonth as number;
  if (args.closeRate != null) revenue.closeRate = args.closeRate as number;

  const results = calculateROI({
    hourlyLaborCost: (args.hourlyLaborCost as number) || 25,
    taskHours,
    revenue,
    tier: (args.tier as string) || 'foundation',
  });

  return JSON.stringify({
    roi_percentage: results.roi,
    payback_weeks: results.paybackWeeks,
    annual_benefit: results.annualBenefit,
    weekly_hours_saved: results.totalWeeklyHoursSaved,
    weekly_labor_savings: results.weeklyLaborSavings,
    monthly_revenue_recovery: results.monthlyRevenueRecovery,
    investment: results.investment,
    tier: (args.tier as string) || 'foundation',
    comparison: {
      consultant_annual: results.consultantCost,
      agency_annual: results.agencyCost,
    },
    note: 'Present these results conversationally. Highlight ROI%, payback weeks, annual benefit, and hours saved.',
  });
}
