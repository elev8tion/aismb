#!/usr/bin/env node
/**
 * Admin Booking System - Standalone Test Runner
 *
 * Run with: node scripts/test-admin-booking.js
 * Or: npm run test:admin-booking
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'dev_admin_key_change_in_production';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logSuccess(message) {
  log('✓ ' + message, 'green');
}

function logError(message) {
  log('✗ ' + message, 'red');
}

function logInfo(message) {
  log('ℹ ' + message, 'cyan');
}

function logWarning(message) {
  log('⚠ ' + message, 'yellow');
}

// Test data
const TEST_DATA = {
  fullBooking: {
    guest_name: 'Test Admin User',
    guest_email: 'admin-test@example.com',
    booking_date: '2026-02-20',
    start_time: '14:00',
    guest_phone: '+1 (555) 987-6543',
    timezone: 'America/Los_Angeles',
    notes: 'Test booking created via admin system test',
    company_name: 'Test Corp Admin',
    industry: 'Technology',
    employee_count: '51-200',
    challenge: 'Testing automated booking creation system',
    referral_source: 'System Test',
    website_url: 'https://testcorp.example.com',
    booking_type: 'consultation',
    status: 'confirmed',
    duration_minutes: 30,
    meeting_link: 'https://zoom.us/j/test123456',
  },

  minimalBooking: {
    guest_name: 'Minimal Test User',
    guest_email: 'minimal-test@example.com',
    booking_date: '2026-02-21',
    start_time: '10:00',
  },

  invalidEmail: {
    guest_name: 'Invalid Email User',
    guest_email: 'not-an-email',
    booking_date: '2026-02-22',
    start_time: '11:00',
  },

  invalidDate: {
    guest_name: 'Invalid Date User',
    guest_email: 'test@example.com',
    booking_date: '02/22/2026',
    start_time: '11:00',
  },

  missingRequired: {
    guest_name: 'Missing Email User',
    booking_date: '2026-02-22',
    start_time: '11:00',
  },

  customDuration: {
    guest_name: 'Custom Duration Test',
    guest_email: 'duration-test@example.com',
    booking_date: '2026-02-24',
    start_time: '09:00',
    duration_minutes: 60,
  },
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: [],
};

function recordTest(name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed++;
    logSuccess(name);
  } else {
    results.failed++;
    logError(name);
  }
  if (details) {
    console.log('  ' + details);
  }
  results.tests.push({ name, passed, details });
}

// Test functions
async function testCalendarAvailability() {
  log('\n📅 Test 1: Calendar Availability (includes today)', 'bright');

  try {
    const timezone = 'America/Los_Angeles';
    const response = await fetch(
      `${BASE_URL}/api/booking/availability?mode=dates&timezone=${encodeURIComponent(timezone)}`
    );

    if (!response.ok) {
      recordTest('Calendar availability API', false, `HTTP ${response.status}`);
      return;
    }

    const data = await response.json();
    const today = new Date().toISOString().split('T')[0];
    const includesToday = data.dates && data.dates.includes(today);

    logInfo(`Today's date: ${today}`);
    logInfo(`Total available dates: ${data.dates?.length || 0}`);
    logInfo(`Includes today: ${includesToday}`);

    recordTest('Calendar availability API', data.success === true);
    recordTest('Calendar includes today', includesToday,
      includesToday ? 'Date fix working!' : 'Date fix may not be working');

  } catch (error) {
    recordTest('Calendar availability', false, error.message);
  }
}

async function testCreateFullBooking() {
  log('\n📝 Test 2: Create Booking with All Fields', 'bright');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
      body: JSON.stringify(TEST_DATA.fullBooking),
    });

    const data = await response.json();

    if (data.success && data.booking) {
      logInfo(`Booking ID: ${data.booking.id}`);
      logInfo(`Guest: ${data.booking.guest_name} (${data.booking.guest_email})`);
      logInfo(`Date: ${data.booking.booking_date} ${data.booking.start_time}-${data.booking.end_time}`);
      logInfo(`Company: ${data.booking.company_name}`);

      const endTimeCorrect = data.booking.end_time === '14:30';
      recordTest('Create booking with all fields', response.ok && data.success);
      recordTest('End time calculation (14:00 + 30min = 14:30)', endTimeCorrect);
      recordTest('All optional fields saved',
        data.booking.company_name === TEST_DATA.fullBooking.company_name &&
        data.booking.meeting_link === TEST_DATA.fullBooking.meeting_link
      );
    } else {
      recordTest('Create booking with all fields', false, data.error || 'Unknown error');
    }

  } catch (error) {
    recordTest('Create booking with all fields', false, error.message);
  }
}

async function testCreateMinimalBooking() {
  log('\n📝 Test 3: Create Booking with Minimal Fields', 'bright');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
      body: JSON.stringify(TEST_DATA.minimalBooking),
    });

    const data = await response.json();

    if (data.success && data.booking) {
      logInfo(`Booking ID: ${data.booking.id}`);
      logInfo(`End time: ${data.booking.end_time} (expected: 10:30)`);
      logInfo(`Timezone: ${data.booking.timezone} (default)`);
      logInfo(`Status: ${data.booking.status} (default)`);

      recordTest('Create minimal booking', response.ok && data.success);
      recordTest('Default timezone applied', data.booking.timezone === 'America/Los_Angeles');
      recordTest('Default status applied', data.booking.status === 'confirmed');
      recordTest('Default booking_type applied', data.booking.booking_type === 'consultation');
    } else {
      recordTest('Create minimal booking', false, data.error || 'Unknown error');
    }

  } catch (error) {
    recordTest('Create minimal booking', false, error.message);
  }
}

async function testInvalidEmail() {
  log('\n🚫 Test 4: Validation - Invalid Email', 'bright');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
      body: JSON.stringify(TEST_DATA.invalidEmail),
    });

    const data = await response.json();

    const hasEmailError = data.details && data.details.guest_email;
    const shouldFail = !response.ok && (data.error.toLowerCase().includes('email') || hasEmailError);
    logInfo(`Response: ${response.status} - ${data.error || 'OK'}`);
    if (hasEmailError) logInfo(`Zod error: ${data.details.guest_email.join(', ')}`);

    recordTest('Reject invalid email format', shouldFail,
      shouldFail ? 'Validation working correctly' : 'Validation may not be working');

  } catch (error) {
    recordTest('Reject invalid email', false, error.message);
  }
}

async function testInvalidDate() {
  log('\n🚫 Test 5: Validation - Invalid Date Format', 'bright');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
      body: JSON.stringify(TEST_DATA.invalidDate),
    });

    const data = await response.json();

    const hasDateError = data.details && data.details.booking_date;
    const shouldFail = !response.ok && (data.error.toLowerCase().includes('date') || hasDateError);
    logInfo(`Response: ${response.status} - ${data.error || 'OK'}`);
    if (hasDateError) logInfo(`Zod error: ${data.details.booking_date.join(', ')}`);

    recordTest('Reject invalid date format', shouldFail,
      shouldFail ? 'Validation working correctly' : 'Validation may not be working');

  } catch (error) {
    recordTest('Reject invalid date', false, error.message);
  }
}

async function testMissingRequired() {
  log('\n🚫 Test 6: Validation - Missing Required Fields', 'bright');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
      body: JSON.stringify(TEST_DATA.missingRequired),
    });

    const data = await response.json();

    const hasRequiredError = data.details && Object.keys(data.details).length > 0;
    const shouldFail = !response.ok && (data.error.toLowerCase().includes('required') || hasRequiredError);
    logInfo(`Response: ${response.status} - ${data.error || 'OK'}`);
    if (hasRequiredError) logInfo(`Zod errors: ${Object.keys(data.details).join(', ')}`);

    recordTest('Reject missing required fields', shouldFail,
      shouldFail ? 'Validation working correctly' : 'Validation may not be working');

  } catch (error) {
    recordTest('Reject missing fields', false, error.message);
  }
}

async function testFetchBookingsList() {
  log('\n📋 Test 7: Fetch Bookings List', 'bright');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/list`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
    });
    const data = await response.json();

    if (data.success) {
      logInfo(`Total bookings: ${data.count}`);
      logInfo(`Bookings returned: ${data.bookings?.length || 0}`);

      if (data.bookings && data.bookings.length > 0) {
        const sample = data.bookings[0];
        logInfo(`Sample: ${sample.guest_name} - ${sample.booking_date} (${sample.status})`);
      }

      recordTest('Fetch bookings list', true);
      recordTest('Bookings array returned', Array.isArray(data.bookings));
    } else {
      recordTest('Fetch bookings list', false, data.error);
    }

  } catch (error) {
    recordTest('Fetch bookings list', false, error.message);
  }
}

async function testFilterByStatus() {
  log('\n🔍 Test 8: Filter Bookings by Status', 'bright');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/list?status=confirmed`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
    });
    const data = await response.json();

    if (data.success) {
      logInfo(`Confirmed bookings: ${data.bookings?.length || 0}`);

      const allConfirmed = data.bookings?.every(b => b.status === 'confirmed') ?? true;
      recordTest('Filter by status', true);
      recordTest('All returned bookings have correct status', allConfirmed);
    } else {
      recordTest('Filter by status', false, data.error);
    }

  } catch (error) {
    recordTest('Filter by status', false, error.message);
  }
}

async function testCustomDuration() {
  log('\n⏱️  Test 9: Custom Duration Calculation', 'bright');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
      body: JSON.stringify(TEST_DATA.customDuration),
    });

    const data = await response.json();

    if (data.success && data.booking) {
      logInfo(`Start: ${data.booking.start_time}, End: ${data.booking.end_time}`);

      const endTimeCorrect = data.booking.end_time === '10:00';
      recordTest('Custom duration calculation', response.ok && data.success);
      recordTest('End time calculation (09:00 + 60min = 10:00)', endTimeCorrect,
        endTimeCorrect ? '60-minute duration working!' : `Expected 10:00, got ${data.booking.end_time}`);
    } else {
      recordTest('Custom duration', false, data.error || 'Unknown error');
    }

  } catch (error) {
    recordTest('Custom duration', false, error.message);
  }
}

// Main test runner
async function runAllTests() {
  log('='.repeat(70), 'bright');
  log('ADMIN BOOKING SYSTEM - COMPREHENSIVE TEST SUITE', 'bright');
  log('='.repeat(70), 'bright');
  log(`Base URL: ${BASE_URL}`, 'cyan');
  log(`Test Date: ${new Date().toISOString()}`, 'cyan');
  log('='.repeat(70), 'bright');

  // Check if server is running
  try {
    await fetch(`${BASE_URL}/api/booking/availability?mode=dates&timezone=UTC`);
  } catch (error) {
    logError('Cannot connect to server!');
    logWarning(`Make sure Next.js dev server is running: npm run dev`);
    logWarning(`Expected URL: ${BASE_URL}`);
    process.exit(1);
  }

  // Run all tests
  await testCalendarAvailability();
  await testCreateFullBooking();
  await testCreateMinimalBooking();
  await testInvalidEmail();
  await testInvalidDate();
  await testMissingRequired();
  await testFetchBookingsList();
  await testFilterByStatus();
  await testCustomDuration();

  // Print summary
  log('\n' + '='.repeat(70), 'bright');
  log('TEST SUMMARY', 'bright');
  log('='.repeat(70), 'bright');

  log(`Total Tests: ${results.total}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`,
    results.failed === 0 ? 'green' : 'yellow');

  log('='.repeat(70), 'bright');

  if (results.failed > 0) {
    log('\n❌ Some tests failed. Review the output above for details.', 'red');
    process.exit(1);
  } else {
    log('\n✅ All tests passed! Admin booking system is working correctly.', 'green');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
