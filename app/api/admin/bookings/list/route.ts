/**
 * Admin Bookings List API
 *
 * Returns all bookings from the database.
 * This endpoint requires authentication (add auth check as needed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import { LandingPageBooking as Booking } from '@kre8tion/shared-types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const env = getEnv();
    const cfEnv = env as unknown as Record<string, string>;

    // TODO: Add authentication check here
    // const authHeader = req.headers.get('authorization');
    // if (!authHeader || !isValidAdminToken(authHeader)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const status = searchParams.get('status'); // Filter by status if provided
    const startDate = searchParams.get('start_date'); // Filter by date range
    const endDate = searchParams.get('end_date');

    const ncbUrl = cfEnv.NCB_OPENAPI_URL || 'https://openapi.nocodebackend.com';
    const secretKey = cfEnv.NCB_SECRET_KEY;

    if (!secretKey) {
      throw new Error('NCB_SECRET_KEY not configured');
    }

    // Fetch all bookings from NCB
    const res = await fetch(
      `${ncbUrl}/read/bookings?Instance=36905_ai_smb_crm`,
      {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('NCB fetch error:', errorText);
      throw new Error(`Failed to fetch bookings: ${errorText}`);
    }

    const result = await res.json() as { status: string; data: Booking[] };
    let bookings = result.data || [];

    // Apply filters
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }

    if (startDate) {
      bookings = bookings.filter(b => b.booking_date >= startDate);
    }

    if (endDate) {
      bookings = bookings.filter(b => b.booking_date <= endDate);
    }

    // Sort by booking date (newest first)
    bookings.sort((a, b) => {
      const dateA = new Date(a.booking_date + 'T' + a.start_time);
      const dateB = new Date(b.booking_date + 'T' + b.start_time);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply limit
    bookings = bookings.slice(0, limit);

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Admin bookings list error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
