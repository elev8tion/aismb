/**
 * EmailIt Transactional Email Sender
 *
 * Sends emails via the EmailIt REST API (https://api.emailit.com).
 * Replaces the previous Cloudflare send_email worker approach.
 */

import {
  bookingConfirmationTemplate,
  assessmentConfirmationTemplate,
  leadDossierTemplate,
  roiReportTemplate,
  roiLeadDossierTemplate,
  type BookingConfirmationData,
  type AssessmentConfirmationData,
  type LeadDossierData,
  type ROIReportData,
  type ROILeadDossierData,
} from './templates';

const EMAILIT_API_URL = 'https://api.emailit.com/v1/emails';

// Verified sender address in EmailIt (domain kre8tion.com verified with SPF/DKIM/DMARC)
const FROM_ADDRESS = 'AI KRE8TION Partners <bookings@kre8tion.com>';

/**
 * Low-level helper: send an email via EmailIt API.
 * Throws on failure so callers can handle/log.
 */
export async function sendViaEmailIt(params: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}): Promise<void> {
  const res = await fetch(EMAILIT_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from || FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.text ? { text: params.text } : {}),
      track_opens: true,
      track_clicks: true,
      tags: ['kre8tion'],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`EmailIt API returned ${res.status}: ${err}`);
  }
}

// ─── Booking Confirmation ─────────────────────────────────────────────────

export interface SendBookingConfirmationParams {
  to: string;
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  calendarLinks: {
    google: string;
    outlook: string;
  };
  emailitApiKey?: string;
}

