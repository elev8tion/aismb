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
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8">Website Terms of Service</h1>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8">
          <p className="text-[#A1A1AA] text-lg">
            Effective Date: February 7, 2026
          </p>

          <div className="text-[#A1A1AA] space-y-1">
            <p>Company: ELEV8TION LLC</p>
            <p>Location: Waterbury, Connecticut</p>
            <p>Contact: connect@elev8tion.one</p>
          </div>

          <p className="text-[#A1A1AA]">
            These Terms of Service (&quot;Terms&quot;) govern use of the ELEV8TION website and services.
            By accessing this website or engaging services, you agree to these Terms.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Services Overview</h2>
            <p className="text-[#A1A1AA]">
              ELEV8TION provides consulting, training, and intelligent systems architecture services
              including AI workflow design, automation strategy, and capability transfer.
            </p>
            <p className="text-[#A1A1AA]">
              Information on this website is for informational purposes only and does not constitute
              professional, legal, financial, or operational advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. No Guarantees</h2>
            <p className="text-[#A1A1AA]">Any examples of:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>cost savings</li>
              <li>efficiency gains</li>
              <li>ROI</li>
              <li>performance improvements</li>
            </ul>
            <p className="text-[#A1A1AA]">are illustrative only.</p>
            <p className="text-[#A1A1AA]">Results vary by business and are not guaranteed.</p>
            <p className="text-[#A1A1AA]">
              Client outcomes depend on implementation, supervision, and internal processes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. AI &amp; Automation Use</h2>
            <p className="text-[#A1A1AA]">
              ELEV8TION works with artificial intelligence tools and automation systems.
            </p>
            <p className="text-[#A1A1AA]">Users acknowledge:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>AI outputs may be inaccurate</li>
              <li>AI systems require human review</li>
              <li>automation carries operational risk</li>
            </ul>
            <p className="text-[#A1A1AA]">
              ELEV8TION is not responsible for actions taken based on AI-generated outputs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Intellectual Property</h2>
            <p className="text-[#A1A1AA]">
              All website content, branding, frameworks, and materials are owned by ELEV8TION LLC.
            </p>
            <p className="text-[#A1A1AA]">
              No content may be copied, resold, or reused without permission.
            </p>
            <p className="text-[#A1A1AA]">
              Client projects are governed by separate service agreements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Acceptable Use</h2>
            <p className="text-[#A1A1AA]">Users agree not to:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>misuse the website</li>
              <li>attempt unauthorized access</li>
              <li>interfere with systems</li>
              <li>copy proprietary materials</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">6. Third-Party Tools</h2>
            <p className="text-[#A1A1AA]">
              The website and services may reference or use third-party platforms.
            </p>
            <p className="text-[#A1A1AA]">ELEV8TION is not responsible for:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>third-party outages</li>
              <li>platform changes</li>
              <li>third-party policies</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
            <p className="text-[#A1A1AA]">To the maximum extent permitted by law:</p>
            <p className="text-[#A1A1AA]">ELEV8TION shall not be liable for:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>indirect damages</li>
              <li>lost profits</li>
              <li>reliance on website content</li>
              <li>use of AI tools</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">8. Governing Law</h2>
            <p className="text-[#A1A1AA]">
              These Terms are governed by the laws of the State of Connecticut.
            </p>
            <p className="text-[#A1A1AA]">
              Disputes shall be resolved through arbitration in Connecticut.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">9. Changes</h2>
            <p className="text-[#A1A1AA]">
              ELEV8TION may update these Terms at any time.
            </p>
            <p className="text-[#A1A1AA]">
              Continued use of the site constitutes acceptance.
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
