'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function FAQSection() {
  const { t } = useTranslations();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-[#0A0A0B] py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full mb-4">
            <span className="text-sm font-medium text-[#3B82F6]">{t.faq.tag}</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {t.faq.heading}
          </h2>
          <p className="text-lg text-[#A1A1AA]">
            {t.faq.description}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {t.faq.items.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#111113] border border-[#27272A] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#18181B] transition-colors"
              >
                <span className="text-base font-medium text-white pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-[#71717A] shrink-0 transition-transform ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5">
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <p className="text-[#A1A1AA] mb-4">{t.faq.contact.question}</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-[#0EA5E9] hover:text-white font-medium transition-colors"
          >
            {t.faq.contact.cta}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
