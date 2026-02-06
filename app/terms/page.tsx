'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsOfService() {
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
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <p className="text-[#A1A1AA] text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p className="text-[#A1A1AA]">
              By accessing and using AI KRE8TION Partners services, you agree to be bound by these
              Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Services Description</h2>
            <p className="text-[#A1A1AA]">
              We provide AI automation consulting and implementation services for small and
              medium-sized businesses. Our services include AI system design, development,
              training, and ongoing support.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Partnership Terms</h2>
            <p className="text-[#A1A1AA]">
              Our partnership programs involve capability transfer and knowledge building.
              Specific terms, pricing, and deliverables are outlined in individual partnership
              agreements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Intellectual Property</h2>
            <p className="text-[#A1A1AA]">
              Systems and agents built during our partnership become your property. We retain
              rights to our methodologies, frameworks, and proprietary tools used in the
              development process.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Limitation of Liability</h2>
            <p className="text-[#A1A1AA]">
              Our services are provided &quot;as is&quot; and we make no warranties regarding the
              specific results or outcomes of AI implementations. We are not liable for any
              indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">6. Contact</h2>
            <p className="text-[#A1A1AA]">
              For questions about these Terms of Service, please contact us through our
              website or reach out to our support team.
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
