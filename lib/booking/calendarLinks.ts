/**
 * Calendar Link Generators
 *
 * Generate URLs that open calendar apps with pre-filled event data.
 * No OAuth required - users click the link to add to their own calendar.
 */

export interface CalendarLinkData {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
}

/**
 * Format date/time for Google Calendar URL
 * Format: YYYYMMDDTHHmmss
 */
function formatGoogleDateTime(date: string, time: string): string {
  const [hours, mins] = time.split(':');
  return `${date.replace(/-/g, '')}T${hours}${mins}00`;
}

/**
 * Generate Google Calendar "Add Event" URL
 * Opens Google Calendar with pre-filled event - no OAuth needed
 */
export function generateGoogleCalendarLink(data: CalendarLinkData): string {
  const startDateTime = formatGoogleDateTime(data.startDate, data.startTime);
  const endDateTime = formatGoogleDateTime(data.startDate, data.endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: data.title,
    dates: `${startDateTime}/${endDateTime}`,
    details: data.description,
    ctz: data.timezone,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook.com "Add Event" URL
 */
export function generateOutlookLink(data: CalendarLinkData): string {
  const startISO = `${data.startDate}T${data.startTime}:00`;
  const endISO = `${data.startDate}T${data.endTime}:00`;

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: data.title,
    body: data.description,
    startdt: startISO,
    enddt: endISO,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate ICS file content for Apple Calendar / any calendar app
 */
export function generateICSContent(data: CalendarLinkData, uid: string): string {
  const formatICSDate = (date: string, time: string): string => {
    return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
  };

  const now = new Date();
  const nowFormatted = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const description = data.description
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI KRE8TION Partners//Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowFormatted}
DTSTART;TZID=${data.timezone}:${formatICSDate(data.startDate, data.startTime)}
DTEND;TZID=${data.timezone}:${formatICSDate(data.startDate, data.endTime)}
SUMMARY:${data.title}
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

/**
 * Generate data URI for ICS file download
 */
export function generateICSDataUri(data: CalendarLinkData, uid: string): string {
  const icsContent = generateICSContent(data, uid);
  const encoded = encodeURIComponent(icsContent);
  return `data:text/calendar;charset=utf-8,${encoded}`;
}

/**
 * Generate all calendar links for a booking
 */
export function generateAllCalendarLinks(
  bookingId: string,
  guestName: string,
  guestEmail: string,
  date: string,
  startTime: string,
  endTime: string,
  timezone: string,
  notes?: string
): {
  google: string;
  outlook: string;
  icsDataUri: string;
  icsContent: string;
} {
  const data: CalendarLinkData = {
    title: `Strategy Call - ${guestName}`,
    description: `AI KRE8TION Partners Strategy Call\n\nGuest: ${guestName}\nEmail: ${guestEmail}${notes ? `\n\nNotes: ${notes}` : ''}`,
    startDate: date,
    startTime,
    endTime,
    timezone,
  };

  const uid = `booking-${bookingId}@kre8tion.com`;

  return {
    google: generateGoogleCalendarLink(data),
    outlook: generateOutlookLink(data),
    icsDataUri: generateICSDataUri(data, uid),
    icsContent: generateICSContent(data, uid),
  };
}
