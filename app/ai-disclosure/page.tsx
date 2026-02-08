'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AIDisclosure() {
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
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8">AI &amp; Automation Disclosure</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <p className="text-[#A1A1AA]">
            ELEV8TION works with artificial intelligence systems and automation technologies.
          </p>

          <section className="space-y-4">
            <p className="text-[#A1A1AA]">These systems:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>may produce inaccurate or incomplete outputs</li>
              <li>require human review</li>
              <li>should not be relied upon without supervision</li>
            </ul>
          </section>

          <p className="text-[#A1A1AA]">
            All AI systems built or configured for clients are tools intended to assist operations,
            not replace human oversight.
          </p>

          <p className="text-[#A1A1AA]">
            Clients remain responsible for how systems are used and deployed within their organization.
          </p>
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
