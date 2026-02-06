/**
 * Cloudflare Workers Email Sender
 * Uses the native send_email binding via Cloudflare Email Routing.
 * No third-party services needed — emails go through Cloudflare's infrastructure.
 *
 * Uses the builder overload of SendEmail.send() to avoid importing
 * cloudflare:email (which webpack cannot resolve at build time).
 */

import {
  bookingConfirmationTemplate,
  type BookingConfirmationData,
} from './templates';

const FROM_EMAIL = 'bookings@kre8tion.com';
const FROM_NAME = 'AI KRE8TION Partners';

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
  /** Cloudflare send_email binding from getRequestContext().env */
  sendEmail?: SendEmail;
}

function formatSubjectDate(dateStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${months[month - 1]} ${day}, ${year}`;
}

/**
 * Send a booking confirmation email via Cloudflare Workers send_email binding.
 * Fire-and-forget: logs errors but never throws.
 */
export async function sendBookingConfirmation(
  params: SendBookingConfirmationParams
): Promise<void> {
  if (!params.sendEmail) {
    console.warn('[Email] SEND_EMAIL binding not available, skipping confirmation email');
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

    // Use the builder overload — no cloudflare:email import needed
    await params.sendEmail.send({
      from: { name: FROM_NAME, email: FROM_EMAIL },
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
