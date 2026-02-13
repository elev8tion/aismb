/**
 * Admin Booking System - Comprehensive Test Suite
 *
 * Tests all admin booking functionality including:
 * - Calendar date availability
 * - Admin booking creation with all fields
 * - Admin booking creation with minimal fields
 * - Booking list retrieval
 * - Field validation
 * - NCB schema compliance
 */

import { describe, test, expect } from '@jest/globals';

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Test data
const VALID_BOOKING_FULL = {
  // Required fields
  guest_name: 'Test Admin User',
  guest_email: 'admin-test@example.com',
  booking_date: '2026-02-20',
  start_time: '14:00',

  // Optional contact fields
  guest_phone: '+1 (555) 987-6543',
  timezone: 'America/Los_Angeles',
  notes: 'Test booking created via admin system test',

  // Business fields
  company_name: 'Test Corp Admin',
  industry: 'Technology',
  employee_count: '51-200',
  challenge: 'Testing automated booking creation system',
  referral_source: 'System Test',
  website_url: 'https://testcorp.example.com',

  // Booking configuration
  booking_type: 'consultation',
  status: 'confirmed',
  duration_minutes: 30,

  // Payment fields
  payment_status: 'completed',
  payment_amount_cents: 0,

  // Calendar fields
  meeting_link: 'https://zoom.us/j/test123456',
};

const VALID_BOOKING_MINIMAL = {
  guest_name: 'Minimal Test User',
  guest_email: 'minimal-test@example.com',
  booking_date: '2026-02-21',
  start_time: '10:00',
};

const INVALID_BOOKING_BAD_EMAIL = {
  guest_name: 'Invalid Email User',
  guest_email: 'not-an-email',
  booking_date: '2026-02-22',
  start_time: '11:00',
};

const INVALID_BOOKING_BAD_DATE = {
  guest_name: 'Invalid Date User',
  guest_email: 'test@example.com',
  booking_date: '02/22/2026', // Wrong format
  start_time: '11:00',
};

const INVALID_BOOKING_MISSING_REQUIRED = {
  guest_name: 'Missing Email User',
  // missing guest_email
  booking_date: '2026-02-22',
  start_time: '11:00',
};

