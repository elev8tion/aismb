/**
 * Cloudflare Email Sender
 *
 * Calls the kre8tion-email-worker (a standalone Cloudflare Worker with
 * the send_email binding) via fetch. Pages cannot use send_email directly,
 * so we delegate to the Worker.
 */

import {
  bookingConfirmationTemplate,
  type BookingConfirmationData,
} from './templates';

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
  /** URL of the email worker */
  emailWorkerUrl?: string;
  /** Shared secret for authenticating with the email worker */
  emailWorkerSecret?: string;
}

function formatSubjectDate(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${months[month - 1]} ${day}, ${year}`;
}

/**
 * Send a booking confirmation email via the email worker.
 * Fire-and-forget: logs errors but never throws.
 */
export async function sendBookingConfirmation(
  params: SendBookingConfirmationParams
): Promise<void> {
  if (!params.emailWorkerUrl || !params.emailWorkerSecret) {
    console.warn('[Email] EMAIL_WORKER_URL or EMAIL_WORKER_SECRET not configured, skipping confirmation email');
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

    const res = await fetch(params.emailWorkerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.emailWorkerSecret}`,
      },
      body: JSON.stringify({
        to: params.to,
        toName: params.guestName,
        subject,
        html,
        text: plainText,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[Email] Worker returned ${res.status}: ${err}`);
      return;
    }

    console.log(`[Email] Confirmation sent to ${params.to}`);
  } catch (error) {
    console.error('[Email] Failed to send confirmation email:', error);
  }
}
