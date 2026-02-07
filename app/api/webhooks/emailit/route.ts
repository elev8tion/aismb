/**
 * EmailIt Webhook Handler
 *
 * Receives tracking and inbound email events from EmailIt.
 * Events: email.opened, email.clicked, email.bounced, email.complained, email.inbound
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { sendViaEmailIt } from '@/lib/email/sendEmail';

export const runtime = 'edge';

const ADMIN_EMAIL = 'connect@elev8tion.one';

interface EmailItEvent {
  event: string;
  email?: string;
  subject?: string;
  url?: string;
  reason?: string;
  timestamp?: string;
  from?: string;
  to?: string;
  text?: string;
  html?: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const payload: EmailItEvent = await req.json();
    const eventType = payload.event;

    console.log(`[EmailIt Webhook] Received event: ${eventType}`, {
      email: payload.email,
      subject: payload.subject,
    });

    switch (eventType) {
      case 'email.opened':
        console.log(`[EmailIt Webhook] Email opened by ${payload.email}: "${payload.subject}"`);
        break;

      case 'email.clicked':
        console.log(`[EmailIt Webhook] Link clicked by ${payload.email}: ${payload.url}`);
        break;

      case 'email.bounced': {
        console.warn(`[EmailIt Webhook] Bounce for ${payload.email}: ${payload.reason}`);
        // Alert admin about bounces
        const { env } = getRequestContext();
        const apiKey = env.EMAILIT_API_KEY || process.env.EMAILIT_API_KEY;
        if (apiKey) {
          try {
            await sendViaEmailIt({
              apiKey,
              to: ADMIN_EMAIL,
              from: 'AI KRE8TION Partners <alerts@kre8tion.com>',
              subject: `⚠ Email Bounce: ${payload.email}`,
              html: `<p>An email to <strong>${payload.email}</strong> bounced.</p>
<p><strong>Subject:</strong> ${payload.subject || 'N/A'}</p>
<p><strong>Reason:</strong> ${payload.reason || 'Unknown'}</p>
<p><strong>Time:</strong> ${payload.timestamp || new Date().toISOString()}</p>`,
              text: `Email bounce: ${payload.email}. Reason: ${payload.reason || 'Unknown'}`,
            });
          } catch (err) {
            console.error('[EmailIt Webhook] Failed to send bounce alert:', err);
          }
        }
        break;
      }

      case 'email.complained':
        console.warn(`[EmailIt Webhook] Spam complaint from ${payload.email}: "${payload.subject}"`);
        break;

      case 'email.inbound': {
        console.log(`[EmailIt Webhook] Inbound email from ${payload.from}: "${payload.subject}"`);
        // Forward inbound reply to admin
        const { env: inboundEnv } = getRequestContext();
        const inboundApiKey = inboundEnv.EMAILIT_API_KEY || process.env.EMAILIT_API_KEY;
        if (inboundApiKey) {
          try {
            await sendViaEmailIt({
              apiKey: inboundApiKey,
              to: ADMIN_EMAIL,
              from: 'AI KRE8TION Partners <alerts@kre8tion.com>',
              subject: `Fwd: ${payload.subject || 'Customer Reply'}`,
              html: `<p><strong>From:</strong> ${payload.from || 'Unknown'}</p>
<p><strong>To:</strong> ${payload.to || 'N/A'}</p>
<hr>
${payload.html || `<pre>${payload.text || 'No content'}</pre>`}`,
              text: `From: ${payload.from || 'Unknown'}\n\n${payload.text || 'No content'}`,
            });
          } catch (err) {
            console.error('[EmailIt Webhook] Failed to forward inbound email:', err);
          }
        }
        break;
      }

      default:
        console.log(`[EmailIt Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[EmailIt Webhook] Handler error:', error);
    // Always return 200 to avoid EmailIt retries on parse errors
    return NextResponse.json({ received: true });
  }
}