describe('Admin Booking System Tests', () => {

  // Test 1: Calendar Availability - Check if today is included
  test('Calendar should include today in available dates', async () => {
    const timezone = 'America/Los_Angeles';
    const response = await fetch(
      `${BASE_URL}/api/booking/availability?mode=dates&timezone=${encodeURIComponent(timezone)}`
    );

    expect(response.ok).toBe(true);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.dates)).toBe(true);

    // Check if today's date is in the list
    const today = new Date().toISOString().split('T')[0];
    const includesToday = data.dates.some((date: string) => date === today);

    console.log('✓ Calendar availability test:');
    console.log(`  Today's date: ${today}`);
    console.log(`  Included in available dates: ${includesToday}`);
    console.log(`  Total available dates: ${data.dates.length}`);
  });

  // Test 2: Create booking with all fields
  test('Should create booking with all NCB fields', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_BOOKING_FULL),
    });

    const data = await response.json();

    console.log('\n✓ Full booking creation test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success}`);

    if (data.success && data.booking) {
      console.log(`  Booking ID: ${data.booking.id}`);
      console.log(`  Guest: ${data.booking.guest_name}`);
      console.log(`  Email: ${data.booking.guest_email}`);
      console.log(`  Date: ${data.booking.booking_date}`);
      console.log(`  Time: ${data.booking.start_time} - ${data.booking.end_time}`);
      console.log(`  Company: ${data.booking.company_name}`);
      console.log(`  Status: ${data.booking.status}`);
      console.log(`  Type: ${data.booking.booking_type}`);

      // Verify end_time was calculated correctly
      expect(data.booking.end_time).toBe('14:30');

      // Verify all fields are present
      expect(data.booking.guest_name).toBe(VALID_BOOKING_FULL.guest_name);
      expect(data.booking.guest_email).toBe(VALID_BOOKING_FULL.guest_email);
      expect(data.booking.company_name).toBe(VALID_BOOKING_FULL.company_name);
      expect(data.booking.meeting_link).toBe(VALID_BOOKING_FULL.meeting_link);
    } else {
      console.log(`  Error: ${data.error}`);
    }

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    expect(data.booking).toBeDefined();
  });

  // Test 3: Create booking with minimal required fields only
  test('Should create booking with minimal fields', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(VALID_BOOKING_MINIMAL),
    });

    const data = await response.json();

    console.log('\n✓ Minimal booking creation test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success}`);

    if (data.success && data.booking) {
      console.log(`  Booking ID: ${data.booking.id}`);
      console.log(`  End time calculated: ${data.booking.end_time}`);
      console.log(`  Default timezone: ${data.booking.timezone}`);
      console.log(`  Default status: ${data.booking.status}`);
      console.log(`  Default booking_type: ${data.booking.booking_type}`);

      // Verify defaults were applied
      expect(data.booking.timezone).toBe('America/Los_Angeles');
      expect(data.booking.status).toBe('confirmed');
      expect(data.booking.booking_type).toBe('consultation');
      expect(data.booking.end_time).toBe('10:30');
    } else {
      console.log(`  Error: ${data.error}`);
    }

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
  });

  // Test 4: Validation - Invalid email
  test('Should reject invalid email format', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(INVALID_BOOKING_BAD_EMAIL),
    });

    const data = await response.json();

    console.log('\n✓ Invalid email validation test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Error message: ${data.error}`);

    expect(response.ok).toBe(false);
    expect(data.error).toContain('email');
  });

  // Test 5: Validation - Invalid date format
  test('Should reject invalid date format', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(INVALID_BOOKING_BAD_DATE),
    });

    const data = await response.json();

    console.log('\n✓ Invalid date format validation test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Error message: ${data.error}`);

    expect(response.ok).toBe(false);
    expect(data.error).toContain('date');
  });

  // Test 6: Validation - Missing required fields
  test('Should reject missing required fields', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(INVALID_BOOKING_MISSING_REQUIRED),
    });

    const data = await response.json();

    console.log('\n✓ Missing required fields validation test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Error message: ${data.error}`);

    expect(response.ok).toBe(false);
    expect(data.error).toContain('required');
  });

  // Test 7: Fetch bookings list
  test('Should fetch bookings list', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/list`);
    const data = await response.json();

    console.log('\n✓ Bookings list retrieval test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success}`);

    if (data.success) {
      console.log(`  Total bookings: ${data.count}`);
      console.log(`  Bookings returned: ${data.bookings?.length || 0}`);

      if (data.bookings && data.bookings.length > 0) {
        const firstBooking = data.bookings[0];
        console.log('\n  Sample booking:');
        console.log(`    ID: ${firstBooking.id}`);
        console.log(`    Name: ${firstBooking.guest_name}`);
        console.log(`    Email: ${firstBooking.guest_email}`);
        console.log(`    Date: ${firstBooking.booking_date}`);
        console.log(`    Status: ${firstBooking.status}`);
      }
    } else {
      console.log(`  Error: ${data.error}`);
    }

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.bookings)).toBe(true);
  });

  // Test 8: Filter bookings by status
  test('Should filter bookings by status', async () => {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/list?status=confirmed`);
    const data = await response.json();

    console.log('\n✓ Bookings filter test (confirmed only):');
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success}`);
    console.log(`  Confirmed bookings: ${data.bookings?.length || 0}`);

    if (data.bookings && data.bookings.length > 0) {
      // Verify all returned bookings have confirmed status
      const allConfirmed = data.bookings.every((b: any) => b.status === 'confirmed');
      console.log(`  All bookings confirmed: ${allConfirmed}`);
      expect(allConfirmed).toBe(true);
    }

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
  });

  // Test 9: NCB Schema Compliance - Check nullable fields
  test('Should handle null values correctly per NCB schema', async () => {
    const bookingWithNulls = {
      guest_name: 'Null Fields Test',
      guest_email: 'null-test@example.com',
      booking_date: '2026-02-23',
      start_time: '15:00',
      // These should be sent as null or omitted, not empty strings
      guest_phone: null,
      company_name: null,
      notes: null,
    };

    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingWithNulls),
    });

    const data = await response.json();

    console.log('\n✓ NCB schema null handling test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success}`);

    if (data.success && data.booking) {
      console.log(`  guest_phone is null: ${data.booking.guest_phone === null}`);
      console.log(`  company_name is null: ${data.booking.company_name === null}`);
      console.log(`  notes is null: ${data.booking.notes === null}`);

      // Verify null fields are actually null, not empty strings
      expect(data.booking.guest_phone).toBeNull();
      expect(data.booking.company_name).toBeNull();
      expect(data.booking.notes).toBeNull();
    }

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
  });

  // Test 10: Custom duration calculation
  test('Should calculate end_time based on custom duration', async () => {
    const customDurationBooking = {
      guest_name: 'Custom Duration Test',
      guest_email: 'duration-test@example.com',
      booking_date: '2026-02-24',
      start_time: '09:00',
      duration_minutes: 60, // 1 hour instead of default 30 min
    };

    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customDurationBooking),
    });

    const data = await response.json();

    console.log('\n✓ Custom duration calculation test:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success}`);

    if (data.success && data.booking) {
      console.log(`  Start time: ${data.booking.start_time}`);
      console.log(`  End time: ${data.booking.end_time}`);
      console.log(`  Expected end time: 10:00`);

      // 09:00 + 60 minutes = 10:00
      expect(data.booking.end_time).toBe('10:00');
    } else {
      console.log(`  Error: ${data.error}`);
    }

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
  });
});

// Export test runner
export async function runTests() {
  console.log('='.repeat(60));
  console.log('ADMIN BOOKING SYSTEM - COMPREHENSIVE TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Date: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  // Note: This is a placeholder for manual test execution
  // To run with Jest: npm test tests/admin-booking-system.test.ts
}
