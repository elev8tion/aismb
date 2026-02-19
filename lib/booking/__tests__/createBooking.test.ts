/**
 * Tests for runBookingPipeline — CRM sync + writeback behaviour (Feb 2026)
 *
 * Verifies:
 *   - calculateLeadScore is called with booking fields
 *   - syncBookingToCRM is called with the calculated score
 *   - ncbRequest PUT writes crm_lead_id + crm_sync_status='synced' when CRM succeeds
 *   - ncbRequest PUT writes crm_lead_id=null + crm_sync_status='failed' when CRM fails
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runBookingPipeline } from '../createBooking';
import type { LandingPageBooking } from '@kre8tion/shared-types';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/ncb/client', () => ({
  ncbRequest: vi.fn(),
}));

vi.mock('@/lib/voiceAgent/leadManager', () => ({
  syncBookingToCRM: vi.fn(),
  getLeadByEmail: vi.fn(),
}));

vi.mock('@/lib/voiceAgent/leadScorer', () => ({
  calculateLeadScore: vi.fn(),
}));

vi.mock('@/lib/email/sendEmail', () => ({
  sendBookingConfirmation: vi.fn().mockResolvedValue(undefined),
  sendAssessmentConfirmation: vi.fn().mockResolvedValue(undefined),
  sendLeadDossierToAdmin: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/booking/calendarLinks', () => ({
  generateAllCalendarLinks: vi.fn().mockReturnValue({
    google: 'https://calendar.google.com/test',
    outlook: 'https://outlook.com/test',
    icsDataUri: 'data:text/calendar;...',
  }),
}));

import { ncbRequest } from '@/lib/ncb/client';
import { syncBookingToCRM, getLeadByEmail } from '@/lib/voiceAgent/leadManager';
import { calculateLeadScore } from '@/lib/voiceAgent/leadScorer';

const mockNcbRequest = vi.mocked(ncbRequest);
const mockSyncBookingToCRM = vi.mocked(syncBookingToCRM);
const mockGetLeadByEmail = vi.mocked(getLeadByEmail);
const mockCalculateLeadScore = vi.mocked(calculateLeadScore);

// ── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_ENV: Record<string, string> = {
  NCB_INSTANCE: '36905_ai_smb_crm',
  NCB_OPENAPI_URL: 'https://openapi.nocodebackend.com',
  NCB_SECRET_KEY: 'test-secret',
  EMAILIT_API_KEY: 'test-emailit',
  ADMIN_EMAIL: 'admin@example.com',
};

const MOCK_BOOKING: LandingPageBooking = {
  id: '123',
  guest_name: 'Jane Doe',
  guest_email: 'jane@example.com',
  guest_phone: '+15551234567',
  booking_date: '2026-03-15',
  start_time: '10:00',
  end_time: '10:30',
  timezone: 'America/Chicago',
  notes: null,
  company_name: null,
  industry: null,
  employee_count: null,
  challenge: null,
  referral_source: null,
  website_url: null,
  status: 'confirmed',
  booking_type: 'consultation',
  stripe_session_id: null,
  payment_status: null,
  payment_amount_cents: null,
  calendar_provider: null,
  calendar_event_id: null,
  meeting_link: null,
  crm_lead_id: null,
  crm_sync_status: null,
  created_at: '2026-03-15T10:00:00Z',
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('runBookingPipeline — CRM sync + writeback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLeadByEmail.mockResolvedValue(null);
    mockCalculateLeadScore.mockReturnValue({ score: 70, tier: 'medium', factors: ['Has email'] });
    mockNcbRequest.mockResolvedValue(null);
  });

  it('calls calculateLeadScore with booking email, phone, industry, employeeCount', async () => {
    mockSyncBookingToCRM.mockResolvedValue('42');

    await runBookingPipeline({
      booking: MOCK_BOOKING,
      bookingType: 'consultation',
      env: MOCK_ENV,
      industry: 'HVAC',
      employeeCount: '10-25',
    });

    // calculateLeadScore is called twice: once in CRM IIFE, once in admin dossier
    const crmScoreCall = mockCalculateLeadScore.mock.calls[0];
    expect(crmScoreCall[0]).toMatchObject({
      email: 'jane@example.com',
      phone: '+15551234567',
      industry: 'HVAC',
      employeeCount: '10-25',
    });
  });

  it('calls syncBookingToCRM with the calculated lead score', async () => {
    mockCalculateLeadScore.mockReturnValue({ score: 85, tier: 'high', factors: [] });
    mockSyncBookingToCRM.mockResolvedValue('42');

    await runBookingPipeline({
      booking: MOCK_BOOKING,
      bookingType: 'consultation',
      env: MOCK_ENV,
      industry: 'HVAC',
      employeeCount: '10-25',
    });

    expect(mockSyncBookingToCRM).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'jane@example.com',
        leadScore: 85,
      }),
      MOCK_ENV,
    );
  });

  it('writes crm_lead_id and crm_sync_status=synced when CRM sync succeeds', async () => {
    mockSyncBookingToCRM.mockResolvedValue('99');

    await runBookingPipeline({
      booking: MOCK_BOOKING,
      bookingType: 'consultation',
      env: MOCK_ENV,
    });

    const putCall = mockNcbRequest.mock.calls.find(
      (c) => c[0] === 'PUT' && String(c[1]).includes('update/bookings/123'),
    );

    expect(putCall).toBeDefined();
    expect(putCall![3]).toEqual({
      crm_lead_id: '99',
      crm_sync_status: 'synced',
    });
  });

  it('writes crm_lead_id=null and crm_sync_status=failed when CRM sync returns null', async () => {
    mockSyncBookingToCRM.mockResolvedValue(null);

    await runBookingPipeline({
      booking: MOCK_BOOKING,
      bookingType: 'consultation',
      env: MOCK_ENV,
    });

    const putCall = mockNcbRequest.mock.calls.find(
      (c) => c[0] === 'PUT' && String(c[1]).includes('update/bookings/123'),
    );

    expect(putCall).toBeDefined();
    expect(putCall![3]).toEqual({
      crm_lead_id: null,
      crm_sync_status: 'failed',
    });
  });

  it('uses booking.id for the PUT writeback path', async () => {
    mockSyncBookingToCRM.mockResolvedValue('55');

    const bookingWithDifferentId = { ...MOCK_BOOKING, id: '789' };
    await runBookingPipeline({
      booking: bookingWithDifferentId,
      bookingType: 'consultation',
      env: MOCK_ENV,
    });

    const putCall = mockNcbRequest.mock.calls.find(
      (c) => c[0] === 'PUT' && String(c[1]).includes('update/bookings/789'),
    );
    expect(putCall).toBeDefined();
  });

  it('returns calendarLinks in the pipeline result', async () => {
    mockSyncBookingToCRM.mockResolvedValue('1');

    const result = await runBookingPipeline({
      booking: MOCK_BOOKING,
      bookingType: 'consultation',
      env: MOCK_ENV,
    });

    expect(result.calendarLinks).toHaveProperty('google');
    expect(result.calendarLinks).toHaveProperty('outlook');
    expect(result.calendarLinks).toHaveProperty('icsDataUri');
  });

  it('pipeline completes even if CRM sync throws', async () => {
    mockSyncBookingToCRM.mockRejectedValue(new Error('CRM down'));

    const result = await runBookingPipeline({
      booking: MOCK_BOOKING,
      bookingType: 'consultation',
      env: MOCK_ENV,
    });

    // Should still complete, side-effect rejection captured in results
    expect(result.sideEffectResults).toBeDefined();
    const crmResult = result.sideEffectResults[1];
    expect(crmResult.status).toBe('rejected');
  });
});
