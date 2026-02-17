'use client';

import React from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function HowItWorksSection() {
  const { t } = useTranslations();

  const icons = [
    // Audit / magnifying glass icon
    <svg key={0} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>,
    // Shield / secure installation icon
    <svg key={1} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>,
    // Monitor / active monitoring icon
    <svg key={2} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>,
  ];

  const featureIcons = ['🔒', '🛡️', '📡', '⚡'];

  return (
    <section id="how-it-works" className="relative py-20 lg:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="tag inline-flex mb-4">{t.howItWorks.tag}</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t.howItWorks.heading}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-4">
            {t.howItWorks.description}
          </p>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            {t.howItWorks.subDescription}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {t.howItWorks.steps.map((step, idx) => (
            <div key={idx} className="glass glass-hover p-4 md:p-6 lg:p-8 transition-all duration-300 flex flex-col">
              {/* Step Number */}
              <div className="text-6xl font-bold text-[#0EA5E9]/20 mb-4">
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-[#0EA5E9]" style={{ background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                {icons[idx]}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed flex-grow">{step.description}</p>

              {/* Deliverable */}
              <div className="mb-5 p-3 rounded-lg" style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                <p className="text-xs text-[#0EA5E9] font-semibold mb-1">{t.howItWorks.youllGet}</p>
                <p className="text-xs text-white/80">{step.deliverable}</p>
              </div>

              {/* Duration Badge */}
              <div className="tag inline-flex text-xs">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {step.duration}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {t.howItWorks.features.map((feature, idx) => (
            <div key={idx} className="glass flex items-center gap-3 px-5 py-4">
              <span className="text-xl">{featureIcons[idx]}</span>
              <span className="text-sm text-white/70">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
