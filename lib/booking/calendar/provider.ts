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
