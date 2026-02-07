/**
 * Stripe Checkout API for Onsite Assessment Booking
 *
 * Creates a Stripe checkout session for the $250 onsite assessment.
 * Booking form data is stored in session metadata to survive the redirect.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getRequestContext } from '@cloudflare/next-on-pages';

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
    const { env } = getRequestContext();
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

    const body = await req.json() as Record<string, unknown>;
    const date = body.date as string | undefined;
    const time = body.time as string | undefined;
    const name = body.name as string | undefined;
    const email = body.email as string | undefined;
    const phone = body.phone as string | undefined;
    const timezone = body.timezone as string | undefined;
    const companyName = body.companyName as string | undefined;
    const industry = body.industry as string | undefined;
    const employeeCount = body.employeeCount as string | undefined;
    const challenge = body.challenge as string | undefined;
    const referralSource = body.referralSource as string | undefined;
    const websiteUrl = body.websiteUrl as string | undefined;

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

    if (!companyName || companyName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your company name.' },
        { status: 400 }
      );
    }

    if (!industry || industry.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your industry.' },
        { status: 400 }
      );
    }

    if (!employeeCount || !employeeCount.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter your number of employees.' },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email.trim().toLowerCase(),
      line_items: [
        {
          price: assessmentPriceId,
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
        timezone: timezone as string,
        company_name: truncate(companyName.trim()),
        industry: truncate(industry.trim()),
        employee_count: truncate(employeeCount.trim()),
        challenge: truncate((challenge || '').trim()),
        referral_source: truncate((referralSource || '').trim()),
        website_url: truncate((websiteUrl || '').trim()),
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
