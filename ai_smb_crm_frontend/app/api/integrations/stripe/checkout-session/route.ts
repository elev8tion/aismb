import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import Stripe from 'stripe';
import { createCheckoutSessionSchema } from '@/lib/validation/stripe.schemas';
import { formatZodErrors } from '@kre8tion/shared-types';
import { getCRMAuth, unauthorizedStatus } from '@/lib/security/crmAuth';
import { ncbOpenApiRead, type NCBEnv } from '@/lib/agent/ncbClient';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const cfEnv = getEnv();
  const env = cfEnv as unknown as Record<string, string>;

  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secret, { apiVersion: '2023-10-16' });

  try {
    const envWithNcb = env as unknown as NCBEnv & Record<string, string>;
    const auth = await getCRMAuth(envWithNcb, req);
    const authError = unauthorizedStatus(auth);
    if (authError) {
      return NextResponse.json(
        { error: authError === 401 ? 'Unauthorized' : 'Forbidden' },
        { status: authError },
      );
    }
    if (!auth || !['admin', 'team_member'].includes(auth.role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // Validate with Zod
    const result = createCheckoutSessionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({
        error: 'Validation failed',
        details: formatZodErrors(result.error as any)
      }, { status: 400 });
    }

    const origin = req.headers.get('origin') || env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const {
      mode,
      priceId,
      prices,
      amount,
      currency,
      customer_email,
      metadata,
      opportunity_id,
      partnership_id,
      success_path,
      cancel_path,
      description,
      product_name,
    } = result.data;

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // CRM opportunity checkout uses the stored setup fee, never a browser-supplied amount.
    let authoritativeAmount = amount;
    if (opportunity_id) {
      const opportunities = await ncbOpenApiRead(envWithNcb, 'opportunities', { id: opportunity_id });
      const opportunity = opportunities[0];
      if (!opportunity) {
        return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
      }
      authoritativeAmount = Number(opportunity.setup_fee) * 100;
      if (!Number.isFinite(authoritativeAmount) || authoritativeAmount <= 0) {
        return NextResponse.json({ error: 'Opportunity has no valid setup fee' }, { status: 400 });
      }
    }

    if (opportunity_id) {
      const unit_amount = Math.round(authoritativeAmount as number);
      line_items.push({
        price_data: {
          currency,
          product_data: { name: product_name, description },
          unit_amount,
        },
        quantity: 1,
      });
    } else if (Array.isArray(prices) && prices.length > 0) {
      for (const p of prices) {
        if (typeof p === 'string') {
          line_items.push({ price: p, quantity: 1 });
        } else if (p && typeof p === 'object') {
          line_items.push(p as Stripe.Checkout.SessionCreateParams.LineItem);
        }
      }
    } else if (priceId) {
      line_items.push({ price: priceId, quantity: 1 });
    } else if (typeof authoritativeAmount === 'number' && authoritativeAmount > 0) {
      const unit_amount = Math.round(authoritativeAmount); // cents
      line_items.push({
        price_data: {
          currency,
          product_data: { name: product_name, description },
          unit_amount,
        },
        quantity: 1,
      });
    }
    // Note: Zod validation ensures at least one of priceId, prices, or amount is provided

    const session = await stripe.checkout.sessions.create({
      mode: mode as 'payment' | 'subscription',
      payment_method_types: ['card'],
      line_items,
      success_url: `${origin}${success_path}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancel_path}`,
      customer_email,
      client_reference_id: opportunity_id || partnership_id || undefined,
      metadata: {
        ...metadata,
        opportunity_id: opportunity_id || '',
        partnership_id: partnership_id || '',
      },
      automatic_tax: { enabled: false },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout error:', err);
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
