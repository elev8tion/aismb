/**
 * CalDAV Connection API
 *
 * Endpoint for connecting CalDAV-compatible calendars (Apple iCloud, etc.)
 * Uses Basic Auth with app-specific password.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function getConfig() {
  const instance = process.env.NCB_INSTANCE;
  const dataApiUrl = process.env.NCB_DATA_API_URL;

  if (!instance || !dataApiUrl) {
    throw new Error('Missing NCB environment variables');
  }

  return { instance, dataApiUrl };
}

interface ConnectRequest {
  caldav_url: string;
  caldav_username: string;
  caldav_password: string;
}

function validateRequest(data: unknown): ConnectRequest | null {
  if (!data || typeof data !== 'object') return null;

  const req = data as Record<string, unknown>;

  if (typeof req.caldav_url !== 'string' || !req.caldav_url.startsWith('https://')) {
    return null;
  }
  if (typeof req.caldav_username !== 'string' || !req.caldav_username) {
    return null;
  }
  if (typeof req.caldav_password !== 'string' || !req.caldav_password) {
    return null;
  }

  return {
    caldav_url: req.caldav_url,
    caldav_username: req.caldav_username,
    caldav_password: req.caldav_password,
  };
}

export async function POST(req: NextRequest) {
  try {
    const config = getConfig();
    const body = await req.json();
    const validatedData = validateRequest(body);

    if (!validatedData) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Provide caldav_url, caldav_username, and caldav_password.' },
        { status: 400 }
      );
    }

    // Test the CalDAV connection
    const encoder = new TextEncoder();
    const credentials = `${validatedData.caldav_username}:${validatedData.caldav_password}`;
    const base64 = btoa(String.fromCharCode(...encoder.encode(credentials)));

    const testRes = await fetch(validatedData.caldav_url, {
      method: 'OPTIONS',
      headers: {
        Authorization: `Basic ${base64}`,
      },
    });

    // CalDAV servers typically return 200-204 or support PROPFIND
    // We also accept 405 (Method Not Allowed) as the server responded
    if (!testRes.ok && testRes.status !== 405 && testRes.status !== 207) {
      return NextResponse.json(
        { success: false, error: `CalDAV connection failed: ${testRes.status}. Check your credentials and URL.` },
        { status: 400 }
      );
    }

    // Check if integration already exists
    const params = new URLSearchParams({
      instance: config.instance,
      provider: 'caldav',
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
      provider: 'caldav',
      caldav_url: validatedData.caldav_url,
      caldav_username: validatedData.caldav_username,
      caldav_password: validatedData.caldav_password, // Note: In production, encrypt this
      is_active: true,
    };

    let existingIntegration = null;
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

    return NextResponse.json({
      success: true,
      message: 'CalDAV calendar connected successfully',
    });
  } catch (error) {
    console.error('CalDAV connect error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
