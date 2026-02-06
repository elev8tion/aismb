'use client';

import { useState, useMemo } from 'react';

interface CalendarPickerProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  availableDates: string[];
  loading?: boolean;
}

interface DayInfo {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isToday: boolean;
  isPast: boolean;
}

export default function CalendarPicker({
  selectedDate,
  onSelectDate,
  availableDates,
  loading = false,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar days
  const calendarDays: DayInfo[] = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    const days: DayInfo[] = [];

    // Add padding for days before the first of the month
    const startPadding = firstDay.getDay();
    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isAvailable: false,
        isToday: false,
        isPast: true,
      });
    }

    // Add days of the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isPast = date < today;
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isAvailable: !isPast && availableSet.has(dateStr),
        isToday: date.toDateString() === today.toDateString(),
        isPast,
      });
    }

    // Add padding for days after the last of the month
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        isAvailable: false,
        isToday: false,
        isPast: false,
      });
    }

    return days;
  }, [currentMonth, availableSet]);

  const goToPreviousMonth = () => {
    const today = new Date();
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    // Don't go before current month
    if (newMonth.getFullYear() > today.getFullYear() ||
        (newMonth.getFullYear() === today.getFullYear() && newMonth.getMonth() >= today.getMonth())) {
      setCurrentMonth(newMonth);
    }
  };

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2); // Allow up to 2 months ahead
    if (newMonth <= maxDate) {
      setCurrentMonth(newMonth);
    }
  };

  const canGoPrevious = useMemo(() => {
    const today = new Date();
    return currentMonth.getFullYear() > today.getFullYear() ||
           (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() > today.getMonth());
  }, [currentMonth]);

  const canGoNext = useMemo(() => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    return currentMonth < maxDate;
  }, [currentMonth]);

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold">{monthName}</h3>
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm text-white/50 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayInfo, idx) => {
            const isSelected = selectedDate === dayInfo.date;
            const isClickable = dayInfo.isCurrentMonth && dayInfo.isAvailable;

            return (
              <button
                key={`${dayInfo.date}-${idx}`}
                onClick={() => isClickable && onSelectDate(dayInfo.date)}
                disabled={!isClickable}
                className={`
                  relative p-2 h-10 rounded-lg text-sm font-medium transition-all
                  ${!dayInfo.isCurrentMonth ? 'text-white/20' : ''}
                  ${dayInfo.isPast && dayInfo.isCurrentMonth ? 'text-white/30' : ''}
                  ${dayInfo.isCurrentMonth && !dayInfo.isAvailable && !dayInfo.isPast ? 'text-white/40' : ''}
                  ${isClickable ? 'hover:bg-[#0EA5E9]/20 cursor-pointer' : 'cursor-default'}
                  ${isSelected ? 'bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]' : ''}
                  ${dayInfo.isToday && !isSelected ? 'ring-1 ring-[#0EA5E9]/50' : ''}
                  ${isClickable && !isSelected ? 'text-white' : ''}
                `}
              >
                {dayInfo.day}
                {/* Availability indicator */}
                {dayInfo.isAvailable && dayInfo.isCurrentMonth && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#22C55E] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#22C55E] rounded-full" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#0EA5E9] rounded-full" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
