import { ICalendarProvider } from './provider';
import { CalendarEventData, CalendarEventResult, CalendarIntegration } from '../types';

/**
 * Google Calendar Provider
 * Uses OAuth 2.0 for authentication and Google Calendar API
 */
export class GoogleCalendarProvider implements ICalendarProvider {
  name = 'google';

  private integration: CalendarIntegration | null = null;
  private dataApiUrl: string;
  private instance: string;

  constructor() {
    this.dataApiUrl = process.env.NCB_DATA_API_URL || '';
    this.instance = process.env.NCB_INSTANCE || '';
  }

  /**
   * Load integration from database
   */
  private async loadIntegration(): Promise<CalendarIntegration | null> {
    if (this.integration) return this.integration;

    try {
      const params = new URLSearchParams({
        instance: this.instance,
        provider: 'google',
        is_active: 'true',
      });

      const res = await fetch(`${this.dataApiUrl}/read/calendar_integrations?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Database-Instance': this.instance,
        },
      });

      if (res.ok) {
        const data: { data?: CalendarIntegration[] } = await res.json();
        const integrations = data.data || [];
        if (integrations.length > 0) {
          this.integration = integrations[0];
          return this.integration;
        }
      }
    } catch (err) {
      console.error('Failed to load Google Calendar integration:', err);
    }

    return null;
  }

  /**
   * Refresh access token if expired
   */
  private async refreshAccessToken(): Promise<string | null> {
    const integration = await this.loadIntegration();
    if (!integration?.refresh_token) return null;

    // Check if token is still valid (with 5 min buffer)
    if (integration.expires_at) {
      const expiresAt = new Date(integration.expires_at);
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5);

      if (expiresAt > now && integration.access_token) {
        return integration.access_token;
      }
    }

    // Refresh the token
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId || '',
          client_secret: clientSecret || '',
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenRes.ok) {
        console.error('Token refresh failed:', await tokenRes.text());
        return null;
      }

      const tokenData: { access_token?: string; expires_in?: number } = await tokenRes.json();
      const newAccessToken = tokenData.access_token;
      const expiresIn = tokenData.expires_in || 3600;

      if (!newAccessToken) {
        console.error('No access token in refresh response');
        return null;
      }

      // Calculate new expiry time
      const newExpiresAt = new Date();
      newExpiresAt.setSeconds(newExpiresAt.getSeconds() + expiresIn);

      // Update token in database
      await this.updateIntegrationTokens(newAccessToken, newExpiresAt.toISOString());

      this.integration = {
        ...integration,
        access_token: newAccessToken,
        expires_at: newExpiresAt.toISOString(),
      };

      return newAccessToken;
    } catch (err) {
      console.error('Token refresh error:', err);
      return null;
    }
  }

  /**
   * Update tokens in database
   */
  private async updateIntegrationTokens(accessToken: string, expiresAt: string): Promise<void> {
    const integration = await this.loadIntegration();
    if (!integration?.id) return;

    try {
      const params = new URLSearchParams({ instance: this.instance });
      await fetch(`${this.dataApiUrl}/update/calendar_integrations/${integration.id}?${params.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Database-Instance': this.instance,
        },
        body: JSON.stringify({
          access_token: accessToken,
          expires_at: expiresAt,
        }),
      });
    } catch (err) {
      console.error('Failed to update integration tokens:', err);
    }
  }

  async isConfigured(): Promise<boolean> {
    const integration = await this.loadIntegration();
    return !!(integration?.access_token || integration?.refresh_token);
  }

  async createEvent(event: CalendarEventData): Promise<CalendarEventResult> {
    const accessToken = await this.refreshAccessToken();
    if (!accessToken) {
      throw new Error('Google Calendar is not configured or token refresh failed');
    }

    const integration = await this.loadIntegration();
    const calendarId = integration?.calendar_id || 'primary';

    // Create event with Google Meet conferencing
    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: event.timezone,
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: event.timezone,
      },
      attendees: [
        { email: event.attendeeEmail, displayName: event.attendeeName },
      ],
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!res.ok) {
      const error = await res.text();
      console.error('Google Calendar create event error:', error);
      throw new Error(`Failed to create Google Calendar event: ${res.status}`);
    }

    interface GoogleCalendarEvent {
      id: string;
      conferenceData?: {
        entryPoints?: Array<{ entryPointType: string; uri: string }>;
      };
    }
    const createdEvent: GoogleCalendarEvent = await res.json();
    const meetingLink = createdEvent.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri;

    return {
      eventId: createdEvent.id,
      meetingLink,
    };
  }

  async updateEvent(eventId: string, event: CalendarEventData): Promise<void> {
    const accessToken = await this.refreshAccessToken();
    if (!accessToken) {
      throw new Error('Google Calendar is not configured');
    }

    const integration = await this.loadIntegration();
    const calendarId = integration?.calendar_id || 'primary';

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: event.timezone,
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: event.timezone,
      },
      attendees: [
        { email: event.attendeeEmail, displayName: event.attendeeName },
      ],
    };

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to update Google Calendar event: ${res.status}`);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    const accessToken = await this.refreshAccessToken();
    if (!accessToken) {
      throw new Error('Google Calendar is not configured');
    }

    const integration = await this.loadIntegration();
    const calendarId = integration?.calendar_id || 'primary';

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete Google Calendar event: ${res.status}`);
    }
  }
}

/**
 * Generate Google OAuth URL for initial authorization
 */
export function generateGoogleOAuthUrl(state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri || '',
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
