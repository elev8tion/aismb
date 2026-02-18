/**
 * Shared Booking Pipeline
 *
 * After a booking record is created in NCB, this function runs the full
 * side-effect pipeline: calendar links → confirmation email → CRM sync →
 * lead scoring → admin dossier.
 *
 * Used by:
 *   - app/api/booking/create/route.ts (API route)
 *   - lib/voiceAgent/tools.ts (voice agent create_consultation_booking)
 */

import type { LandingPageBooking as Booking, BookingType, CalendarEventData, CalendarEventResult } from '@kre8tion/shared-types';
import { generateAllCalendarLinks } from '@/lib/booking/calendarLinks';
import { GoogleCalendarProvider } from '@/lib/booking/calendar/google';
import { CalDAVProvider } from '@/lib/booking/calendar/caldav';
import {
  sendBookingConfirmation,
  sendAssessmentConfirmation,
  sendLeadDossierToAdmin,
} from '@/lib/email/sendEmail';
import { syncBookingToCRM, getLeadByEmail } from '@/lib/voiceAgent/leadManager';
import { calculateLeadScore } from '@/lib/voiceAgent/leadScorer';

export interface BookingPipelineInput {
  booking: Booking;
  bookingType: BookingType;
  env: Record<string, string>;
  /** Extra fields from the form that aren't on the booking record */
  companyName?: string;
  industry?: string;
  employeeCount?: string;
  challenge?: string;
  referralSource?: string;
  websiteUrl?: string;
  /** For assessment bookings */
  paymentAmountCents?: number;
}

export interface BookingPipelineResult {
  calendarLinks: {
    google: string;
    outlook: string;
    icsDataUri: string;
  };
  sideEffectResults: PromiseSettledResult<unknown>[];
}

/**
 * Build CalendarEventData from a booking record.
 */
function buildCalendarEventData(
  booking: Booking,
  bookingType: BookingType,
  challenge?: string,
): CalendarEventData {
  const isAssessment = bookingType === 'assessment';
  const [sh, sm] = booking.start_time.split(':').map(Number);
  const [eh, em] = booking.end_time.split(':').map(Number);
  const start = new Date(`${booking.booking_date}T${booking.start_time}:00`);
  const end = new Date(`${booking.booking_date}T${booking.end_time}:00`);
  // Ensure end is after start (handles edge cases)
  if (end <= start) {
    const durationMs = isAssessment ? 180 * 60 * 1000 : 30 * 60 * 1000;
    end.setTime(start.getTime() + durationMs);
  }
  const title = isAssessment
    ? `AI Operations Assessment — ${booking.guest_name}`
    : `AI Strategy Call — ${booking.guest_name}`;
  const description = [
    `Guest: ${booking.guest_name} <${booking.guest_email}>`,
    booking.guest_phone ? `Phone: ${booking.guest_phone}` : '',
    challenge ? `Challenge: ${challenge}` : '',
    booking.notes ? `Notes: ${booking.notes}` : '',
  ].filter(Boolean).join('\n');
  // Suppress unused variable warnings
  void sh; void sm; void eh; void em;
  return { title, description, start, end, attendeeEmail: booking.guest_email, attendeeName: booking.guest_name, timezone: booking.timezone };
}

/**
 * Fire-and-forget: store calendar result fields back on the booking record.
 */
