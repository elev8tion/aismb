'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <header className="border-b border-[#27272A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/" className="inline-block">
            <Image
              src="/logos/dark_mode_brand.svg"
              alt="elev8tion"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8">Refund &amp; Cancellation Policy</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <p className="text-[#A1A1AA] text-lg">
            Effective Date: February 7, 2026
          </p>

          <div className="text-[#A1A1AA] space-y-1">
            <p>Company: ELEV8TION LLC</p>
            <p>Location: Waterbury, Connecticut</p>
            <p>Contact: connect@elev8tion.one</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Overview</h2>
            <p className="text-[#A1A1AA]">
              ELEV8TION LLC provides consulting, training, and intelligent systems architecture services.
              All services are customized, time-based, and knowledge-driven.
              As such, payments are subject to the refund and cancellation terms below.
            </p>
            <p className="text-[#A1A1AA]">
              By engaging services, signing an agreement, or submitting payment, you agree to this policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. No Refunds for Delivered Services</h2>
            <p className="text-[#A1A1AA]">
              All fees for services that have been performed, scheduled, or delivered are non-refundable.
            </p>
            <p className="text-[#A1A1AA]">This includes but is not limited to:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>consulting sessions</li>
              <li>training sessions</li>
              <li>strategy sessions</li>
              <li>system architecture work</li>
              <li>automation or agent development</li>
              <li>implementation guidance</li>
              <li>documentation</li>
              <li>advisory time</li>
            </ul>
            <p className="text-[#A1A1AA]">
              Once work has been performed or time has been reserved and delivered, payment for that work is final.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Deposits &amp; Setup Fees</h2>
            <p className="text-[#A1A1AA]">
              Any deposit, onboarding fee, or initial setup fee is non-refundable.
            </p>
            <p className="text-[#A1A1AA]">
              Deposits secure scheduling, preparation, and allocation of time and resources.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Monthly Partnership Services</h2>
            <p className="text-[#A1A1AA]">For services billed on a monthly basis:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>Clients may cancel future services at any time with written notice</li>
              <li>Cancellation stops future billing after the current billing period</li>
              <li>No refunds are issued for the current or past billing periods</li>
            </ul>
            <p className="text-[#A1A1AA]">
              If a minimum engagement term applies (such as 2-, 3-, or 6-month commitments),
              the minimum term must be completed before cancellation takes effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Early Termination</h2>
            <p className="text-[#A1A1AA]">Clients may choose to stop services before completion.</p>
            <p className="text-[#A1A1AA]">If termination occurs:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>Work already completed remains payable and non-refundable</li>
              <li>Completed phases remain non-refundable</li>
              <li>Future unpaid installments beyond the termination date will not be billed</li>
              <li>Any agreed minimum term commitment remains due</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">6. Scheduling &amp; Missed Sessions</h2>
            <p className="text-[#A1A1AA]">
              Clients may request to reschedule sessions with reasonable notice.
            </p>
            <p className="text-[#A1A1AA]">
              Missed sessions without notice or failure to attend may be considered delivered and are not refundable.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">7. Scope Changes</h2>
            <p className="text-[#A1A1AA]">
              Requests outside the agreed scope of work may require a new agreement or additional fees.
              Payments already made apply only to the originally agreed scope.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">8. Chargebacks &amp; Payment Disputes</h2>
            <p className="text-[#A1A1AA]">
              Clients agree to contact ELEV8TION LLC first to resolve any billing concerns
              before initiating a chargeback or payment dispute.
            </p>
            <p className="text-[#A1A1AA]">
              Initiating a chargeback without attempting resolution may result in immediate suspension of services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">9. Exceptions</h2>
            <p className="text-[#A1A1AA]">
              Refunds are not provided except where required by law.
            </p>
            <p className="text-[#A1A1AA]">
              Any exception to this policy is made solely at the discretion of ELEV8TION LLC.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">10. Agreement to Policy</h2>
            <p className="text-[#A1A1AA]">
              By purchasing services, signing an agreement, or engaging ELEV8TION LLC,
              the client acknowledges and agrees to this Refund &amp; Cancellation Policy.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#27272A]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#0EA5E9] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
