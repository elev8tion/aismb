'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPolicy() {
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
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <p className="text-[#A1A1AA] text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p className="text-[#A1A1AA]">
              We collect information you provide directly to us, including your name, email address,
              company information, and any other information you choose to provide when using our
              services or contacting us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
            <p className="text-[#A1A1AA]">
              We use the information we collect to provide, maintain, and improve our services,
              communicate with you about our products and services, and respond to your inquiries.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Voice Agent Data</h2>
            <p className="text-[#A1A1AA]">
              When you use our voice agent feature, your voice input is processed to provide
              responses to your questions. Voice data is not stored permanently and is used
              only for the duration of your session.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
            <p className="text-[#A1A1AA]">
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Contact Us</h2>
            <p className="text-[#A1A1AA]">
              If you have any questions about this Privacy Policy, please contact us through our
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
