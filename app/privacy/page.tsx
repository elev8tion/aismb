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
            Effective Date: February 7, 2026
          </p>

          <div className="text-[#A1A1AA] space-y-1">
            <p>Company: ELEV8TION LLC</p>
            <p>Location: Waterbury, Connecticut, USA</p>
            <p>Contact: connect@elev8tion.one</p>
          </div>

          <p className="text-[#A1A1AA]">
            This Privacy Policy explains how we collect, use, and protect information when you
            visit our website or engage our services.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p className="text-[#A1A1AA]">
              We collect only the information necessary to communicate and provide services.
            </p>
            <p className="text-[#A1A1AA]">Information you may provide:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Company name</li>
              <li>Phone number</li>
              <li>Messages submitted through forms</li>
              <li>Information shared during consultations</li>
            </ul>
            <p className="text-[#A1A1AA]">Automatically collected:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>Basic analytics data (pages visited, browser type)</li>
              <li>Device information</li>
              <li>Cookies (if enabled)</li>
            </ul>
            <p className="text-[#A1A1AA]">
              We do not intentionally collect sensitive personal data (such as SSNs, financial account numbers, etc.).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. How We Use Information</h2>
            <p className="text-[#A1A1AA]">We use collected information to:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>respond to inquiries</li>
              <li>communicate with you</li>
              <li>provide consulting services</li>
              <li>schedule calls or sessions</li>
              <li>improve our offerings</li>
              <li>send relevant updates</li>
            </ul>
            <p className="text-[#A1A1AA]">We do not sell personal information.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. AI &amp; Technology Tools</h2>
            <p className="text-[#A1A1AA]">
              ELEV8TION provides services involving artificial intelligence and automation technologies.
            </p>
            <p className="text-[#A1A1AA]">
              When delivering services, we may use third-party tools or APIs (such as AI model providers
              or software platforms). Information shared with us may be processed through these tools
              solely to provide requested services.
            </p>
            <p className="text-[#A1A1AA]">
              We do not use client data to train public AI models.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Sharing Information</h2>
            <p className="text-[#A1A1AA]">
              We may share information with trusted service providers only when necessary to:
            </p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>deliver services</li>
              <li>operate our website</li>
              <li>process payments</li>
              <li>communicate with clients</li>
            </ul>
            <p className="text-[#A1A1AA]">We do not sell or rent personal data.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Data Storage &amp; Security</h2>
            <p className="text-[#A1A1AA]">
              We use reasonable safeguards to protect information.
              However, no method of online transmission or storage is completely secure.
            </p>
            <p className="text-[#A1A1AA]">
              Users are responsible for maintaining the security of their own systems and credentials.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">6. Client Data Access</h2>
            <p className="text-[#A1A1AA]">
              When providing consulting services, clients may provide access to systems, tools, or data.
            </p>
            <p className="text-[#A1A1AA]">
              We access such data only as needed to deliver services and do not retain it longer than necessary.
            </p>
            <p className="text-[#A1A1AA]">
              Clients are responsible for ensuring they have rights to share any data provided.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">7. Cookies &amp; Analytics</h2>
            <p className="text-[#A1A1AA]">
              Our website may use cookies or analytics tools to understand usage and improve the site.
            </p>
            <p className="text-[#A1A1AA]">
              You may disable cookies in your browser settings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">8. Your Rights</h2>
            <p className="text-[#A1A1AA]">You may request:</p>
            <ul className="list-disc list-inside text-[#A1A1AA] space-y-1">
              <li>access to your information</li>
              <li>correction of your information</li>
              <li>deletion of your information</li>
            </ul>
            <p className="text-[#A1A1AA]">
              To request changes, contact: connect@elev8tion.one
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">9. Third-Party Links</h2>
            <p className="text-[#A1A1AA]">
              Our website may contain links to external websites.
              We are not responsible for the privacy practices of third-party sites.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">10. Children&apos;s Privacy</h2>
            <p className="text-[#A1A1AA]">
              Our services are intended for business use and not directed to children under 13.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">11. Updates to This Policy</h2>
            <p className="text-[#A1A1AA]">
              We may update this Privacy Policy periodically.
              The updated version will be posted on this page with a revised effective date.
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
