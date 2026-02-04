'use client';

import React from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function FinalCTA() {
  const { t } = useTranslations();

  return (
    <section id="get-started" className="bg-[#111113] py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 md:p-8 lg:p-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-[#22C55E]">{t.finalCta.badge}</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {t.finalCta.heading}
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-2xl mx-auto mb-8">
            {t.finalCta.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t.finalCta.ctaPrimary}
            </a>
            <a
              href="#roi-calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0A0A0B] hover:bg-[#27272A] border border-[#27272A] text-white font-medium px-8 py-4 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t.finalCta.ctaSecondary}
            </a>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-[#27272A]">
            {t.finalCta.trustSignals.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[#71717A]">
                {item.icon === 'shield' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {item.icon === 'lock' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                {item.icon === 'clock' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
