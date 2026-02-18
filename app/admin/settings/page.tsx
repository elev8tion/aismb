'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AdminSettingsContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    oauth_denied: 'Google OAuth was denied. Please try again.',
    no_code: 'No authorization code received from Google.',
    invalid_state: 'Security state mismatch. Please try again.',
    token_exchange: 'Failed to exchange authorization code for tokens.',
    callback_failed: 'OAuth callback failed. Check server logs.',
    not_configured: 'Google OAuth credentials are not configured.',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <a href="/admin/bookings" className="text-white/40 hover:text-white/70 transition-colors text-sm">
              ← Admin Bookings
            </a>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Calendar Settings</h1>
          <p className="text-white/60">Connect your calendar to automatically create events for new bookings.</p>
        </div>

        {/* Status messages */}
        {success === 'google_connected' && (
          <div className="mb-6 p-4 bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-lg text-[#22C55E] flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Google Calendar connected successfully!</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg text-[#EF4444] flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <p className="font-medium">Connection failed</p>
              <p className="text-sm text-[#EF4444]/80 mt-1">{errorMessages[error] ?? error}</p>
            </div>
          </div>
        )}

        {/* Google Calendar */}
        <div className="glass p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
              <GoogleCalendarIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1">Google Calendar</h2>
              <p className="text-sm text-white/60 mb-4">
                Automatically create Google Calendar events with Google Meet links when new bookings are made.
              </p>
              <a
                href="/api/booking/calendar/google/auth"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 font-medium rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                <GoogleCalendarIcon className="w-4 h-4" />
                {success === 'google_connected' ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
              </a>
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <details className="glass">
          <summary className="px-6 py-4 cursor-pointer font-medium text-white/80 hover:text-white">
            Setup Instructions &amp; Required Environment Variables
          </summary>
          <div className="px-6 pb-6 text-sm text-white/70 space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Create a Google Cloud Project</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <span className="text-[#0EA5E9]">console.cloud.google.com</span></li>
                <li>Create a new project (e.g. &ldquo;kre8tion-calendar&rdquo;)</li>
                <li>Enable the <strong className="text-white">Google Calendar API</strong></li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">2. Create OAuth 2.0 Credentials</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to APIs &amp; Services → Credentials</li>
                <li>Create OAuth 2.0 Client ID (Web application)</li>
                <li>Add authorized redirect URI:</li>
              </ol>
              <code className="block mt-2 p-2 bg-black/30 rounded text-[#22C55E] text-xs break-all">
                https://kre8tion.com/api/booking/calendar/google/callback
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">3. Set Cloudflare Pages Secrets</h3>
              <p className="mb-2">Add to <strong className="text-white">kre8tion-app</strong> CF Pages secrets:</p>
              <div className="space-y-1 font-mono text-xs">
                <p><span className="text-[#0EA5E9]">GOOGLE_CLIENT_ID</span> <span className="text-white/40">=</span> your-client-id.apps.googleusercontent.com</p>
                <p><span className="text-[#0EA5E9]">GOOGLE_CLIENT_SECRET</span> <span className="text-white/40">=</span> GOCSPX-...</p>
                <p><span className="text-[#0EA5E9]">GOOGLE_REDIRECT_URI</span> <span className="text-white/40">=</span> https://kre8tion.com/api/booking/calendar/google/callback</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">4. Connect &amp; Test</h3>
              <p>After deploying with the new secrets, click &ldquo;Connect Google Calendar&rdquo; above. Create a test booking at <span className="text-[#0EA5E9]">kre8tion.com</span> and verify the event appears in Google Calendar.</p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense>
      <AdminSettingsContent />
    </Suspense>
  );
}

function GoogleCalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 14l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