async function updateBookingCalendarFields(
  id: string | number,
  provider: string,
  result: CalendarEventResult,
  env: Record<string, string>,
): Promise<void> {
  try {
    const ncbUrl = env.NCB_OPENAPI_URL || 'https://openapi.nocodebackend.com';
    const instance = env.NCB_INSTANCE || '';
    const secretKey = env.NCB_SECRET_KEY || '';
    await fetch(`${ncbUrl}/update/bookings/${id}?Instance=${instance}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        calendar_provider: provider,
        calendar_event_id: result.eventId,
        meeting_link: result.meetingLink ?? null,
      }),
    });
  } catch (err) {
    console.error('[Booking Pipeline] updateBookingCalendarFields failed:', err);
  }
}

/**
 * Runs the full post-creation booking pipeline.
 * All side-effects are awaited (required for Cloudflare edge runtime).
 */
export async function runBookingPipeline(input: BookingPipelineInput): Promise<BookingPipelineResult> {
  const { booking, bookingType, env } = input;
  const isAssessment = bookingType === 'assessment';

  // 1. Generate calendar links
  const calendarLinks = generateAllCalendarLinks(
    String(booking.id),
    booking.guest_name,
    booking.guest_email,
    booking.booking_date,
    booking.start_time,
    booking.end_time,
    booking.timezone,
    input.challenge,
    isAssessment ? 'assessment' : 'consultation',
  );

  // 1b. Try to create a real calendar event (best-effort, non-fatal)
  try {
    const googleProvider = new GoogleCalendarProvider(env);
    const caldavProvider = new CalDAVProvider(env);
    const activeProvider = (await googleProvider.isConfigured()) ? googleProvider
      : (await caldavProvider.isConfigured()) ? caldavProvider
      : null;

    if (activeProvider) {
      const eventData = buildCalendarEventData(booking, bookingType, input.challenge);
      const result = await activeProvider.createEvent(eventData);
      // Store result non-awaited (fire-and-forget — booking is already confirmed)
      void updateBookingCalendarFields(booking.id, activeProvider.name, result, env);
    }
  } catch (err) {
    console.error('[Booking Pipeline] Calendar event creation failed (non-fatal):', err);
  }

  // 2. Build side-effect promises
  const sideEffects: Promise<unknown>[] = [];

  // Confirmation email
  if (isAssessment) {
    sideEffects.push(
      sendAssessmentConfirmation({
        to: booking.guest_email,
        guestName: booking.guest_name,
        date: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        timezone: booking.timezone,
        paymentAmountCents: input.paymentAmountCents || 25000,
        calendarLinks: {
          google: calendarLinks.google,
          outlook: calendarLinks.outlook,
        },
        emailitApiKey: env.EMAILIT_API_KEY,
      }),
    );
  } else {
    sideEffects.push(
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
      }),
    );
  }

  // CRM sync
  sideEffects.push(
    syncBookingToCRM({
      email: booking.guest_email,
      name: booking.guest_name,
      phone: booking.guest_phone ?? undefined,
      date: booking.booking_date,
      time: booking.start_time,
      timezone: booking.timezone,
      companyName: input.companyName,
      industry: input.industry,
      employeeCount: input.employeeCount,
      challenge: input.challenge,
    }, env),
  );

  // Admin dossier (1s delay to avoid EmailIt 2 req/s rate limit)
  sideEffects.push(
    (async () => {
      const lead = await getLeadByEmail(booking.guest_email, env);
      const leadScore = calculateLeadScore(lead || { email: booking.guest_email });
      await new Promise((r) => setTimeout(r, 1000));

      await sendLeadDossierToAdmin({
        adminEmail: env.ADMIN_EMAIL || 'connect@elev8tion.one',
        lead: {
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          companyName: input.companyName || (lead?.companyName as string) || 'Unknown',
          industry: input.industry || (lead?.industry as string) || 'Unknown',
          employeeCount: input.employeeCount || (lead?.employeeCount as string) || 'Unknown',
          roiScore: leadScore.score,
          priority: leadScore.tier,
          painPoints: leadScore.factors,
          summary: lead?.notes || 'No conversation summary available.',
          challenge: input.challenge || '',
          referralSource: input.referralSource || '',
          websiteUrl: input.websiteUrl || '',
          appointmentTime: `${booking.booking_date} at ${booking.start_time}`,
        },
        emailitApiKey: env.EMAILIT_API_KEY,
      });
    })(),
  );

  // 3. Await all side-effects (Cloudflare edge runtime kills unawaited promises)
  const results = await Promise.allSettled(sideEffects);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const labels = ['confirmation email', 'CRM sync', 'admin dossier'];
      console.error(`[Booking Pipeline] ${labels[i] || `side-effect #${i}`} failed:`, r.reason);
    }
  });

  return {
    calendarLinks: {
      google: calendarLinks.google,
      outlook: calendarLinks.outlook,
      icsDataUri: calendarLinks.icsDataUri,
    },
    sideEffectResults: results,
  };
}
