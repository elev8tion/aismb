// Booking System Types

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type CalendarProvider = 'google' | 'caldav';
export type BookingType = 'consultation' | 'assessment';

// Assessment pricing constants
export const ASSESSMENT_FEE_CENTS = 25000; // $250.00
export const ASSESSMENT_DURATION = 60; // minutes

export interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  timezone: string;
  notes?: string;
  status: BookingStatus;
  booking_type?: BookingType;
  stripe_session_id?: string;
  payment_status?: string;
  payment_amount_cents?: number;
  calendar_provider?: CalendarProvider;
  calendar_event_id?: string;
  meeting_link?: string;
  created_at: string;
}

export interface AvailabilitySetting {
  id: string;
  weekday: number; // 0 = Sunday, 6 = Saturday
  start_minutes: number; // Minutes from midnight (e.g., 540 = 9:00 AM)
  end_minutes: number; // Minutes from midnight (e.g., 1020 = 5:00 PM)
  is_available: boolean;
}

export interface BlockedDate {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface CalendarIntegration {
  id: string;
  provider: CalendarProvider;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  calendar_id?: string;
  caldav_url?: string;
  caldav_username?: string;
  caldav_password?: string; // Encrypted app-specific password
  is_active: boolean;
}

export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
  label: string; // Formatted time for display
}

export interface BookingFormData {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  timezone: string;
  bookingType?: BookingType;
}

export interface AvailabilityRequest {
  date: string; // YYYY-MM-DD
  timezone: string;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
  timezone: string;
}

export interface CreateBookingRequest {
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  timezone: string;
  bookingType?: BookingType;
  stripe_session_id?: string;
  payment_amount_cents?: number;
}

export interface CreateBookingResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
}

// Calendar event data for creating events
export interface CalendarEventData {
  title: string;
  description: string;
  start: Date;
  end: Date;
  attendeeEmail: string;
  attendeeName: string;
  timezone: string;
}

export interface CalendarEventResult {
  eventId: string;
  meetingLink?: string;
}

// Default availability settings (Mon-Fri 9am-5pm)
export const DEFAULT_AVAILABILITY: Omit<AvailabilitySetting, 'id'>[] = [
  { weekday: 0, start_minutes: 0, end_minutes: 0, is_available: false }, // Sunday
  { weekday: 1, start_minutes: 540, end_minutes: 1020, is_available: true }, // Monday 9-5
  { weekday: 2, start_minutes: 540, end_minutes: 1020, is_available: true }, // Tuesday 9-5
  { weekday: 3, start_minutes: 540, end_minutes: 1020, is_available: true }, // Wednesday 9-5
  { weekday: 4, start_minutes: 540, end_minutes: 1020, is_available: true }, // Thursday 9-5
  { weekday: 5, start_minutes: 540, end_minutes: 1020, is_available: true }, // Friday 9-5
  { weekday: 6, start_minutes: 0, end_minutes: 0, is_available: false }, // Saturday
];

// Meeting duration in minutes
export const MEETING_DURATION = 30;