function formatSubjectDate(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${months[month - 1]} ${day}, ${year}`;
}

/**
 * Send a booking confirmation email via EmailIt.
 * Fire-and-forget: logs errors but never throws.
 */
export async function sendBookingConfirmation(
  params: SendBookingConfirmationParams
): Promise<void> {
  if (!params.emailitApiKey) {
    console.warn('[Email] EMAILIT_API_KEY not configured, skipping confirmation email');
    return;
  }

  try {
    const templateData: BookingConfirmationData = {
      guestName: params.guestName,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      timezone: params.timezone,
      googleCalLink: params.calendarLinks.google,
      outlookCalLink: params.calendarLinks.outlook,
    };

    const html = bookingConfirmationTemplate(templateData);
    const subject = `Booking Confirmed \u2014 Strategy Call on ${formatSubjectDate(params.date)}`;
    const plainText = `Your strategy call has been confirmed for ${formatSubjectDate(params.date)}. Check your email client for the full details.`;

    await sendViaEmailIt({
      apiKey: params.emailitApiKey,
      to: params.to,
      subject,
      html,
      text: plainText,
    });

    console.log(`[Email] Confirmation sent to ${params.to}`);
  } catch (error) {
    console.error('[Email] Failed to send confirmation email:', error);
  }
}

// ─── Assessment Confirmation ──────────────────────────────────────────────

export interface SendAssessmentConfirmationParams {
  to: string;
  guestName: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  paymentAmountCents: number;
  calendarLinks: {
    google: string;
    outlook: string;
  };
  emailitApiKey?: string;
}

/**
 * Send an assessment confirmation email via EmailIt.
 */
export async function sendAssessmentConfirmation(
  params: SendAssessmentConfirmationParams
): Promise<void> {
  if (!params.emailitApiKey) {
    console.warn('[Email] EMAILIT_API_KEY not configured, skipping assessment email');
    return;
  }

  try {
    const templateData: AssessmentConfirmationData = {
      guestName: params.guestName,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      timezone: params.timezone,
      paymentAmountCents: params.paymentAmountCents,
      googleCalLink: params.calendarLinks.google,
      outlookCalLink: params.calendarLinks.outlook,
    };

    const html = assessmentConfirmationTemplate(templateData);
    const subject = `Assessment Confirmed & Paid \u2014 Onsite Visit on ${formatSubjectDate(params.date)}`;
    const plainText = `Your onsite AI assessment has been confirmed for ${formatSubjectDate(params.date)}. Amount paid: $${(params.paymentAmountCents / 100).toFixed(2)}.`;

    await sendViaEmailIt({
      apiKey: params.emailitApiKey,
      to: params.to,
      subject,
      html,
      text: plainText,
    });

    console.log(`[Email] Assessment confirmation sent to ${params.to}`);
  } catch (error) {
    console.error('[Email] Failed to send assessment email:', error);
  }
}

// ─── Lead Dossier (admin) ─────────────────────────────────────────────────

export interface SendLeadDossierParams {
  adminEmail: string;
  lead: LeadDossierData;
  emailitApiKey?: string;
}

/**
 * Send a lead dossier to the admin (solo operator).
 */
export async function sendLeadDossierToAdmin(
  params: SendLeadDossierParams
): Promise<void> {
  if (!params.emailitApiKey) {
    console.warn('[Email] EMAILIT_API_KEY not configured, skipping dossier');
    return;
  }

  try {
    const html = leadDossierTemplate(params.lead);
    const subject = `${params.lead.priority.toUpperCase()} Priority: New Booking from ${params.lead.guestName}`;
    const plainText = `You have a new booking from ${params.lead.guestName} (${params.lead.guestEmail}). Priority: ${params.lead.priority}. Summary: ${params.lead.summary}`;

    await sendViaEmailIt({
      apiKey: params.emailitApiKey,
      to: params.adminEmail,
      subject,
      html,
      text: plainText,
      from: FROM_ADDRESS,
    });

    console.log(`[Email] Lead dossier sent to admin for ${params.lead.guestEmail}`);
  } catch (error) {
    console.error('[Email] Failed to send lead dossier:', error);
  }
}

// ─── ROI Report Email ─────────────────────────────────────────────────────

export interface SendROIReportParams {
  to: string;
  report: ROIReportData;
  emailitApiKey?: string;
}

/**
 * Send the full ROI report to the user who requested it.
 * Fire-and-forget: logs errors but never throws.
 */
export async function sendROIReport(
  params: SendROIReportParams
): Promise<void> {
  if (!params.emailitApiKey) {
    console.warn('[Email] EMAILIT_API_KEY not configured, skipping ROI report');
    return;
  }

  try {
    const html = roiReportTemplate(params.report);
    const subject = `Your ROI Report \u2014 ${params.report.roi}% return with ${params.report.tier}`;
    const plainText = `Your personalized ROI analysis: ${params.report.roi}% ROI, $${params.report.annualBenefit.toLocaleString()} annual benefit, payback in ~${params.report.paybackWeeks} weeks. Visit https://kre8tion.com/#pricing to get started.`;

    await sendViaEmailIt({
      apiKey: params.emailitApiKey,
      to: params.to,
      subject,
      html,
      text: plainText,
      from: FROM_ADDRESS,
    });

    console.log(`[Email] ROI report sent to ${params.to}`);
  } catch (error) {
    console.error('[Email] Failed to send ROI report:', error);
    throw error; // Propagate so caller can return proper error to user
  }
}

// ─── ROI Lead Dossier (admin) ─────────────────────────────────────────────

export interface SendROILeadDossierParams {
  adminEmail: string;
  lead: ROILeadDossierData;
  emailitApiKey?: string;
}

/**
 * Send an ROI lead dossier to admin when someone requests a report.
 */
export async function sendROILeadDossierToAdmin(
  params: SendROILeadDossierParams
): Promise<void> {
  if (!params.emailitApiKey) {
    console.warn('[Email] EMAILIT_API_KEY not configured, skipping ROI dossier');
    return;
  }

  try {
    const html = roiLeadDossierTemplate(params.lead);
    const subject = `ROI Lead: ${params.lead.email} \u2014 ${params.lead.roi}% ROI (${params.lead.tier})`;
    const plainText = `New ROI report request from ${params.lead.email}. Industry: ${params.lead.industry}, Tier: ${params.lead.tier}, ROI: ${params.lead.roi}%, Annual benefit: $${params.lead.annualBenefit.toLocaleString()}.`;

    await sendViaEmailIt({
      apiKey: params.emailitApiKey,
      to: params.adminEmail,
      subject,
      html,
      text: plainText,
      from: FROM_ADDRESS,
    });

    console.log(`[Email] ROI lead dossier sent to admin for ${params.lead.email}`);
  } catch (error) {
    console.error('[Email] Failed to send ROI lead dossier:', error);
  }
}
