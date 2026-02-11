/**
 * Google Calendar OAuth - Initiate Authorization
 *
 * This endpoint redirects to Google's OAuth consent screen.
 * Admin-only endpoint for connecting Google Calendar integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { generateGoogleOAuthUrl } from '@/lib/booking/calendar/google';

export const runtime = 'edge';

export async function GET(_req: NextRequest) {
  try {
    const { env } = getRequestContext();
    const cfEnv = env as unknown as Record<string, string>;

    // In production, this should check admin authentication
    // For now, we use a state parameter for basic verification

    const state = crypto.randomUUID();

    // Store state in cookie for verification on callback
    const oauthUrl = generateGoogleOAuthUrl(cfEnv, state);

    const response = NextResponse.redirect(oauthUrl);

    // Set state cookie for CSRF protection (expires in 10 minutes)
    response.cookies.set('google_oauth_state', state, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Google OAuth init error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}
