'use client';

import { Booking } from '@/lib/booking/types';
import { formatDateDisplay, formatTimeLabel } from '@/lib/booking/availability';

interface CalendarLinks {
  google: string;
  outlook: string;
  ics: string;
}

interface BookingConfirmationProps {
  booking: Booking;
  calendarLinks?: CalendarLinks;
  onClose: () => void;
  translations: {
    title: string;
    subtitle: string;
    date: string;
    time: string;
    duration: string;
    email: string;
    addToCalendar: string;
    googleCalendar: string;
    appleCalendar: string;
    outlookCalendar: string;
    done: string;
    confirmationSent: string;
  };
}

export default function BookingConfirmation({
  booking,
  calendarLinks,
  onClose,
  translations,
}: BookingConfirmationProps) {
  const formattedDate = formatDateDisplay(booking.booking_date);
  const startTimeLabel = formatTimeLabel(booking.start_time);
  const endTimeLabel = formatTimeLabel(booking.end_time);

  // Use provided calendar links, or generate fallback URLs if not provided
  const googleUrl = calendarLinks?.google || generateFallbackGoogleUrl();
  const outlookUrl = calendarLinks?.outlook || generateFallbackOutlookUrl();
  const icsUrl = calendarLinks?.ics;

  // Fallback Google Calendar URL generator (if API doesn't provide)
  function generateFallbackGoogleUrl(): string {
    const startDateTime = `${booking.booking_date.replace(/-/g, '')}T${booking.start_time.replace(':', '')}00`;
    const endDateTime = `${booking.booking_date.replace(/-/g, '')}T${booking.end_time.replace(':', '')}00`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Strategy Call - ${booking.guest_name}`,
      dates: `${startDateTime}/${endDateTime}`,
      details: `AI KRE8TION Partners Strategy Call\n\nGuest: ${booking.guest_name}\nEmail: ${booking.guest_email}`,
      ctz: booking.timezone,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  // Fallback Outlook URL generator (if API doesn't provide)
  function generateFallbackOutlookUrl(): string {
    const startISO = `${booking.booking_date}T${booking.start_time}:00`;
    const endISO = `${booking.booking_date}T${booking.end_time}:00`;

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: `Strategy Call - ${booking.guest_name}`,
      body: `AI KRE8TION Partners Strategy Call\n\nGuest: ${booking.guest_name}\nEmail: ${booking.guest_email}`,
      startdt: startISO,
      enddt: endISO,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  // Download ICS file
  const downloadICS = () => {
    if (icsUrl) {
      // Use the data URI from the API
      const link = document.createElement('a');
      link.href = icsUrl;
      link.download = `kre8tion-booking-${booking.booking_date}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback: generate ICS content locally
      const icsContent = generateFallbackICS();
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kre8tion-booking-${booking.booking_date}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  function generateFallbackICS(): string {
    const formatICSDate = (date: string, time: string): string => {
      return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`;
    };

    const now = new Date();
    const nowFormatted = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const uid = `booking-${booking.id}@kre8tion.com`;

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI KRE8TION Partners//Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowFormatted}
DTSTART;TZID=${booking.timezone}:${formatICSDate(booking.booking_date, booking.start_time)}
DTEND;TZID=${booking.timezone}:${formatICSDate(booking.booking_date, booking.end_time)}
SUMMARY:Strategy Call - ${booking.guest_name}
DESCRIPTION:AI KRE8TION Partners Strategy Call\\n\\nGuest: ${booking.guest_name}\\nEmail: ${booking.guest_email}
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

  return (
    <div className="w-full text-center">
      {/* Success Animation */}
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#22C55E]/20 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
          <svg className="w-10 h-10 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <h3 className="text-2xl font-bold mb-2">{translations.title}</h3>
      <p className="text-white/60 mb-6">{translations.subtitle}</p>

      {/* Booking Details */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50">{translations.date}</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0EA5E9]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50">{translations.time}</p>
              <p className="font-medium">{startTimeLabel} - {endTimeLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50">{translations.email}</p>
              <p className="font-medium">{booking.guest_email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Email Note */}
      <p className="text-sm text-white/50 mb-6">
        <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {translations.confirmationSent}
      </p>

      {/* Add to Calendar Buttons */}
      <div className="mb-6">
        <p className="text-sm text-white/60 mb-3">{translations.addToCalendar}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v2.02c-2.84.48-5 2.94-5 5.91s2.16 5.43 5 5.91v2.02zm2 0v-2.02c2.84-.48 5-2.94 5-5.91s-2.16-5.43-5-5.91V4.07c3.94.49 7 3.85 7 7.93s-3.05 7.44-7 7.93z"/>
            </svg>
            {translations.googleCalendar}
          </a>
          <button
            onClick={downloadICS}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            {translations.appleCalendar}
          </button>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.75 3H2.25C1.01 3 0 4.01 0 5.25v13.5C0 19.99 1.01 21 2.25 21h19.5c1.24 0 2.25-1.01 2.25-2.25V5.25C24 4.01 22.99 3 21.75 3zM12 13.5L2.25 6.75V5.25L12 12l9.75-6.75v1.5L12 13.5z"/>
            </svg>
            {translations.outlookCalendar}
          </a>
        </div>
      </div>

      {/* Done Button */}
      <button
        onClick={onClose}
        className="w-full btn-primary"
      >
        {translations.done}
      </button>
    </div>
  );
}
