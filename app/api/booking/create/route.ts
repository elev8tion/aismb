/**
 * Booking Creation API
 *
 * Creates a new booking in NCB database.
 * This endpoint is public (guest booking - no authentication required).
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  CreateBookingRequest,
  Booking,
  MEETING_DURATION,
} from '@/lib/booking/types';
import { calculateEndTime, timeToMinutes } from '@/lib/booking/availability';
import { generateAllCalendarLinks } from '@/lib/booking/calendarLinks';

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
    return [];
  }

  const data: { data?: T[] } = await res.json();
  return data.data || [];
}

async function createInNCB<T>(tableName: string, inputData: Partial<T>): Promise<T | null> {
  const config = getConfig();
  const params = new URLSearchParams();
  params.set('instance', config.instance);

  const url = `${config.dataApiUrl}/create/${tableName}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Database-Instance': config.instance,
    },
    body: JSON.stringify(inputData),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`NCB create error for ${tableName}:`, res.status, error);
    return null;
  }

  const result: { data?: T } = await res.json();
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

  return {
    date: req.date,
    time: req.time,
    name: req.name.trim(),
    email: req.email.trim().toLowerCase(),
    phone: typeof req.phone === 'string' ? req.phone.trim() : undefined,
    notes: typeof req.notes === 'string' ? req.notes.trim() : undefined,
    timezone: req.timezone,
  };
}

async function isSlotAvailable(date: string, time: string): Promise<boolean> {
  const bookings = await fetchFromNCB<Booking>('bookings', { booking_date: date });

  const slotStart = timeToMinutes(time);
  const slotEnd = slotStart + MEETING_DURATION;

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

    // Double-check slot availability to prevent race conditions
    const available = await isSlotAvailable(validatedData.date, validatedData.time);
    if (!available) {
      return NextResponse.json(
        { success: false, error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      );
    }

    // Calculate end time
    const endTime = calculateEndTime(validatedData.time, MEETING_DURATION);

    // Create booking record
    const bookingData: Partial<Booking> = {
      guest_name: validatedData.name,
      guest_email: validatedData.email,
      guest_phone: validatedData.phone || '',
      booking_date: validatedData.date,
      start_time: validatedData.time,
      end_time: endTime,
      timezone: validatedData.timezone,
      notes: validatedData.notes || '',
      status: 'confirmed', // Auto-confirm for now
      created_at: new Date().toISOString(),
    };

    const booking = await createInNCB<Booking>('bookings', bookingData);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Failed to create booking. Please try again.' },
        { status: 500 }
      );
    }

    // Generate calendar links for easy addition to any calendar
    const calendarLinks = generateAllCalendarLinks(
      String(booking.id),
      booking.guest_name,
      booking.guest_email,
      booking.booking_date,
      booking.start_time,
      booking.end_time,
      booking.timezone,
      validatedData.notes
    );

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
