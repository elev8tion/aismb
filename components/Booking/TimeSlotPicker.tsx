'use client';

import { TimeSlot } from '@/lib/booking/types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  loading?: boolean;
  date: string | null;
}

export default function TimeSlotPicker({
  slots,
  selectedTime,
  onSelectTime,
  loading = false,
  date,
}: TimeSlotPickerProps) {
  // Format the selected date for display
  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const availableSlots = slots.filter((slot) => slot.available);
  const unavailableSlots = slots.filter((slot) => !slot.available);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!date) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-white/60">Please select a date first</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <svg className="w-12 h-12 mx-auto mb-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-white/60">No available times for this date</p>
        <p className="text-white/40 text-sm mt-1">Please select a different date</p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <svg className="w-12 h-12 mx-auto mb-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <p className="text-white/60">All times are booked for this date</p>
        <p className="text-white/40 text-sm mt-1">Please select a different date</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Selected Date Header */}
      <div className="text-center mb-4">
        <p className="text-sm text-white/60">Available times for</p>
        <p className="text-lg font-semibold">{formattedDate}</p>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {availableSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;

          return (
            <button
              key={slot.time}
              onClick={() => onSelectTime(slot.time)}
              className={`
                py-3 px-2 rounded-xl text-sm font-medium transition-all
                ${isSelected
                  ? 'bg-[#0EA5E9] text-white shadow-lg shadow-[#0EA5E9]/25'
                  : 'bg-white/5 border border-white/10 hover:border-[#0EA5E9]/50 hover:bg-[#0EA5E9]/10'
                }
              `}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      {/* Unavailable slots indicator */}
      {unavailableSlots.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2">
            {unavailableSlots.length} time{unavailableSlots.length > 1 ? 's' : ''} already booked
          </p>
          <div className="flex flex-wrap gap-1">
            {unavailableSlots.slice(0, 6).map((slot) => (
              <span
                key={slot.time}
                className="text-xs text-white/30 bg-white/5 px-2 py-1 rounded line-through"
              >
                {slot.label}
              </span>
            ))}
            {unavailableSlots.length > 6 && (
              <span className="text-xs text-white/30 px-2 py-1">
                +{unavailableSlots.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Meeting Duration Info */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/50">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>30 minute meeting</span>
      </div>
    </div>
  );
}
