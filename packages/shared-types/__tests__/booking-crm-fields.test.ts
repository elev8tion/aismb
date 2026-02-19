/**
 * Tests for crm_lead_id / crm_sync_status fields added to LandingPageBooking (Feb 2026)
 */

import { describe, it, expect } from 'vitest';
import { toLandingPageBooking, type LandingPageBooking, type UnifiedBooking } from '../src/booking';

const MINIMAL_UNIFIED: UnifiedBooking = {
  id: '5',
  type: 'consultation',
  status: 'confirmed',
  guest: { name: 'Alice Smith', email: 'alice@example.com' },
  booking: {
    date: '2026-03-15',
    startTime: '09:00',
    endTime: '09:30',
    timezone: 'America/Chicago',
  },
  createdAt: '2026-03-15T09:00:00Z',
};

describe('LandingPageBooking crm fields', () => {
  it('toLandingPageBooking sets crm_lead_id to null', () => {
    const result = toLandingPageBooking(MINIMAL_UNIFIED);
    expect(result.crm_lead_id).toBeNull();
  });

  it('toLandingPageBooking sets crm_sync_status to null', () => {
    const result = toLandingPageBooking(MINIMAL_UNIFIED);
    expect(result.crm_sync_status).toBeNull();
  });

  it('LandingPageBooking with crm fields assigned compiles and reads back correctly', () => {
    const booking: LandingPageBooking = {
      id: '10',
      guest_name: 'Bob',
      guest_email: 'bob@example.com',
      guest_phone: null,
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
      crm_lead_id: '42',
      crm_sync_status: 'synced',
      created_at: '2026-03-15T10:00:00Z',
    };

    expect(booking.crm_lead_id).toBe('42');
    expect(booking.crm_sync_status).toBe('synced');
  });

  it('crm_sync_status accepts failed value', () => {
    const booking: LandingPageBooking = {
      ...toLandingPageBooking(MINIMAL_UNIFIED),
      crm_sync_status: 'failed',
    };
    expect(booking.crm_sync_status).toBe('failed');
  });

  it('crm fields can be null', () => {
    const booking: LandingPageBooking = {
      ...toLandingPageBooking(MINIMAL_UNIFIED),
      crm_lead_id: null,
      crm_sync_status: null,
    };
    expect(booking.crm_lead_id).toBeNull();
    expect(booking.crm_sync_status).toBeNull();
  });
});
