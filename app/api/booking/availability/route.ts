/**
 * Booking Availability API
 *
 * Returns available time slots for a given date.
 * This endpoint is public (no authentication required).
 */

import { NextRequest, NextResponse } from 'next/server';
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

export const runtime = 'edge';

function getConfig() {
  const instance = process.env.NCB_INSTANCE;
  const dataApiUrl = process.env.NCB_DATA_API_URL;

  if (!instance || !dataApiUrl) {
    throw new Error('Missing NCB environment variables');
  }

  return { instance, dataApiUrl };
}

async function fetchFromNCB<T>(tableName: string, filters?: Record<string, string>): Promise<T[]> {
  const config = getConfig();
  const params = new URLSearchParams();
  params.set('instance', config.instance);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      params.set(key, value);
    });
  }

  const url = `${config.dataApiUrl}/read/${tableName}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Database-Instance': config.instance,
    },
  });

  if (!res.ok) {
    console.error(`NCB fetch error for ${tableName}:`, res.status);
    return [];
  }

  const data: { data?: T[] } = await res.json();
  return data.data || (data as unknown as T[]) || [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const timezone = searchParams.get('timezone') || 'America/Los_Angeles';
    const mode = searchParams.get('mode') || 'slots'; // 'slots' or 'dates'

    // Fetch availability settings (or use defaults)
    let settings: AvailabilitySetting[];
    try {
      settings = await fetchFromNCB<AvailabilitySetting>('availability_settings');
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
      blockedDates = await fetchFromNCB<BlockedDate>('blocked_dates');
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

    // Fetch existing bookings for this date
    let bookings: Booking[];
    try {
      bookings = await fetchFromNCB<Booking>('bookings', {
        booking_date: date,
      });
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
