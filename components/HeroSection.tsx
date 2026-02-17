'use client';

import React from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function HeroSection() {
  const { t } = useTranslations();

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-40 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="tag flex items-center gap-2">
            <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
            <span>{t.hero.badge}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {t.hero.titlePart1} <span className="gradient-text">{t.hero.titleHighlight}</span> {t.hero.titlePart2}
          </h1>
          <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            {t.hero.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#roi-calculator" className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t.hero.ctaPrimary}
            </a>
            <a href="#pricing" className="btn-glass w-full sm:w-auto inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {[
            t.hero.stats.agentsBuilt,
            t.hero.stats.toMastery,
            t.hero.stats.smbsBuilding,
            t.hero.stats.buildIndependently,
          ].map((stat, idx) => (
            <div key={idx} className="glass glass-hover p-6 text-center transition-all duration-300">
              <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
