'use client';

import { useState, FormEvent } from 'react';
import { BookingType, BookingStatus, CalendarProvider } from '@/lib/booking/types';

interface AdminBookingFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function AdminBookingForm({ onSuccess, onError }: AdminBookingFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Required fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');

  // Optional fields
  const [guestPhone, setGuestPhone] = useState('');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<BookingStatus>('confirmed');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [challenge, setChallenge] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [bookingType, setBookingType] = useState<BookingType>('consultation');
  const [stripeSessionId, setStripeSessionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentAmountCents, setPaymentAmountCents] = useState('');
  const [calendarProvider, setCalendarProvider] = useState<CalendarProvider | ''>('');
  const [calendarEventId, setCalendarEventId] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const payload = {
        // Required
        guest_name: guestName,
        guest_email: guestEmail,
        booking_date: bookingDate,
        start_time: startTime,

        // Optional (only send if filled)
        ...(guestPhone && { guest_phone: guestPhone }),
        timezone,
        ...(notes && { notes }),
        status,
        ...(companyName && { company_name: companyName }),
        ...(industry && { industry }),
        ...(employeeCount && { employee_count: employeeCount }),
        ...(challenge && { challenge }),
        ...(referralSource && { referral_source: referralSource }),
        ...(websiteUrl && { website_url: websiteUrl }),
        booking_type: bookingType,
        ...(stripeSessionId && { stripe_session_id: stripeSessionId }),
        ...(paymentStatus && { payment_status: paymentStatus }),
        ...(paymentAmountCents && { payment_amount_cents: parseInt(paymentAmountCents) }),
        ...(calendarProvider && { calendar_provider: calendarProvider }),
        ...(calendarEventId && { calendar_event_id: calendarEventId }),
        ...(meetingLink && { meeting_link: meetingLink }),
        ...(durationMinutes && { duration_minutes: parseInt(durationMinutes) }),
      };

      const res = await fetch('/api/admin/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json() as { success?: boolean; error?: string };

      if (result.success) {
        setSuccess(true);
        // Reset form
        setGuestName('');
        setGuestEmail('');
        setBookingDate('');
        setStartTime('');
        setGuestPhone('');
        setNotes('');
        setCompanyName('');
        setIndustry('');
        setEmployeeCount('');
        setChallenge('');
        setReferralSource('');
        setWebsiteUrl('');
        setStripeSessionId('');
        setPaymentStatus('');
        setPaymentAmountCents('');
        setCalendarEventId('');
        setMeetingLink('');

        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      if (onError) onError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="p-4 bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-lg text-sm text-[#22C55E]">
            ✅ Booking created successfully!
          </div>
        )}

        {/* Required Fields Section */}
        <div className="glass p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Required Information</h3>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Guest Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Guest Email <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Booking Date <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={today}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0EA5E9]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Start Time <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0EA5E9]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                placeholder="30"
                min="15"
                step="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0EA5E9]"
              >
                <option value="America/Los_Angeles">Pacific (PST/PDT)</option>
                <option value="America/Denver">Mountain (MST/MDT)</option>
                <option value="America/Chicago">Central (CST/CDT)</option>
                <option value="America/New_York">Eastern (EST/EDT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact & Business Info */}
        <div className="glass p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Contact & Business Information</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                placeholder="Healthcare, Retail, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Employee Count
              </label>
              <select
                value={employeeCount}
                onChange={(e) => setEmployeeCount(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0EA5E9]"
              >
                <option value="">Select...</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Main Challenge
            </label>
            <textarea
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
              placeholder="Describe the main business challenge..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Referral Source
            </label>
            <input
              type="text"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
              placeholder="Google, LinkedIn, Referral, etc."
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="glass p-6 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4">Booking Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Booking Type
              </label>
              <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as BookingType)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0EA5E9]"
              >
                <option value="consultation">Free Consultation (30 min)</option>
                <option value="assessment">On-Site Assessment ($250)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0EA5E9]"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Meeting Link (Zoom, Google Meet, etc.)
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
              placeholder="https://zoom.us/j/123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
              placeholder="Internal notes about this booking..."
            />
          </div>
        </div>

        {/* Payment & Calendar Integration (Optional Advanced Fields) */}
        <details className="glass">
          <summary className="px-6 py-4 cursor-pointer font-medium text-white/80 hover:text-white">
            Advanced Fields (Payment & Calendar Integration)
          </summary>
          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Stripe Session ID
                </label>
                <input
                  type="text"
                  value={stripeSessionId}
                  onChange={(e) => setStripeSessionId(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                  placeholder="cs_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Payment Status
                </label>
                <input
                  type="text"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                  placeholder="paid, pending, failed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Payment Amount (cents)
              </label>
              <input
                type="number"
                value={paymentAmountCents}
                onChange={(e) => setPaymentAmountCents(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                placeholder="25000 = $250.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Calendar Provider
                </label>
                <select
                  value={calendarProvider}
                  onChange={(e) => setCalendarProvider(e.target.value as CalendarProvider | '')}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#0EA5E9]"
                >
                  <option value="">None</option>
                  <option value="google">Google Calendar</option>
                  <option value="caldav">CalDAV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Calendar Event ID
                </label>
                <input
                  type="text"
                  value={calendarEventId}
                  onChange={(e) => setCalendarEventId(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                  placeholder="Event ID from calendar system"
                />
              </div>
            </div>
          </div>
        </details>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-6 py-3 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 disabled:bg-[#0EA5E9]/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {submitting ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </form>
    </div>
  );
}
