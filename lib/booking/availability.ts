import {
  AvailabilitySetting,
  BlockedDate,
  LandingPageBooking as Booking,
  TimeSlot,
  MEETING_DURATION,
  DEFAULT_AVAILABILITY,
} from '@kre8tion/shared-types';
import {
  formatTimeLabel as _formatTimeLabel,
  formatDateDisplay as _formatDateDisplay,
} from '@/lib/shared/formatters';

// Re-export shared formatters for backward compatibility
export const formatTimeLabel = _formatTimeLabel;
export const formatDateDisplay = _formatDateDisplay;

/**
 * Convert minutes from midnight to HH:mm format
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Convert HH:mm to minutes from midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

/**
 * Extract minutes-from-midnight from any time or datetime string.
 * Handles:
 *   "HH:mm"                    — landing page format
 *   "HH:mm:ss"                 — with seconds
 *   "YYYY-MM-DDTHH:mm:ss"      — ISO 8601 datetime (CRM format)
 *   "YYYY-MM-DD HH:mm:ss"      — MySQL datetime (CRM format)
 */
export function extractTimeMinutes(timeStr: string): number {
  let timePart: string;
  if (timeStr.includes('T')) {
    // ISO 8601: "2026-02-17T10:00:00" → "10:00"
    timePart = timeStr.split('T')[1]?.slice(0, 5) ?? '00:00';
  } else if (timeStr.includes(' ') && timeStr.indexOf(' ') > 5) {
    // MySQL datetime: "2026-02-17 10:00:00" → "10:00"
    timePart = timeStr.split(' ')[1]?.slice(0, 5) ?? '00:00';
  } else {
    // Already time-only: "10:00" or "10:00:00" → take first 5 chars
    timePart = timeStr.slice(0, 5);
  }
  return timeToMinutes(timePart);
}

/**
 * Extract YYYY-MM-DD from a date or datetime string.
 * Handles "YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ss".
 */
export function extractDateString(dateStr: string): string {
  return dateStr.slice(0, 10);
}

/**
 * Get the day of week (0-6) for a given date string
 */
export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T12:00:00'); // Use noon to avoid timezone issues
  return date.getDay();
}

/**
 * Check if a date is blocked
 */
export function isDateBlocked(dateStr: string, blockedDates: BlockedDate[]): boolean {
  return blockedDates.some((blocked) => blocked.date === dateStr);
}

/**
 * Get availability settings for a specific weekday
 */
export function getWeekdaySettings(
  weekday: number,
  settings: AvailabilitySetting[]
): AvailabilitySetting | undefined {
  // First try to find settings from DB
  const setting = settings.find((s) => s.weekday === weekday);
  if (setting) return setting;

  // Fall back to defaults
  const defaultSetting = DEFAULT_AVAILABILITY.find((s) => s.weekday === weekday);
  if (defaultSetting) {
    return { id: 'default', ...defaultSetting };
  }

  return undefined;
}

/**
 * Check if a time slot overlaps with an existing booking.
 * Handles both time-only ("HH:mm") and full datetime strings ("YYYY-MM-DDTHH:mm:ss")
 * for start_time/end_time — the CRM stores full datetimes, the landing page stores time-only.
 */
export function isSlotBooked(
  slotStart: number,
  slotEnd: number,
  bookings: Booking[]
): boolean {
  return bookings.some((booking) => {
    if (booking.status === 'cancelled') return false;

    const bookingStart = extractTimeMinutes(booking.start_time);
    const bookingEnd = extractTimeMinutes(booking.end_time);

    // Check for overlap
    return slotStart < bookingEnd && slotEnd > bookingStart;
  });
}

/**
 * Generate available time slots for a specific date
 */
export function getAvailableSlots(
  dateStr: string,
  settings: AvailabilitySetting[],
  blockedDates: BlockedDate[],
  existingBookings: Booking[],
  _timezone: string = 'America/Los_Angeles'
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Check if date is blocked
  if (isDateBlocked(dateStr, blockedDates)) {
    return slots;
  }

  // Get weekday settings
  const weekday = getDayOfWeek(dateStr);
  const daySettings = getWeekdaySettings(weekday, settings);

  if (!daySettings || !daySettings.is_available) {
    return slots;
  }

  // Filter bookings for this date
  const dayBookings = existingBookings.filter(
    (b) => b.booking_date.startsWith(dateStr) && b.status !== 'cancelled'
  );

  // Generate slots at 30-minute intervals
  let currentMinutes = daySettings.start_minutes;
  const endMinutes = daySettings.end_minutes;

  // Check if date is today - if so, only show future slots
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  let minStartMinutes = 0;

  if (dateStr === today) {
    // Convert current time to minutes, add 60 min buffer for same-day bookings
    const currentMins = now.getHours() * 60 + now.getMinutes() + 60;
    minStartMinutes = Math.ceil(currentMins / 30) * 30; // Round up to next 30-min slot
  }

  while (currentMinutes + MEETING_DURATION <= endMinutes) {
    const time = minutesToTime(currentMinutes);
    const slotEnd = currentMinutes + MEETING_DURATION;

    // Skip slots that are in the past for today
    if (currentMinutes < minStartMinutes) {
      currentMinutes += 30;
      continue;
    }

    const available = !isSlotBooked(currentMinutes, slotEnd, dayBookings);

    slots.push({
      time,
      available,
      label: formatTimeLabel(time),
    });

    currentMinutes += 30;
  }

  return slots;
}

/**
 * Get available dates for the next N days.
 * Optionally pass existingBookings to filter out fully-booked days.
 */
export function getAvailableDates(
  daysAhead: number = 30,
  settings: AvailabilitySetting[],
  blockedDates: BlockedDate[],
  existingBookings?: Booking[]
): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Check if date is blocked
    if (isDateBlocked(dateStr, blockedDates)) {
      continue;
    }

    // Check if day of week is available
    const weekday = date.getDay();
    const daySettings = getWeekdaySettings(weekday, settings);

    if (!daySettings || !daySettings.is_available) {
      continue;
    }

    // If bookings provided, skip days where every slot is already taken
    if (existingBookings) {
      const slots = getAvailableSlots(dateStr, settings, blockedDates, existingBookings);
      if (slots.filter((s) => s.available).length === 0) {
        continue;
      }
    }

    dates.push(dateStr);
  }

  return dates;
}

/**
 * Calculate end time given start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number = MEETING_DURATION): string {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationMinutes;
  return minutesToTime(endMinutes);
}


/**
 * Format date in short form (e.g., "Jan 15")
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get timezone display name
 */
export function getTimezoneDisplay(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart?.value || timezone;
  } catch {
    return timezone;
  }
}
