/**
 * Calendar Link Generators — Single Source of Truth
 *
 * Generate URLs that open calendar apps with pre-filled event data.
 * Supports both string-based inputs (booking forms) and Date-based inputs
 * (CalDAV/Google Calendar API providers).
 *
 * No OAuth required - users click the link to add to their own calendar.
 */

import type { CalendarEventData } from './types';

export interface CalendarLinkData {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
}

/** Type guard: true when input is Date-based CalendarEventData */
function isEventData(input: CalendarLinkData | CalendarEventData): input is CalendarEventData {
  return 'start' in input && input.start instanceof Date;
}

// ─── Google Calendar ────────────────────────────────────────────────────────

function formatGoogleDateTime(date: string, time: string): string {
  const [hours, mins] = time.split(':');
  return `${date.replace(/-/g, '')}T${hours}${mins}00`;
}

function formatGoogleDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateGoogleCalendarLink(data: CalendarLinkData): string;
export function generateGoogleCalendarLink(event: CalendarEventData): string;
export function generateGoogleCalendarLink(input: CalendarLinkData | CalendarEventData): string {
  if (isEventData(input)) {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: input.title,
      dates: `${formatGoogleDate(input.start)}/${formatGoogleDate(input.end)}`,
      details: input.description,
      ctz: input.timezone,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const startDateTime = formatGoogleDateTime(input.startDate, input.startTime);
  const endDateTime = formatGoogleDateTime(input.startDate, input.endTime);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${startDateTime}/${endDateTime}`,
    details: input.description,
    ctz: input.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Outlook Calendar ───────────────────────────────────────────────────────

export function generateOutlookCalendarLink(data: CalendarLinkData): string;
export function generateOutlookCalendarLink(event: CalendarEventData): string;
export function generateOutlookCalendarLink(input: CalendarLinkData | CalendarEventData): string {
  if (isEventData(input)) {
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: input.title,
      body: input.description,
      startdt: input.start.toISOString(),
      enddt: input.end.toISOString(),
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  const startISO = `${input.startDate}T${input.startTime}:00`;
  const endISO = `${input.startDate}T${input.endTime}:00`;
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: input.title,
    body: input.description,
    startdt: startISO,
    enddt: endISO,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// ─── ICS (Apple Calendar / any calendar app / CalDAV) ───────────────────────

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

export function generateICSContent(data: CalendarLinkData, uid: string): string;
export function generateICSContent(event: CalendarEventData, uid: string): string;
export function generateICSContent(input: CalendarLinkData | CalendarEventData, uid: string): string {
  const now = new Date();
  const nowFormatted = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const description = escapeICS(input.description);

  if (isEventData(input)) {
    // Date-based path (CalDAV providers) — UTC times, includes ATTENDEE/ORGANIZER
    const formatICSDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI KRE8TION Partners//Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowFormatted}
DTSTART:${formatICSDate(input.start)}
DTEND:${formatICSDate(input.end)}
SUMMARY:${escapeICS(input.title)}
DESCRIPTION:${description}
ATTENDEE;CN=${escapeICS(input.attendeeName)};RSVP=TRUE:mailto:${input.attendeeEmail}
ORGANIZER;CN=AI KRE8TION Partners:mailto:bookings@kre8tion.com
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICS(input.title)}
END:VALARM
END:VEVENT
END:VCALENDAR`;
  }

  // String-based path (user downloads) — timezone-aware times
  const formatICSDateStr = (date: string, time: string) =>
    `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI KRE8TION Partners//Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowFormatted}
DTSTART;TZID=${input.timezone}:${formatICSDateStr(input.startDate, input.startTime)}
DTEND;TZID=${input.timezone}:${formatICSDateStr(input.startDate, input.endTime)}
SUMMARY:${input.title}
DESCRIPTION:${description}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

// ─── ICS Data URI ───────────────────────────────────────────────────────────

export function generateICSDataUri(data: CalendarLinkData, uid: string): string {
  const icsContent = generateICSContent(data, uid);
  const encoded = encodeURIComponent(icsContent);
  return `data:text/calendar;charset=utf-8,${encoded}`;
}

// ─── All Links (convenience) ────────────────────────────────────────────────

export function generateAllCalendarLinks(
  bookingId: string,
  guestName: string,
  guestEmail: string,
  date: string,
  startTime: string,
  endTime: string,
  timezone: string,
  notes?: string,
  bookingType?: 'consultation' | 'assessment'
): {
  google: string;
  outlook: string;
  icsDataUri: string;
  icsContent: string;
} {
  const isAssessment = bookingType === 'assessment';
  const title = isAssessment
    ? `Onsite AI Assessment - ${guestName}`
    : `Strategy Call - ${guestName}`;
  const descPrefix = isAssessment
    ? `AI KRE8TION Partners Onsite Assessment\n\n60-minute onsite business walkthrough`
    : `AI KRE8TION Partners Strategy Call`;

  const data: CalendarLinkData = {
    title,
    description: `${descPrefix}\n\nGuest: ${guestName}\nEmail: ${guestEmail}${notes ? `\n\nNotes: ${notes}` : ''}`,
    startDate: date,
    startTime,
    endTime,
    timezone,
  };

  const uid = `booking-${bookingId}@kre8tion.com`;

  return {
    google: generateGoogleCalendarLink(data),
    outlook: generateOutlookCalendarLink(data),
    icsDataUri: generateICSDataUri(data, uid),
    icsContent: generateICSContent(data, uid),
  };
}
