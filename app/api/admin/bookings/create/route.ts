/**
 * Admin Booking Creation API
 *
 * Allows admins to manually create bookings with all fields.
 * This endpoint requires authentication (add auth check as needed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import { calculateEndTime } from '@/lib/booking/availability';
import { adminBookingRequestSchema, validate, formatZodErrors, LandingPageBooking as Booking } from '@kre8tion/shared-types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const env = getEnv();
    const cfEnv = env as unknown as Record<string, string>;

    const rawBody = await req.json();

    // Validate with Zod schema
    const validation = validate(adminBookingRequestSchema, rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: formatZodErrors(validation.errors),
        },
        { status: 400 }
      );
    }

    const body = validation.data;

    // Calculate end time
    const duration = body.duration_minutes || 30;
    const end_time = calculateEndTime(body.start_time, duration);

    // Prepare booking data for NCB
    const bookingData = {
      guest_name: body.guest_name,
      guest_email: body.guest_email,
      guest_phone: body.guest_phone || null,
      booking_date: body.booking_date,
      start_time: body.start_time,
      end_time: end_time,
      timezone: body.timezone || 'America/Los_Angeles',
      notes: body.notes || null,
      status: body.status || 'confirmed',
      company_name: body.company_name || null,
      industry: body.industry || null,
      employee_count: body.employee_count || null,
      challenge: body.challenge || null,
      referral_source: body.referral_source || null,
      website_url: body.website_url || null,
      booking_type: body.booking_type || 'consultation',
      stripe_session_id: body.stripe_session_id || null,
      payment_status: body.payment_status || null,
      payment_amount_cents: body.payment_amount_cents || null,
      calendar_provider: body.calendar_provider || null,
      calendar_event_id: body.calendar_event_id || null,
      meeting_link: body.meeting_link || null,
      // Don't send created_at - DB will auto-set it
    };

    // Create booking in NCB using OpenAPI
    const ncbUrl = cfEnv.NCB_OPENAPI_URL || 'https://openapi.nocodebackend.com';
    const secretKey = cfEnv.NCB_SECRET_KEY;

    if (!secretKey) {
      throw new Error('NCB_SECRET_KEY not configured');
    }

    const createRes = await fetch(
      `${ncbUrl}/create/bookings?Instance=36905_ai_smb_crm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secretKey}`,
        },
        body: JSON.stringify(bookingData),
      }
    );

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error('NCB booking creation failed:', errorText);
      throw new Error(`Failed to create booking in database: ${errorText}`);
    }

    const createResult = await createRes.json() as { status: string; id: number };

    if (createResult.status !== 'success' || !createResult.id) {
      throw new Error('Booking creation did not return success');
    }

    // Fetch the created booking to return full data
    const readRes = await fetch(
      `${ncbUrl}/read/bookings?Instance=36905_ai_smb_crm&id=${createResult.id}`,
      {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
        },
      }
    );

    const readResult = await readRes.json() as { status: string; data: Booking[] };
    const booking = readResult.data[0];

    // Optional: Run booking pipeline (emails, CRM sync, etc.)
    // Uncomment if you want admin-created bookings to trigger automation
    // try {
    //   await runBookingPipeline(cfEnv, booking);
    // } catch (pipelineError) {
    //   console.error('Booking pipeline error (non-fatal):', pipelineError);
    // }

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Admin booking creation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
