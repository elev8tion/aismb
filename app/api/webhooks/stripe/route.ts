/**
 * Stripe Webhook Handler
 *
 * Handles checkout.session.completed events as a backup path for booking creation.
 * The primary booking creation happens on the success page; this ensures bookings
 * are created even if the user closes the browser before the success page loads.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv } from '@/lib/cloudflare/env';
import {
  ASSESSMENT_FEE_CENTS,
  ASSESSMENT_DURATION,
  type LandingPageBooking as Booking,
} from '@kre8tion/shared-types';
import { calculateEndTime } from '@/lib/booking/availability';
import { fetchFromNCB, createInNCB } from '@/lib/ncb/client';
import { runBookingPipeline } from '@/lib/booking/createBooking';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const env = getEnv();
    const cfEnv = env as unknown as Record<string, string>;
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
      const existing = await fetchFromNCB<Booking>(cfEnv, 'bookings', {
        stripe_session_id: session.id,
      });
      if (existing.length > 0) {
        console.log(`Webhook: booking already exists for session ${session.id}, skipping`);
        return NextResponse.json({ received: true });
      }

      const metadata = session.metadata as Record<string, string>;
      const endTime = calculateEndTime(metadata.time, ASSESSMENT_DURATION);

      const bookingData: Partial<Booking> = {
        guest_name: metadata.name,
        guest_email: metadata.email,
        guest_phone: metadata.phone || null,
        booking_date: metadata.date,
        start_time: metadata.time,
        end_time: endTime,
        timezone: metadata.timezone || 'America/Los_Angeles',
        company_name: metadata.company_name || null,
        industry: metadata.industry || null,
        employee_count: metadata.employee_count || null,
        challenge: metadata.challenge || null,
        referral_source: metadata.referral_source || null,
        website_url: metadata.website_url || null,
        notes: null,
        status: 'confirmed',
        booking_type: 'assessment',
        stripe_session_id: session.id,
        payment_status: 'paid',
        payment_amount_cents: ASSESSMENT_FEE_CENTS,
      };

      const booking = await createInNCB<Booking>(cfEnv, 'bookings', bookingData);

      if (!booking) {
        console.error(`Webhook: Failed to create booking for session ${session.id}`);
        return NextResponse.json({ received: true });
      }

      console.log(`Webhook: Created booking ${booking.id} for session ${session.id}`);

      // Run full pipeline: confirmation email, CRM sync, admin dossier
      await runBookingPipeline({
        booking,
        bookingType: 'assessment',
        env: cfEnv,
        companyName: metadata.company_name,
        industry: metadata.industry,
        employeeCount: metadata.employee_count,
        challenge: metadata.challenge,
        referralSource: metadata.referral_source,
        websiteUrl: metadata.website_url,
        paymentAmountCents: ASSESSMENT_FEE_CENTS,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
