/**
 * Booking Creation API
 *
 * Creates a new booking in NCB database.
 * This endpoint is public (guest booking - no authentication required).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import {
  LandingPageBooking as Booking,
  MEETING_DURATION,
  ASSESSMENT_DURATION,
  createBookingRequestSchema,
  validate,
  formatZodErrors,
} from '@kre8tion/shared-types';
import { calculateEndTime, timeToMinutes, extractDateString, extractTimeMinutes } from '@/lib/booking/availability';
import { fetchFromNCB, createInNCB } from '@/lib/ncb/client';
import { runBookingPipeline } from '@/lib/booking/createBooking';
import { KVRateLimiter, getClientIP } from '@/lib/security/rateLimiter.kv';

export const runtime = 'edge';


async function isSlotAvailable(env: Record<string, string>, date: string, time: string, duration: number = MEETING_DURATION): Promise<boolean> {
  // Filter client-side — NCB datetime filter doesn't match date strings.
  // extractDateString handles both "YYYY-MM-DD" and full datetime values from the CRM.
  const allBookings = await fetchFromNCB<Booking>(env, 'bookings');
  const bookings = allBookings.filter((b) => b.booking_date && extractDateString(String(b.booking_date)) === date);

  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + duration;

  return !bookings.some((booking) => {
    if (booking.status === 'cancelled') return false;

    // extractTimeMinutes handles both "HH:mm" (landing page) and
    // full datetime strings like "2026-02-17T10:00:00" (CRM format).
    const bookingStart = extractTimeMinutes(booking.start_time);
    const bookingEnd = extractTimeMinutes(booking.end_time);

    return slotStart < bookingEnd && slotEnd > bookingStart;
  });
}

export async function POST(req: NextRequest) {
  try {
    const env = getEnv();
    const cfEnv = env as unknown as Record<string, string>;

    // Rate limiting (booking creates get their own prefix for stricter tracking)
    if (env.RATE_LIMIT_KV) {
      const rateLimiter = new KVRateLimiter(env.RATE_LIMIT_KV);
      const clientIP = getClientIP(req);
      const rateCheck = await rateLimiter.check(`booking:${clientIP}`);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { success: false, error: rateCheck.reason || 'Rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    const body = await req.json();

    // Validate with Zod schema
    const validation = validate(createBookingRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: formatZodErrors(validation.errors) },
        { status: 400 }
      );
    }
    const validatedData = validation.data;

    const isAssessment = validatedData.bookingType === 'assessment';
    const duration = isAssessment ? ASSESSMENT_DURATION : MEETING_DURATION;

    // Double-check slot availability to prevent race conditions
    const available = await isSlotAvailable(cfEnv, validatedData.date, validatedData.time, duration);
    if (!available) {
      return NextResponse.json(
        { success: false, error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
    }

    // Calculate end time
    const endTime = calculateEndTime(validatedData.time, duration);

    // Create booking record
    const bookingData: Partial<Booking> = {
      guest_name: validatedData.name,
      guest_email: validatedData.email,
      guest_phone: validatedData.phone ?? null,
      booking_date: validatedData.date,
      start_time: validatedData.time,
      end_time: endTime,
      timezone: validatedData.timezone,
      company_name: validatedData.companyName ?? null,
      industry: validatedData.industry ?? null,
      employee_count: validatedData.employeeCount ?? null,
      challenge: validatedData.challenge ?? null,
      referral_source: validatedData.referralSource ?? null,
      website_url: validatedData.websiteUrl ?? null,
      status: 'confirmed',
      booking_type: validatedData.bookingType || 'consultation',
      ...(validatedData.stripe_session_id && {
        stripe_session_id: validatedData.stripe_session_id,
        payment_status: 'paid',
        payment_amount_cents: validatedData.payment_amount_cents,
      }),
    };

    const booking = await createInNCB<Booking>(cfEnv, 'bookings', bookingData);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Failed to create booking. Please try again.' },
        { status: 500 }
      );
    }

    // Run the shared booking pipeline (calendar links, emails, CRM sync, admin dossier)
    const { calendarLinks, sideEffectResults } = await runBookingPipeline({
      booking,
      bookingType: validatedData.bookingType || 'consultation',
      env: cfEnv,
      companyName: validatedData.companyName,
      industry: validatedData.industry,
      employeeCount: validatedData.employeeCount,
      challenge: validatedData.challenge,
      referralSource: validatedData.referralSource,
      websiteUrl: validatedData.websiteUrl,
      paymentAmountCents: validatedData.payment_amount_cents,
    });

    const labels = ['confirmation email', 'CRM sync', 'admin dossier'];
    const pipelineStatus = sideEffectResults.map((r, i) => ({
      step: labels[i] || `step-${i}`,
      status: r.status,
      ...(r.status === 'rejected' ? { error: String((r as PromiseRejectedResult).reason) } : {}),
    }));

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        timezone: booking.timezone,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        status: booking.status,
      },
      calendarLinks: {
        google: calendarLinks.google,
        outlook: calendarLinks.outlook,
        ics: calendarLinks.icsDataUri,
      },
      _pipeline: pipelineStatus,
    });
  } catch (error) {
    console.error('Booking create error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
