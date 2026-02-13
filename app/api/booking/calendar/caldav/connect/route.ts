/**
 * CalDAV Connection API
 *
 * Endpoint for connecting CalDAV-compatible calendars (Apple iCloud, etc.)
 * Uses Basic Auth with app-specific password.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import { caldavConnectRequestSchema, validate, formatZodErrors } from '@kre8tion/shared-types';

export const runtime = 'edge';

function getConfig() {
  const env = getEnv();
  const instance = env.NCB_INSTANCE;
  const dataApiUrl = env.NCB_DATA_API_URL;

  if (!instance || !dataApiUrl) {
    throw new Error('Missing NCB environment variables');
  }

  return { instance, dataApiUrl };
}


export async function POST(req: NextRequest) {
  try {
    const config = getConfig();
    const body = await req.json();

    // Validate with Zod schema
    const validation = validate(caldavConnectRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid CalDAV configuration', details: formatZodErrors(validation.errors) },
        { status: 400 }
      );
    }
    const validatedData = validation.data;

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
