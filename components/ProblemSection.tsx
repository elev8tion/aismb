'use client';

import React from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function ProblemSection() {
  const { t } = useTranslations();

  const icons = [
    // Dollar/bleeding money icon
    <svg key={0} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>,
    // Warning/exclamation shield icon
    <svg key={1} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>,
    // Phone missed call icon
    <svg key={2} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>,
    // Lock/security icon
    <svg key={3} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>,
  ];

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="tag inline-flex mb-4" style={{ background: 'rgba(249, 115, 22, 0.2)', borderColor: 'rgba(249, 115, 22, 0.3)', color: '#F97316' }}>
            {t.problem.tag}
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t.problem.heading}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t.problem.description}
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {t.problem.painPoints.map((point, idx) => (
            <div key={idx} className="relative glass glass-hover p-4 md:p-6 lg:p-8 transition-all duration-300 group">
              {/* Stat Badge - Positioned at top right */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <span className="text-xs md:text-sm font-bold text-[#F97316] px-3 py-1.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                  {point.stat}
                </span>
              </div>

              {/* Icon */}
              <div className="w-16 h-16 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 text-[#F97316] transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                {icons[idx]}
              </div>

              {/* Content */}
              <div className="pr-16 md:pr-20">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-3 leading-tight">
                  {point.title}
                </h3>
              </div>

              <p className="text-white/60 text-sm md:text-base leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
