/**
 * Shared Date/Time Formatters — Single Source of Truth
 *
 * Deterministic formatting that doesn't depend on Intl locale availability.
 * Used by: booking availability, email templates, booking UI components.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Format "14:00" → "2:00 PM"
 */
export function formatTimeLabel(time: string): string {
  const [hours, mins] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format "2026-02-10" → "Monday, February 10, 2026"
 */
export function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return `${DAYS[dateObj.getUTCDay()]}, ${MONTHS[month - 1]} ${day}, ${year}`;
}

/**
 * Format a date + time range for emails/confirmations:
 * "Monday, February 10, 2026 — 2:00 PM – 2:30 PM"
 */
export function formatDateTimeRange(date: string, startTime: string, endTime: string): string {
  return `${formatDateDisplay(date)} — ${formatTimeLabel(startTime)} – ${formatTimeLabel(endTime)}`;
}
