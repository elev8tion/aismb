/**
 * Google Calendar OAuth - Callback Handler
 *
 * Handles the OAuth callback from Google, exchanges code for tokens,
 * and stores the integration in the database.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function getConfig() {
  const instance = process.env.NCB_INSTANCE;
  const dataApiUrl = process.env.NCB_DATA_API_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!instance || !dataApiUrl) {
    throw new Error('Missing NCB environment variables');
  }

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing Google OAuth environment variables');
  }

  return { instance, dataApiUrl, clientId, clientSecret, redirectUri };
}

export async function GET(req: NextRequest) {
  try {
    const config = getConfig();
    const { searchParams } = new URL(req.url);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth error
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/admin/settings?error=oauth_denied', req.url)
      );
    }

    // Verify code is present
    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/settings?error=no_code', req.url)
      );
    }

    // Verify state for CSRF protection
    const storedState = req.cookies.get('google_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/admin/settings?error=invalid_state', req.url)
      );
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errorData = await tokenRes.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/admin/settings?error=token_exchange', req.url)
      );
    }

    const tokenData: { access_token?: string; refresh_token?: string; expires_in?: number } = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 3600));

    // Get the user's primary calendar ID
    let calendarId = 'primary';
    try {
      const calendarRes = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      if (calendarRes.ok) {
        const calendarData: { id?: string } = await calendarRes.json();
        calendarId = calendarData.id || 'primary';
      }
    } catch (err) {
      console.error('Failed to get calendar ID:', err);
    }

    // Check if integration already exists
    const params = new URLSearchParams({
      instance: config.instance,
      provider: 'google',
    });

    const existingRes = await fetch(
      `${config.dataApiUrl}/read/calendar_integrations?${params.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Database-Instance': config.instance,
        },
      }
    );

    const integrationData = {
      provider: 'google',
      access_token,
      refresh_token,
      expires_at: expiresAt.toISOString(),
      calendar_id: calendarId,
      is_active: true,
    };

    let existingIntegration: { id: string } | null = null;
    if (existingRes.ok) {
      const data: { data?: Array<{ id: string }> } = await existingRes.json();
      const integrations = data.data || [];
      if (integrations.length > 0) {
        existingIntegration = integrations[0];
      }
    }

    if (existingIntegration) {
      // Update existing integration
      const updateParams = new URLSearchParams({ instance: config.instance });
      await fetch(
        `${config.dataApiUrl}/update/calendar_integrations/${existingIntegration.id}?${updateParams.toString()}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Database-Instance': config.instance,
          },
          body: JSON.stringify(integrationData),
        }
      );
    } else {
      // Create new integration
      const createParams = new URLSearchParams({ instance: config.instance });
      await fetch(
        `${config.dataApiUrl}/create/calendar_integrations?${createParams.toString()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Database-Instance': config.instance,
          },
          body: JSON.stringify(integrationData),
        }
      );
    }

    // Clear the state cookie
    const response = NextResponse.redirect(
      new URL('/admin/settings?success=google_connected', req.url)
    );
    response.cookies.delete('google_oauth_state');

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/admin/settings?error=callback_failed', req.url)
    );
  }
}
