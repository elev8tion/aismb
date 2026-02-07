/**
 * Stripe Checkout API for Onsite Assessment Booking
 *
 * Creates a Stripe checkout session for the $250 onsite assessment.
 * Booking form data is stored in session metadata to survive the redirect.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
export const runtime = 'edge';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2023-10-16' });
}

function getAssessmentPriceId(): string {
  const priceId = process.env.STRIPE_ASSESSMENT_PRICE_ID;
  if (!priceId) throw new Error('STRIPE_ASSESSMENT_PRICE_ID not configured');
  return priceId;
}

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = host.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const date = body.date as string | undefined;
    const time = body.time as string | undefined;
    const name = body.name as string | undefined;
    const email = body.email as string | undefined;
    const phone = body.phone as string | undefined;
    const notes = body.notes as string | undefined;
    const timezone = body.timezone as string | undefined;

    // Basic validation
    if (!date || !time || !name || !email || !timezone) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid name.' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email.trim().toLowerCase(),
      line_items: [
        {
          price: getAssessmentPriceId(),
          quantity: 1,
        },
      ],
      metadata: {
        booking_type: 'assessment',
        date: date as string,
        time: time as string,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || '').trim(),
        notes: (notes || '').trim(),
        timezone: timezone as string,
      },
      success_url: `${baseUrl}/booking/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
