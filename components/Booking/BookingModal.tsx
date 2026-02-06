'use client';

import { useState, useEffect, useCallback } from 'react';
import CalendarPicker from './CalendarPicker';
import TimeSlotPicker from './TimeSlotPicker';
import BookingForm from './BookingForm';
import BookingConfirmation from './BookingConfirmation';
import { TimeSlot, Booking, BookingFormData } from '@/lib/booking/types';
import { useTranslations } from '@/contexts/LanguageContext';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'date' | 'time' | 'details' | 'confirmation';

export default function BookingModal({ open, onClose }: BookingModalProps) {
  const { t } = useTranslations();
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [calendarLinks, setCalendarLinks] = useState<{ google: string; outlook: string; ics: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available dates
  const fetchAvailableDates = useCallback(async () => {
    setLoadingDates(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch(`/api/booking/availability?mode=dates&timezone=${encodeURIComponent(timezone)}`);
      const data: { success?: boolean; dates?: string[] } = await res.json();
      if (data.success && data.dates) {
        setAvailableDates(data.dates);
      }
    } catch (err) {
      console.error('Failed to fetch available dates:', err);
    } finally {
      setLoadingDates(false);
    }
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep('date');
      setSelectedDate(null);
      setSelectedTime(null);
      setBooking(null);
      setError(null);
      fetchAvailableDates();
    }
  }, [open, fetchAvailableDates]);

  // Fetch time slots when date is selected
  const fetchTimeSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setTimeSlots([]);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch(`/api/booking/availability?date=${date}&timezone=${encodeURIComponent(timezone)}`);
      const data: { success?: boolean; slots?: TimeSlot[] } = await res.json();
      if (data.success && data.slots) {
        setTimeSlots(data.slots);
      }
    } catch (err) {
      console.error('Failed to fetch time slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep('time');
    fetchTimeSlots(date);
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('details');
  };

  // Handle form submission
  const handleSubmit = async (data: BookingFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: {
        success?: boolean;
        booking?: Booking;
        calendarLinks?: { google: string; outlook: string; ics: string };
        error?: string;
      } = await res.json();

      if (result.success && result.booking) {
        setBooking(result.booking);
        if (result.calendarLinks) {
          setCalendarLinks(result.calendarLinks);
        }
        setStep('confirmation');
      } else {
        setError(result.error || 'Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (step === 'time') {
      setStep('date');
      setSelectedTime(null);
    } else if (step === 'details') {
      setStep('time');
    }
  };

  // Handle close
  const handleClose = () => {
    onClose();
  };

  // Get step number for progress indicator
  const getStepNumber = (): number => {
    switch (step) {
      case 'date': return 1;
      case 'time': return 2;
      case 'details': return 3;
      case 'confirmation': return 4;
      default: return 1;
    }
  };

  if (!open) return null;

  const bookingT = t.booking;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={step !== 'confirmation' ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        <div className="glass overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step !== 'date' && step !== 'confirmation' && (
                  <button
                    onClick={handleBack}
                    className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Go back"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h2 className="text-xl font-bold">{bookingT.title}</h2>
              </div>
              {step !== 'confirmation' && (
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Progress Indicator */}
            {step !== 'confirmation' && (
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex items-center">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${getStepNumber() >= num
                          ? 'bg-[#0EA5E9] text-white'
                          : 'bg-white/10 text-white/40'
                        }
                      `}
                    >
                      {num}
                    </div>
                    {num < 3 && (
                      <div
                        className={`
                          w-8 h-0.5 mx-1
                          ${getStepNumber() > num ? 'bg-[#0EA5E9]' : 'bg-white/10'}
                        `}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            {/* Step Content */}
            {step === 'date' && (
              <div>
                <p className="text-white/60 text-sm mb-4">{bookingT.selectDate}</p>
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  availableDates={availableDates}
                  loading={loadingDates}
                />
              </div>
            )}

            {step === 'time' && selectedDate && (
              <div>
                <p className="text-white/60 text-sm mb-4">{bookingT.selectTime}</p>
                <TimeSlotPicker
                  slots={timeSlots}
                  selectedTime={selectedTime}
                  onSelectTime={handleTimeSelect}
                  loading={loadingSlots}
                  date={selectedDate}
                />
              </div>
            )}

            {step === 'details' && selectedDate && selectedTime && (
              <div>
                <p className="text-white/60 text-sm mb-4">{bookingT.enterDetails}</p>
                <BookingForm
                  date={selectedDate}
                  time={selectedTime}
                  onSubmit={handleSubmit}
                  loading={submitting}
                  translations={bookingT.form}
                />
              </div>
            )}

            {step === 'confirmation' && booking && (
              <BookingConfirmation
                booking={booking}
                calendarLinks={calendarLinks ?? undefined}
                onClose={handleClose}
                translations={bookingT.confirmation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
