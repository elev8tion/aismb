import { ICalendarProvider, generateICS } from './provider';
import { CalendarEventData, CalendarEventResult, CalendarIntegration } from '../types';

/**
 * CalDAV Provider for Apple Calendar and other CalDAV-compatible services
 * Uses raw HTTP to communicate with CalDAV servers
 */
export class CalDAVProvider implements ICalendarProvider {
  name = 'caldav';

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
        provider: 'caldav',
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
      console.error('Failed to load CalDAV integration:', err);
    }

    return null;
  }

  /**
   * Create Basic Auth header
   */
  private getAuthHeader(username: string, password: string): string {
    // Use TextEncoder for Edge runtime compatibility
    const credentials = `${username}:${password}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(credentials);
    const base64 = btoa(String.fromCharCode(...data));
    return `Basic ${base64}`;
  }

  async isConfigured(): Promise<boolean> {
    const integration = await this.loadIntegration();
    return !!(
      integration?.caldav_url &&
      integration?.caldav_username &&
      integration?.caldav_password
    );
  }

  async createEvent(event: CalendarEventData): Promise<CalendarEventResult> {
    const integration = await this.loadIntegration();
    if (!integration?.caldav_url || !integration?.caldav_username || !integration?.caldav_password) {
      throw new Error('CalDAV is not configured');
    }

    // Generate unique event ID
    const eventId = crypto.randomUUID();
    const uid = `${eventId}@kre8tion.com`;

    // Generate ICS content
    const icsContent = generateICS(event, uid);

    // Construct the event URL
    const calendarUrl = integration.caldav_url.endsWith('/')
      ? integration.caldav_url
      : `${integration.caldav_url}/`;
    const eventUrl = `${calendarUrl}${eventId}.ics`;

    // Create the event via PUT request
    const res = await fetch(eventUrl, {
      method: 'PUT',
      headers: {
        Authorization: this.getAuthHeader(integration.caldav_username, integration.caldav_password),
        'Content-Type': 'text/calendar; charset=utf-8',
        'If-None-Match': '*', // Only create, don't update
      },
      body: icsContent,
    });

    if (!res.ok && res.status !== 201 && res.status !== 204) {
      const error = await res.text();
      console.error('CalDAV create event error:', res.status, error);
      throw new Error(`Failed to create CalDAV event: ${res.status}`);
    }

    return {
      eventId: uid,
      // CalDAV doesn't provide automatic meeting links
    };
  }

  async updateEvent(eventId: string, event: CalendarEventData): Promise<void> {
    const integration = await this.loadIntegration();
    if (!integration?.caldav_url || !integration?.caldav_username || !integration?.caldav_password) {
      throw new Error('CalDAV is not configured');
    }

    // Extract the base event ID from the UID
    const baseEventId = eventId.replace('@kre8tion.com', '');

    // Generate updated ICS content
    const icsContent = generateICS(event, eventId);

    // Construct the event URL
    const calendarUrl = integration.caldav_url.endsWith('/')
      ? integration.caldav_url
      : `${integration.caldav_url}/`;
    const eventUrl = `${calendarUrl}${baseEventId}.ics`;

    const res = await fetch(eventUrl, {
      method: 'PUT',
      headers: {
        Authorization: this.getAuthHeader(integration.caldav_username, integration.caldav_password),
        'Content-Type': 'text/calendar; charset=utf-8',
      },
      body: icsContent,
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to update CalDAV event: ${res.status}`);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    const integration = await this.loadIntegration();
    if (!integration?.caldav_url || !integration?.caldav_username || !integration?.caldav_password) {
      throw new Error('CalDAV is not configured');
    }

    // Extract the base event ID from the UID
    const baseEventId = eventId.replace('@kre8tion.com', '');

    // Construct the event URL
    const calendarUrl = integration.caldav_url.endsWith('/')
      ? integration.caldav_url
      : `${integration.caldav_url}/`;
    const eventUrl = `${calendarUrl}${baseEventId}.ics`;

    const res = await fetch(eventUrl, {
      method: 'DELETE',
      headers: {
        Authorization: this.getAuthHeader(integration.caldav_username, integration.caldav_password),
      },
    });

    if (!res.ok && res.status !== 204 && res.status !== 404) {
      throw new Error(`Failed to delete CalDAV event: ${res.status}`);
    }
  }
}

/**
 * Apple iCloud CalDAV URLs:
 * - CalDAV Base: https://caldav.icloud.com/
 * - Calendar: https://p{XX}-caldav.icloud.com/{user-id}/calendars/{calendar-id}/
 *
 * To get the calendar URL, you need to:
 * 1. Use the iCloud app-specific password
 * 2. Query the CalDAV principal URL
 * 3. List available calendars
 *
 * For simplicity, users can provide the full calendar URL from iCloud settings.
 */
