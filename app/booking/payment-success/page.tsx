'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ClientLayout from '@/components/ClientLayout';
import { useTranslations } from '@/contexts/LanguageContext';
import { ASSESSMENT_FEE_CENTS } from '@/lib/booking/types';

interface SessionData {
  id: string;
  status: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  metadata: {
    booking_type: string;
    date: string;
    time: string;
    name: string;
    email: string;
    phone: string;
    notes: string;
    timezone: string;
  };
}

interface BookingResult {
  success: boolean;
  booking?: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    timezone: string;
  };
  calendarLinks?: {
    google: string;
    outlook: string;
    ics: string;
  };
  error?: string;
}

type PageState = 'loading' | 'success' | 'error' | 'unpaid';

async function processStripeSession(sessionId: string): Promise<{
  pageState: PageState;
  session: SessionData | null;
  calendarLinks: { google: string; outlook: string; ics: string } | null;
}> {
  try {
    // 1. Fetch Stripe session
    const sessionRes = await fetch(`/api/booking/stripe-session?session_id=${encodeURIComponent(sessionId)}`);
    const sessionData: { success: boolean } & SessionData = await sessionRes.json();

    if (!sessionData.success) {
      return { pageState: 'error', session: null, calendarLinks: null };
    }

    if (sessionData.payment_status !== 'paid') {
      return { pageState: 'unpaid', session: sessionData, calendarLinks: null };
    }

    // 2. Create booking from session metadata
    const meta = sessionData.metadata;
    const bookingRes = await fetch('/api/booking/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: meta.date,
        time: meta.time,
        name: meta.name,
        email: meta.email,
        phone: meta.phone || undefined,
        notes: meta.notes || undefined,
        timezone: meta.timezone,
        bookingType: 'assessment',
        stripe_session_id: sessionData.id,
        payment_amount_cents: ASSESSMENT_FEE_CENTS,
      }),
    });

    const bookingResult: BookingResult = await bookingRes.json();

    // Even if booking creation fails (e.g., already created by webhook), show success
    // since payment is confirmed
    return {
      pageState: 'success',
      session: sessionData,
      calendarLinks: bookingResult.calendarLinks || null,
    };
  } catch (err) {
    console.error('Payment success page error:', err);
    return { pageState: 'error', session: null, calendarLinks: null };
  }
}

function PaymentSuccessContent() {
  const { t } = useTranslations();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [session, setSession] = useState<SessionData | null>(null);
  const [calendarLinks, setCalendarLinks] = useState<{ google: string; outlook: string; ics: string } | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || processedRef.current) return;
    processedRef.current = true;

    let cancelled = false;

    processStripeSession(sessionId).then((result) => {
      if (cancelled) return;
      setSession(result.session);
      setCalendarLinks(result.calendarLinks);
      setPageState(result.pageState);
    });

    return () => { cancelled = true; };
  }, [sessionId]);

  const bookingT = t.booking.paymentSuccess;

  // Format display values from session metadata
  const formattedDate = session?.metadata?.date
    ? new Date(session.metadata.date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const formattedTime = session?.metadata?.time
    ? (() => {
        const [hours, mins] = session.metadata.time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
      })()
    : '';

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">{bookingT.processing}</p>
        </div>
      </div>
    );
  }

  if (pageState === 'error' || pageState === 'unpaid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] px-4">
        <div className="glass max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EF4444]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">
            {pageState === 'unpaid' ? 'Payment Not Completed' : 'Something Went Wrong'}
          </h1>
          <p className="text-white/60 mb-6">{bookingT.error}</p>
          <Link href="/" className="inline-block btn-primary px-6 py-3">
            {bookingT.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] px-4 py-12">
      <div className="glass max-w-lg w-full p-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">{bookingT.title}</h1>
          <p className="text-white/60">{bookingT.subtitle}</p>
        </div>

        {/* Payment Amount */}
        <div className="mb-6 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">{bookingT.amount}</span>
            <span className="text-lg font-bold text-[#10B981]">
              ${((session?.amount_total || ASSESSMENT_FEE_CENTS) / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Booking Details */}
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{formattedDate}</p>
              <p className="text-sm text-white/60">{formattedTime} (3 hrs)</p>
            </div>
          </div>
          {session?.metadata?.name && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{session.metadata.name}</p>
                <p className="text-sm text-white/60">{session.metadata.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* What to Expect */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{bookingT.whatToExpect}</h2>
          <ul className="space-y-2">
            {bookingT.expectItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-white/70">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-white/40">{bookingT.strategyDocNote}</p>
        </div>

        {/* Calendar Links */}
        {calendarLinks && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">{bookingT.addToCalendar}</p>
            <div className="flex gap-2">
              <a
                href={calendarLinks.google}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 text-sm bg-[#0EA5E9]/20 border border-[#0EA5E9]/30 rounded-lg hover:bg-[#0EA5E9]/30 transition-colors"
              >
                {bookingT.googleCalendar}
              </a>
              <a
                href={calendarLinks.ics}
                download="assessment.ics"
                className="flex-1 text-center px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                {bookingT.appleCalendar}
              </a>
              <a
                href={calendarLinks.outlook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
              >
                {bookingT.outlookCalendar}
              </a>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <Link href="/" className="block w-full text-center btn-primary py-3">
          {bookingT.backToHome}
        </Link>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <ClientLayout>
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </ClientLayout>
  );
}
