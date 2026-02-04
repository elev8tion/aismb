'use client';

import React from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function PricingSection() {
  const { t } = useTranslations();

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6" id="pricing">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="tag inline-flex mb-4">{t.pricing.tag}</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t.pricing.heading}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-3">
            {t.pricing.description}
          </p>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            {t.pricing.afterMinimum}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {t.pricing.tiers.slice(0, 3).map((tier, idx) => (
            <div
              key={idx}
              className={`relative glass p-4 md:p-6 lg:p-8 transition-all duration-300 flex flex-col ${
                tier.highlighted ? 'ring-2 ring-[#0EA5E9] lg:scale-105' : 'glass-hover'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0EA5E9] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    {t.pricing.labels.recommended}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6 pt-2">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{tier.subtitle}</p>
                <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
              </div>

              {/* Pricing */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <p className="text-sm text-white/50 mb-2">{t.pricing.labels.capabilityTransfer}</p>
                <div className="text-4xl font-bold text-white mb-4">
                  {tier.setupFee}
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-semibold text-[#0EA5E9]">{tier.monthlyFee}</span>
                  <span className="text-sm text-white/50">{t.pricing.labels.monthPartnership}</span>
                </div>
                <p className="text-xs text-white/40">{tier.minimumTerm} {t.pricing.labels.minimumForLearning}</p>
              </div>

              {/* Description */}
              <p className="text-sm text-white/60 mb-4">{tier.description}</p>

              {/* ROI Indicator */}
              {tier.roiText && (
                <div className="mb-6 p-3 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs text-[#22C55E] font-semibold">{t.pricing.labels.typicalRoi}</span>
                  </div>
                  <p className="text-sm text-white font-semibold">{tier.roiText}</p>
                </div>
              )}

              {/* Features */}
              <ul className="space-y-3 mb-6 flex-grow">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Outcome */}
              <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                <p className="text-xs text-[#0EA5E9] font-semibold mb-1">{t.pricing.labels.yourOutcome}</p>
                <p className="text-sm text-white">{tier.outcome}</p>
              </div>

              {/* CTA */}
              <button className={`w-full font-semibold py-3.5 rounded-2xl transition-all ${
                tier.highlighted ? 'btn-primary' : 'btn-glass'
              }`}>
                {tier.cta}
              </button>

              <a href="#roi-calculator" className="block mt-4 text-center text-sm text-[#0EA5E9] hover:text-white transition-colors">
                {t.pricing.labels.seeCapabilityRoi}
              </a>
            </div>
          ))}
        </div>

        {/* Enterprise Tier - Full Width */}
        {t.pricing.tiers[3] && (
          <div className="glass p-6 md:p-8 mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{t.pricing.tiers[3].subtitle}</p>
                <h3 className="text-2xl font-bold text-white mb-2">{t.pricing.tiers[3].name}</h3>
                <p className="text-sm text-white/60 mb-4">{t.pricing.tiers[3].description}</p>
                <div className="flex flex-wrap gap-2">
                  {t.pricing.tiers[3].features.slice(0, 4).map((feature, idx) => (
                    <span key={idx} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center lg:text-right">
                <p className="text-sm text-white/50 mb-2">{t.pricing.labels.capabilityTransfer}</p>
                <p className="text-3xl font-bold text-white mb-4">{t.pricing.tiers[3].setupFee}</p>
                <button className="btn-glass px-8 py-3 font-semibold">
                  {t.pricing.tiers[3].cta}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guarantee */}
        <div className="glass p-6 md:p-8 lg:p-10 max-w-3xl mx-auto" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <svg className="w-8 h-8 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-white mb-2">{t.pricing.guarantee.title}</h3>
              <p className="text-sm text-white/60">
                {t.pricing.guarantee.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-white/10">
            {t.pricing.guarantee.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-white/60">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
