'use client';

import { useState } from 'react';
import AdminBookingForm from '@/components/Admin/AdminBookingForm';

export default function AdminBookingsPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    setShowSuccess(true);
    setError(null);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Booking Management
          </h1>
          <p className="text-white/60">
            Manually create bookings with full control over all fields and settings.
          </p>
        </div>

        {/* Global Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-lg text-[#22C55E] flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Booking created successfully!</span>
          </div>
        )}

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg text-[#EF4444] flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <p className="font-medium">Error creating booking</p>
              <p className="text-sm text-[#EF4444]/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="glass p-6 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-white/70">
              <p className="font-medium text-white mb-1">Admin Booking Guidelines</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Only required fields are: Guest Name, Email, Date, and Start Time</li>
                <li>End time is automatically calculated based on duration</li>
                <li>Default duration is 30 minutes (can be customized)</li>
                <li>Booking will be created immediately without email confirmation</li>
                <li>Optional: Uncomment pipeline in API to send emails and sync to CRM</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <AdminBookingForm onSuccess={handleSuccess} onError={handleError} />

        {/* Quick Actions */}
        <div className="mt-8 glass p-6">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/admin/bookings/list"
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-center transition-colors"
            >
              View All Bookings
            </a>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-center transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Database Field Reference */}
        <details className="mt-6 glass">
          <summary className="px-6 py-4 cursor-pointer font-medium text-white/80 hover:text-white">
            Database Field Reference (NCB Schema)
          </summary>
          <div className="px-6 pb-6">
            <div className="text-sm text-white/60 space-y-2">
              <h4 className="font-semibold text-white mt-4 mb-2">Required Fields:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="text-[#0EA5E9]">guest_name</code> - Booking guest name</li>
                <li><code className="text-[#0EA5E9]">guest_email</code> - Guest email (indexed)</li>
                <li><code className="text-[#0EA5E9]">booking_date</code> - Date in YYYY-MM-DD (indexed)</li>
                <li><code className="text-[#0EA5E9]">start_time</code> - Start time in HH:mm</li>
                <li><code className="text-[#0EA5E9]">end_time</code> - End time in HH:mm (auto-calculated)</li>
              </ul>

              <h4 className="font-semibold text-white mt-4 mb-2">Optional Fields with Defaults:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="text-[#0EA5E9]">timezone</code> - Default: America/Los_Angeles</li>
                <li><code className="text-[#0EA5E9]">status</code> - Default: confirmed (enum: confirmed, cancelled)</li>
                <li><code className="text-[#0EA5E9]">booking_type</code> - Default: consultation (enum: consultation, assessment)</li>
                <li><code className="text-[#0EA5E9]">created_at</code> - Auto-set by database (current_timestamp)</li>
              </ul>

              <h4 className="font-semibold text-white mt-4 mb-2">Optional Fields (send null if empty):</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code className="text-[#0EA5E9]">guest_phone</code> - Phone number</li>
                <li><code className="text-[#0EA5E9]">notes</code> - Internal notes</li>
                <li><code className="text-[#0EA5E9]">company_name</code> - Company name</li>
                <li><code className="text-[#0EA5E9]">industry</code> - Industry type</li>
                <li><code className="text-[#0EA5E9]">employee_count</code> - Company size</li>
                <li><code className="text-[#0EA5E9]">challenge</code> - Main business challenge (text)</li>
                <li><code className="text-[#0EA5E9]">referral_source</code> - How they found us</li>
                <li><code className="text-[#0EA5E9]">website_url</code> - Company website</li>
                <li><code className="text-[#0EA5E9]">stripe_session_id</code> - Stripe checkout session ID</li>
                <li><code className="text-[#0EA5E9]">payment_status</code> - Payment status string</li>
                <li><code className="text-[#0EA5E9]">payment_amount_cents</code> - Amount in cents (integer)</li>
                <li><code className="text-[#0EA5E9]">calendar_provider</code> - Calendar system (enum: google, caldav)</li>
                <li><code className="text-[#0EA5E9]">calendar_event_id</code> - External calendar event ID</li>
                <li><code className="text-[#0EA5E9]">meeting_link</code> - Video conference URL</li>
              </ul>

              <h4 className="font-semibold text-white mt-4 mb-2">TypeScript Patterns:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Use <code className="text-[#22C55E]">string | null</code> for nullable fields (not string | undefined)</li>
                <li>Send <code className="text-[#22C55E]">null</code> for empty optional fields (not empty strings)</li>
                <li>Never send <code className="text-[#EF4444]">created_at</code> - DB handles it automatically</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
