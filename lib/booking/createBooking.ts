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

import type { LandingPageBooking as Booking, BookingType } from '@kre8tion/shared-types';
import { generateAllCalendarLinks } from '@/lib/booking/calendarLinks';
import {
  sendBookingConfirmation,
  sendAssessmentConfirmation,
  sendLeadDossierToAdmin,
} from '@/lib/email/sendEmail';
import { syncBookingToCRM, getLeadByEmail } from '@/lib/voiceAgent/leadManager';
import { calculateLeadScore } from '@/lib/voiceAgent/leadScorer';
import { ncbRequest } from '@/lib/ncb/client';

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

  // CRM sync + store lead ID back on booking
  sideEffects.push(
    (async () => {
      const leadScore = calculateLeadScore({
        email: booking.guest_email,
        phone: booking.guest_phone ?? undefined,
        industry: input.industry,
        employeeCount: input.employeeCount,
      });

      const crmLeadId = await syncBookingToCRM({
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
        leadScore: leadScore.score,
      }, env);

      await ncbRequest('PUT', `update/bookings/${booking.id}`, env, {
        crm_lead_id: crmLeadId ?? null,
        crm_sync_status: crmLeadId ? 'synced' : 'failed',
      });
    })(),
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
