/**
 * Stripe Webhook Handler
 *
 * Handles checkout.session.completed events as a backup path for booking creation.
 * The primary booking creation happens on the success page; this ensures bookings
 * are created even if the user closes the browser before the success page loads.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { ASSESSMENT_FEE_CENTS, ASSESSMENT_DURATION } from '@/lib/booking/types';
import { calculateEndTime } from '@/lib/booking/availability';

export const runtime = 'edge';

function getNCBConfig() {
  const { env } = getRequestContext();
  const instance = env.NCB_INSTANCE || process.env.NCB_INSTANCE;
  const dataApiUrl = env.NCB_DATA_API_URL || process.env.NCB_DATA_API_URL;
  if (!instance || !dataApiUrl) throw new Error('Missing NCB environment variables');
  return { instance, dataApiUrl };
}

async function bookingExistsForSession(stripeSessionId: string): Promise<boolean> {
  try {
    const config = getNCBConfig();
    const params = new URLSearchParams({
      instance: config.instance,
      stripe_session_id: stripeSessionId,
    });
    const url = `${config.dataApiUrl}/read/bookings?${params.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Database-Instance': config.instance,
      },
    });
    if (!res.ok) return false;
    const data: { data?: unknown[] } = await res.json();
    return (data.data?.length || 0) > 0;
  } catch {
    return false;
  }
}

async function createBookingFromSession(metadata: Record<string, string>, sessionId: string): Promise<boolean> {
  try {
    const config = getNCBConfig();
    const endTime = calculateEndTime(metadata.time, ASSESSMENT_DURATION);

    const params = new URLSearchParams({ instance: config.instance });
    const url = `${config.dataApiUrl}/create/bookings?${params.toString()}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Database-Instance': config.instance,
      },
      body: JSON.stringify({
        guest_name: metadata.name,
        guest_email: metadata.email,
        guest_phone: metadata.phone || '',
        booking_date: metadata.date,
        start_time: metadata.time,
        end_time: endTime,
        timezone: metadata.timezone,
        notes: metadata.notes || '',
        status: 'confirmed',
        booking_type: 'assessment',
        stripe_session_id: sessionId,
        payment_status: 'paid',
        payment_amount_cents: ASSESSMENT_FEE_CENTS,
        created_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.error('Webhook: Failed to create booking:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { env } = getRequestContext();
    const stripeKey = env.STRIPE_SECRET_KEY;
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 500 });
    }

    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.booking_type !== 'assessment') {
        return NextResponse.json({ received: true });
      }

      // Dedup: check if booking already created by success page
      const exists = await bookingExistsForSession(session.id);
      if (exists) {
        console.log(`Webhook: Booking already exists for session ${session.id}`);
        return NextResponse.json({ received: true });
      }

      const metadata = session.metadata as Record<string, string>;
      const created = await createBookingFromSession(metadata, session.id);

      if (created) {
        console.log(`Webhook: Created booking for session ${session.id}`);
      } else {
        console.error(`Webhook: Failed to create booking for session ${session.id}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
