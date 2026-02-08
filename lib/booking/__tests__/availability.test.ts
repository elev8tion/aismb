import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  minutesToTime,
  timeToMinutes,
  formatTimeLabel,
  getDayOfWeek,
  isDateBlocked,
  getAvailableSlots,
  calculateEndTime,
  getWeekdaySettings,
  isSlotBooked,
} from '../availability';
import type { AvailabilitySetting, BlockedDate, Booking } from '../types';

describe('minutesToTime', () => {
  it('converts 0 to 00:00', () => {
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('converts 540 to 09:00', () => {
    expect(minutesToTime(540)).toBe('09:00');
  });

  it('converts 810 to 13:30', () => {
    expect(minutesToTime(810)).toBe('13:30');
  });

  it('converts 1020 to 17:00', () => {
    expect(minutesToTime(1020)).toBe('17:00');
  });
});

describe('timeToMinutes', () => {
  it('converts 00:00 to 0', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });

  it('converts 09:00 to 540', () => {
    expect(timeToMinutes('09:00')).toBe(540);
  });

  it('converts 13:30 to 810', () => {
    expect(timeToMinutes('13:30')).toBe(810);
  });

  it('round-trips with minutesToTime', () => {
    expect(timeToMinutes(minutesToTime(720))).toBe(720);
  });
});

describe('formatTimeLabel', () => {
  it('formats 09:00 as 9:00 AM', () => {
    expect(formatTimeLabel('09:00')).toBe('9:00 AM');
  });

  it('formats 13:30 as 1:30 PM', () => {
    expect(formatTimeLabel('13:30')).toBe('1:30 PM');
  });

  it('formats 00:00 as 12:00 AM', () => {
    expect(formatTimeLabel('00:00')).toBe('12:00 AM');
  });

  it('formats 12:00 as 12:00 PM', () => {
    expect(formatTimeLabel('12:00')).toBe('12:00 PM');
  });
});

describe('getDayOfWeek', () => {
  it('returns 0 for a known Sunday', () => {
    // 2026-02-08 is a Sunday
    expect(getDayOfWeek('2026-02-08')).toBe(0);
  });

  it('returns 1 for a known Monday', () => {
    // 2026-02-09 is a Monday
    expect(getDayOfWeek('2026-02-09')).toBe(1);
  });
});

describe('isDateBlocked', () => {
  const blocked: BlockedDate[] = [
    { id: '1', date: '2026-02-10', reason: 'Holiday' },
    { id: '2', date: '2026-02-14' },
  ];

  it('returns true for a blocked date', () => {
    expect(isDateBlocked('2026-02-10', blocked)).toBe(true);
  });

  it('returns false for an unblocked date', () => {
    expect(isDateBlocked('2026-02-11', blocked)).toBe(false);
  });

  it('returns false with empty blocked list', () => {
    expect(isDateBlocked('2026-02-10', [])).toBe(false);
  });
});

describe('getWeekdaySettings', () => {
  it('returns default Mon-Fri settings when no custom settings', () => {
    const result = getWeekdaySettings(1, []); // Monday
    expect(result).toBeDefined();
    expect(result!.is_available).toBe(true);
    expect(result!.start_minutes).toBe(540);
    expect(result!.end_minutes).toBe(1020);
  });

  it('returns undefined-equivalent for Sunday by default', () => {
    const result = getWeekdaySettings(0, []); // Sunday
    expect(result).toBeDefined();
    expect(result!.is_available).toBe(false);
  });

  it('uses custom settings over defaults', () => {
    const custom: AvailabilitySetting[] = [
      { id: '1', weekday: 1, start_minutes: 600, end_minutes: 900, is_available: true },
    ];
    const result = getWeekdaySettings(1, custom);
    expect(result!.start_minutes).toBe(600);
    expect(result!.end_minutes).toBe(900);
  });
});

describe('isSlotBooked', () => {
  const bookings: Booking[] = [
    {
      id: '1', guest_name: 'Test', guest_email: 'test@test.com',
      booking_date: '2026-02-10', start_time: '10:00', end_time: '10:30',
      timezone: 'America/New_York', status: 'confirmed', created_at: '',
    },
  ];

  it('returns true for overlapping slot', () => {
    expect(isSlotBooked(600, 630, bookings)).toBe(true); // 10:00-10:30
  });

  it('returns false for non-overlapping slot', () => {
    expect(isSlotBooked(630, 660, bookings)).toBe(false); // 10:30-11:00
  });

  it('ignores cancelled bookings', () => {
    const cancelled: Booking[] = [{
      ...bookings[0],
      status: 'cancelled',
    }];
    expect(isSlotBooked(600, 630, cancelled)).toBe(false);
  });
});

describe('getAvailableSlots', () => {
  beforeEach(() => {
    // Set fake time to morning of a different day so same-day filtering doesn't apply
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-01T08:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty for blocked date', () => {
    const blocked: BlockedDate[] = [{ id: '1', date: '2026-02-10' }];
    const slots = getAvailableSlots('2026-02-10', [], blocked, []);
    expect(slots).toHaveLength(0);
  });

  it('returns empty for unavailable day (Saturday)', () => {
    // 2026-02-07 is a Saturday
    const slots = getAvailableSlots('2026-02-07', [], [], []);
    expect(slots).toHaveLength(0);
  });

  it('returns slots for a weekday with default settings', () => {
    // 2026-02-09 is a Monday
    const slots = getAvailableSlots('2026-02-09', [], [], []);
    expect(slots.length).toBeGreaterThan(0);
    // 9am-5pm = 8 hours = 16 half-hour slots
    expect(slots).toHaveLength(16);
  });

  it('marks booked slots as unavailable', () => {
    const bookings: Booking[] = [{
      id: '1', guest_name: 'Test', guest_email: 'test@test.com',
      booking_date: '2026-02-09', start_time: '09:00', end_time: '09:30',
      timezone: 'America/New_York', status: 'confirmed', created_at: '',
    }];
    const slots = getAvailableSlots('2026-02-09', [], [], bookings);
    const slot9am = slots.find(s => s.time === '09:00');
    expect(slot9am).toBeDefined();
    expect(slot9am!.available).toBe(false);
  });

  it('each slot has time, available, and label', () => {
    const slots = getAvailableSlots('2026-02-09', [], [], []);
    const first = slots[0];
    expect(first).toHaveProperty('time');
    expect(first).toHaveProperty('available');
    expect(first).toHaveProperty('label');
    expect(first.label).toContain('AM');
  });
});

describe('calculateEndTime', () => {
  it('calculates end time with default 30-min duration', () => {
    expect(calculateEndTime('09:00')).toBe('09:30');
  });

  it('calculates end time with custom duration', () => {
    expect(calculateEndTime('09:00', 60)).toBe('10:00');
  });

  it('handles time crossing noon', () => {
    expect(calculateEndTime('11:45', 30)).toBe('12:15');
  });
});
