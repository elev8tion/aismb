/**
 * Booking Creation API
 *
 * Creates a new booking in NCB database.
 * This endpoint is public (guest booking - no authentication required).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import {
  CreateBookingRequest,
  Booking,
  BookingType,
  MEETING_DURATION,
  ASSESSMENT_DURATION,
} from '@/lib/booking/types';
import { calculateEndTime, timeToMinutes } from '@/lib/booking/availability';
import { generateAllCalendarLinks } from '@/lib/booking/calendarLinks';
import { sendBookingConfirmation, sendAssessmentConfirmation, sendLeadDossierToAdmin } from '@/lib/email/sendEmail';
import { syncBookingToCRM, getLeadByEmail } from '@/lib/voiceAgent/leadManager';
import { calculateLeadScore } from '@/lib/voiceAgent/leadScorer';

export const runtime = 'edge';

function getConfig() {
  const { env } = getRequestContext();
  const instance = env.NCB_INSTANCE;
  const openApiUrl = env.NCB_OPENAPI_URL;
  const secretKey = env.NCB_SECRET_KEY;

  if (!instance || !openApiUrl || !secretKey) {
    throw new Error('Missing NCB environment variables');
  }

  return { instance, openApiUrl, secretKey };
}

async function fetchFromNCB<T>(tableName: string, filters?: Record<string, string>): Promise<T[]> {
  const config = getConfig();
  const params = new URLSearchParams();
  params.set('Instance', config.instance);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      params.set(key, value);
    });
  }

  const url = `${config.openApiUrl}/read/${tableName}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.secretKey}`,
    },
  });

  if (!res.ok) {
    return [];
  }

  const data: { data?: T[] } = await res.json();
  return data.data || [];
}

async function createInNCB<T>(tableName: string, inputData: Partial<T>): Promise<T | null> {
  const config = getConfig();
  const params = new URLSearchParams();
  params.set('Instance', config.instance);

  const url = `${config.openApiUrl}/create/${tableName}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.secretKey}`,
    },
    body: JSON.stringify(inputData),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`NCB create error for ${tableName}:`, res.status, error);
    throw new Error(`NCB ${res.status}: ${error}`);
  }

  const result: { status?: string; id?: number; data?: T } = await res.json();

  // OpenAPI returns { status: "success", id: N } — merge id into input data
  if (result.status === 'success' && result.id) {
    return { ...inputData, id: result.id } as T;
  }

  return result.data || null;
}

function validateBookingRequest(data: unknown): CreateBookingRequest | null {
  if (!data || typeof data !== 'object') return null;

  const req = data as Record<string, unknown>;

  if (typeof req.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(req.date)) return null;
  if (typeof req.time !== 'string' || !/^\d{2}:\d{2}$/.test(req.time)) return null;
  if (typeof req.name !== 'string' || req.name.trim().length < 2) return null;
  if (typeof req.email !== 'string' || !req.email.includes('@')) return null;
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

async function isSlotAvailable(date: string, time: string, duration: number = MEETING_DURATION): Promise<boolean> {
  // Filter client-side — NCB datetime filter doesn't match date strings
  const allBookings = await fetchFromNCB<Booking>('bookings');
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
    const available = await isSlotAvailable(validatedData.date, validatedData.time, duration);
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
      guest_phone: validatedData.phone || null,
      booking_date: validatedData.date,
      start_time: validatedData.time,
      end_time: endTime,
      timezone: validatedData.timezone,
      company_name: validatedData.companyName || null,
      industry: validatedData.industry || null,
      employee_count: validatedData.employeeCount || null,
      challenge: validatedData.challenge || null,
      referral_source: validatedData.referralSource || null,
      website_url: validatedData.websiteUrl || null,
      status: 'confirmed',
      booking_type: validatedData.bookingType || 'consultation',
      ...(validatedData.stripe_session_id && {
        stripe_session_id: validatedData.stripe_session_id,
        payment_status: 'paid',
        payment_amount_cents: validatedData.payment_amount_cents,
      }),
    };

    const booking = await createInNCB<Booking>('bookings', bookingData);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Failed to create booking. Please try again.' },
        { status: 500 }
      );
    }

    // 🔄 SYNC TO CRM: Link booking to lead
    const { env } = getRequestContext();
    console.log(`🎯 Syncing Booking to CRM Lead: ${booking.guest_email}`);
    syncBookingToCRM({
      email: booking.guest_email,
      name: booking.guest_name,
      phone: booking.guest_phone,
      date: booking.booking_date,
      time: booking.start_time,
      timezone: booking.timezone,
      companyName: validatedData.companyName,
      industry: validatedData.industry,
      employeeCount: validatedData.employeeCount,
      challenge: validatedData.challenge,
    }, env as unknown as Record<string, string>).catch(err => console.error('Failed to sync booking to CRM:', err));

    // 📬 ADMIN DOSSIER: Send briefing to you
    (async () => {
      try {
        const lead = await getLeadByEmail(booking.guest_email, env as unknown as Record<string, string>);
        const leadScore = calculateLeadScore(lead || { email: booking.guest_email });
        
        await sendLeadDossierToAdmin({
          adminEmail: env.ADMIN_EMAIL || 'connect@elev8tion.one',
          lead: {
            guestName: booking.guest_name,
            guestEmail: booking.guest_email,
            companyName: validatedData.companyName || (lead?.companyName as string) || 'Unknown',
            industry: validatedData.industry || (lead?.industry as string) || 'Unknown',
            employeeCount: validatedData.employeeCount || (lead?.employeeCount as string) || 'Unknown',
            roiScore: leadScore.score,
            priority: leadScore.tier,
            painPoints: leadScore.factors,
            summary: lead?.notes || 'No conversation summary available.',
            challenge: validatedData.challenge || '',
            referralSource: validatedData.referralSource || '',
            websiteUrl: validatedData.websiteUrl || '',
            appointmentTime: `${booking.booking_date} at ${booking.start_time}`
          },
          emailitApiKey: env.EMAILIT_API_KEY,
        });
      } catch (err) {
        console.error('Failed to send admin dossier:', err);
      }
    })();

    // Generate calendar links for easy addition to any calendar
    const calendarLinks = generateAllCalendarLinks(
      String(booking.id),
      booking.guest_name,
      booking.guest_email,
      booking.booking_date,
      booking.start_time,
      booking.end_time,
      booking.timezone,
      validatedData.challenge,
      isAssessment ? 'assessment' : 'consultation'
    );

    // Send confirmation email via EmailIt (non-blocking)
    if (isAssessment) {
      sendAssessmentConfirmation({
        to: booking.guest_email,
        guestName: booking.guest_name,
        date: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        timezone: booking.timezone,
        paymentAmountCents: validatedData.payment_amount_cents || 25000,
        calendarLinks: {
          google: calendarLinks.google,
          outlook: calendarLinks.outlook,
        },
        emailitApiKey: env.EMAILIT_API_KEY,
      }).catch(err => console.error('Assessment email send failed:', err));
    } else {
      sendBookingConfirmation({
        to: booking.guest_email,
        guestName: booking.guest_name,
        date: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        timezone: booking.timezone,
        calendarLinks: {
          google: calendarLinks.google,
          outlook: calendarLinks.outlook,
        },
        emailitApiKey: env.EMAILIT_API_KEY,
      }).catch(err => console.error('Email send failed:', err));
    }

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
      // Calendar links - click to add to your calendar (no OAuth needed)
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
