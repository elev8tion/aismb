/**
 * Booking Availability API
 *
 * Returns available time slots for a given date.
 * This endpoint is public (no authentication required).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import {
  getAvailableSlots,
  getAvailableDates,
} from '@/lib/booking/availability';
import {
  AvailabilitySetting,
  BlockedDate,
  Booking,
  DEFAULT_AVAILABILITY,
} from '@/lib/booking/types';
import { fetchFromNCB } from '@/lib/ncb/client';
import { KVRateLimiter, getClientIP } from '@/lib/security/rateLimiter.kv';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const env = getEnv();
    const cfEnv = env as unknown as Record<string, string>;

    // Rate limiting
    if (env.RATE_LIMIT_KV) {
      const rateLimiter = new KVRateLimiter(env.RATE_LIMIT_KV);
      const clientIP = getClientIP(req);
      const rateCheck = await rateLimiter.check(clientIP);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { error: rateCheck.reason || 'Rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const timezone = searchParams.get('timezone') || 'America/Los_Angeles';
    const mode = searchParams.get('mode') || 'slots'; // 'slots' or 'dates'

    // Fetch availability settings (or use defaults)
    let settings: AvailabilitySetting[];
    try {
      settings = await fetchFromNCB<AvailabilitySetting>(cfEnv, 'availability_settings');
      if (!settings || settings.length === 0) {
        // Use default availability
        settings = DEFAULT_AVAILABILITY.map((s, idx) => ({
          id: `default-${idx}`,
          ...s,
        }));
      }
    } catch {
      settings = DEFAULT_AVAILABILITY.map((s, idx) => ({
        id: `default-${idx}`,
        ...s,
      }));
    }

    // Fetch blocked dates
    let blockedDates: BlockedDate[];
    try {
      blockedDates = await fetchFromNCB<BlockedDate>(cfEnv, 'blocked_dates');
    } catch {
      blockedDates = [];
    }

    if (mode === 'dates') {
      // Return available dates for the next 30 days
      const availableDates = getAvailableDates(30, settings, blockedDates);
      return NextResponse.json({
        success: true,
        dates: availableDates,
        timezone,
      });
    }

    // Mode: slots - need a specific date
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required for slot availability' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Fetch existing bookings and filter by date client-side
    // (NCB datetime filter doesn't match date strings)
    let bookings: Booking[];
    try {
      const allBookings = await fetchFromNCB<Booking>(cfEnv, 'bookings');
      bookings = allBookings.filter((b) => b.booking_date.startsWith(date));
    } catch {
      bookings = [];
    }

    // Calculate available slots
    const slots = getAvailableSlots(date, settings, blockedDates, bookings, timezone);

    return NextResponse.json({
      success: true,
      date,
      slots,
      timezone,
    });
  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
