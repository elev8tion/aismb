/**
 * Stripe Checkout API for Onsite Assessment Booking
 *
 * Creates a Stripe checkout session for the $250 onsite assessment.
 * Booking form data is stored in session metadata to survive the redirect.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEnv } from '@/lib/cloudflare/env';
import { createBookingRequestSchema, validate, formatZodErrors } from '@kre8tion/shared-types';

export const runtime = 'edge';

function truncate(str: string, max: number = 500): string {
  return str.length > max ? str.slice(0, max) : str;
}

function getBaseUrl(req: NextRequest): string {
  const host = req.headers.get('host') || 'localhost:3000';
  const proto = host.includes('localhost') ? 'http' : 'https';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const env = getEnv();
    const stripeKey = env.STRIPE_SECRET_KEY;
    const assessmentPriceId = env.STRIPE_ASSESSMENT_PRICE_ID;

    if (!stripeKey) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured.' },
        { status: 500 }
      );
    }
    if (!assessmentPriceId) {
      return NextResponse.json(
        { success: false, error: 'Assessment pricing is not configured.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const body = await req.json();

    // Validate with Zod schema
    const validation = validate(createBookingRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking data', details: formatZodErrors(validation.errors) },
        { status: 400 }
      );
    }
    const { date, time, name, email, phone, timezone, companyName, industry, employeeCount, challenge, referralSource, websiteUrl } = validation.data;

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: assessmentPriceId,
          quantity: 1,
        },
      ],
      metadata: {
        booking_type: 'assessment',
        date,
        time,
        name,
        email,
        phone: phone || '',
        timezone,
        company_name: truncate(companyName || ''),
        industry: truncate(industry || ''),
        employee_count: truncate(employeeCount || ''),
        challenge: truncate(challenge || ''),
        referral_source: truncate(referralSource || ''),
        website_url: truncate(websiteUrl || ''),
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
