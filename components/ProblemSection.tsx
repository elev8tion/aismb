'use client';

import React from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function ProblemSection() {
  const { t } = useTranslations();

  const icons = [
    <svg key={0} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>,
    <svg key={1} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>,
    <svg key={2} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>,
    <svg key={3} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
