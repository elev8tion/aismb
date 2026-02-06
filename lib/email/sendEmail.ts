/**
 * Cloudflare Workers Email Sender
 * Uses the native send_email binding via Cloudflare Email Routing.
 * No third-party services needed — emails go through Cloudflare's infrastructure.
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
 * Build a raw MIME email message string.
 * Cloudflare's EmailMessage requires the raw RFC 5322 message format.
 */
function buildMimeMessage(
  from: string,
  fromName: string,
  to: string,
  toName: string,
  subject: string,
  html: string
): string {
  const boundary = `----=_Part_${Date.now().toString(36)}`;

  return [
    `From: ${fromName} <${from}>`,
    `To: ${toName} <${to}>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@kre8tion.com>`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    `Your strategy call has been confirmed. Check your email client for the full details.`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ].join('\r\n');
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

    const rawMessage = buildMimeMessage(
      FROM_EMAIL,
      FROM_NAME,
      params.to,
      params.guestName,
      subject,
      html
    );

    // Use Cloudflare's EmailMessage class from cloudflare:email
    const { EmailMessage } = await import('cloudflare:email');
    const message = new EmailMessage(FROM_EMAIL, params.to, rawMessage);

    await params.sendEmail.send(message);

    console.log(`[Email] Confirmation sent to ${params.to}`);
  } catch (error) {
    console.error('[Email] Failed to send confirmation email:', error);
  }
}
