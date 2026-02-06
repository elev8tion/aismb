import { CalendarEventData, CalendarEventResult } from '../types';

/**
 * Abstract calendar provider interface
 * Implements the Strategy pattern for different calendar services
 */
export interface ICalendarProvider {
  /**
   * Provider name for identification
   */
  name: string;

  /**
   * Check if provider is configured and ready
   */
  isConfigured(): Promise<boolean>;

  /**
   * Create a calendar event
   */
  createEvent(event: CalendarEventData): Promise<CalendarEventResult>;

  /**
   * Update an existing calendar event
   */
  updateEvent(eventId: string, event: CalendarEventData): Promise<void>;

  /**
   * Delete a calendar event
   */
  deleteEvent(eventId: string): Promise<void>;
}

/**
 * Generate ICS file content for universal calendar support
 */
export function generateICS(event: CalendarEventData, uid: string): string {
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeICS = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  };

  const now = new Date();
  const description = escapeICS(event.description);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI KRE8TION Partners//Booking System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(now)}
DTSTART:${formatICSDate(event.start)}
DTEND:${formatICSDate(event.end)}
SUMMARY:${escapeICS(event.title)}
DESCRIPTION:${description}
ATTENDEE;CN=${escapeICS(event.attendeeName)};RSVP=TRUE:mailto:${event.attendeeEmail}
ORGANIZER;CN=AI KRE8TION Partners:mailto:bookings@kre8tion.com
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICS(event.title)}
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

/**
 * Generate Google Calendar URL for adding event
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.start)}/${formatGoogleDate(event.end)}`,
    details: event.description,
    ctz: event.timezone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook web calendar URL
 */
export function generateOutlookUrl(event: CalendarEventData): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.start.toISOString(),
    enddt: event.end.toISOString(),
    body: event.description,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
