/**
 * Booking Creation API
 *
 * Creates a new booking in NCB database.
 * This endpoint is public (guest booking - no authentication required).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import {
  CreateBookingRequest,
  LandingPageBooking as Booking,
  BookingType,
  MEETING_DURATION,
  ASSESSMENT_DURATION,
} from '@kre8tion/shared-types';
import { calculateEndTime, timeToMinutes } from '@/lib/booking/availability';
import { fetchFromNCB, createInNCB } from '@/lib/ncb/client';
import { runBookingPipeline } from '@/lib/booking/createBooking';
import { KVRateLimiter, getClientIP } from '@/lib/security/rateLimiter.kv';

export const runtime = 'edge';

function validateBookingRequest(data: unknown): CreateBookingRequest | null {
  if (!data || typeof data !== 'object') return null;

  const req = data as Record<string, unknown>;

  if (typeof req.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(req.date)) return null;
  if (typeof req.time !== 'string' || !/^\d{2}:\d{2}$/.test(req.time)) return null;
  if (typeof req.name !== 'string' || req.name.trim().length < 2) return null;
  if (typeof req.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.email)) return null;
  if (typeof req.timezone !== 'string') return null;

  const bookingType = req.bookingType === 'assessment' ? 'assessment' : 'consultation';

  // Validate required business fields
  if (typeof req.companyName !== 'string' || req.companyName.trim().length < 2) return null;
  if (typeof req.industry !== 'string' || req.industry.trim().length < 2) return null;
  if (typeof req.employeeCount !== 'string' || !req.employeeCount.trim()) return null;

  return {
    date: req.date,
    time: req.time,
    name: req.name.trim(),
    email: req.email.trim().toLowerCase(),
    phone: typeof req.phone === 'string' ? req.phone.trim() : undefined,
    companyName: req.companyName.trim(),
    industry: req.industry.trim(),
    employeeCount: req.employeeCount.trim(),
    challenge: typeof req.challenge === 'string' ? req.challenge.trim() : undefined,
    referralSource: typeof req.referralSource === 'string' ? req.referralSource.trim() : undefined,
    websiteUrl: typeof req.websiteUrl === 'string' ? req.websiteUrl.trim() : undefined,
    timezone: req.timezone,
    bookingType: bookingType as BookingType,
    stripe_session_id: typeof req.stripe_session_id === 'string' ? req.stripe_session_id : undefined,
    payment_amount_cents: typeof req.payment_amount_cents === 'number' ? req.payment_amount_cents : undefined,
  };
}

async function isSlotAvailable(env: Record<string, string>, date: string, time: string, duration: number = MEETING_DURATION): Promise<boolean> {
  // Filter client-side — NCB datetime filter doesn't match date strings
  const allBookings = await fetchFromNCB<Booking>(env, 'bookings');
  const bookings = allBookings.filter((b) => b.booking_date.startsWith(date));

  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + duration;

  return !bookings.some((booking) => {
    if (booking.status === 'cancelled') return false;

    const bookingStart = timeToMinutes(booking.start_time);
    const bookingEnd = timeToMinutes(booking.end_time);

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
    const validatedData = validateBookingRequest(body);

    if (!validatedData) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking data. Please check all fields.' },
        { status: 400 }
      );
    }

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
    const { calendarLinks } = await runBookingPipeline({
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
    });
  } catch (error) {
    console.error('Booking create error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
