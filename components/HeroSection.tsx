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
            <a href="#get-started" className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t.hero.ctaPrimary}
            </a>
            <a href="#how-it-works" className="btn-glass w-full sm:w-auto inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
