'use client';

import { useState } from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function CaseStudiesSection() {
  const { t } = useTranslations();
  const [activeCase, setActiveCase] = useState(0);

  const activeStudy = t.caseStudies.cases[activeCase];

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6" id="case-studies">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4" style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' }}>
            {t.caseStudies.tag}
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t.caseStudies.heading}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t.caseStudies.description}
          </p>
        </div>

        {/* Case Study Selector */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
          {t.caseStudies.cases.map((study, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCase(idx)}
              className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                activeCase === idx
                  ? 'bg-[#0EA5E9] text-white shadow-lg'
                  : 'glass text-white/70 hover:text-white hover:border-white/20'
              }`}
            >
              <div className="font-semibold">{study.company}</div>
              <div className="text-xs opacity-80">{study.industry}</div>
            </button>
          ))}
        </div>

        {/* Active Case Study */}
        <div className="glass p-6 md:p-8 lg:p-10">
          {/* Company Info Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8 pb-8 border-b border-white/10">
            <div className="flex-1">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">{activeStudy.company}</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="tag text-xs">{activeStudy.revenue}</span>
                <span className="tag text-xs">{activeStudy.employees}</span>
                <span className="tag text-xs">{activeStudy.industry}</span>
              </div>
              <p className="text-white/70 text-sm lg:text-base leading-relaxed">
                <span className="font-semibold text-[#F97316]">{t.caseStudies.labels.challenge}</span> {activeStudy.challenge}
              </p>
            </div>
            <div className="glass p-4 md:p-5 lg:min-w-[200px] text-center">
              <div className="text-xs text-white/50 mb-1">{t.caseStudies.labels.partnershipTier}</div>
              <div className="text-lg font-bold text-[#0EA5E9] mb-2">{activeStudy.tier}</div>
              <div className="text-2xl font-bold text-white mb-1">{activeStudy.investment}</div>
              <div className="text-xs text-white/50">{activeStudy.timeline}</div>
            </div>
          </div>

          {/* Systems Built */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-[#0EA5E9] mb-4 uppercase tracking-wider">{t.caseStudies.labels.systemsBuiltTogether}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeStudy.systemsBuilt.map((system, idx) => {
                const [name, description] = system.split(' - ');
                return (
                  <div key={idx} className="p-4 rounded-lg" style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-white mb-1">{name}</div>
                        <div className="text-xs text-white/60">{description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Grid */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-[#22C55E] mb-4 uppercase tracking-wider">{t.caseStudies.labels.measurableResults}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass p-4 md:p-5 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[#0EA5E9] mb-2">{activeStudy.results.timeSaved}</div>
                <div className="text-xs text-white/60">{t.caseStudies.labels.timeSaved}</div>
              </div>
              <div className="glass p-4 md:p-5 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[#22C55E] mb-2">{activeStudy.results.roi}%</div>
                <div className="text-xs text-white/60">{t.caseStudies.labels.roiIn} {activeStudy.results.roiPeriod}</div>
              </div>
              <div className="glass p-4 md:p-5 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white mb-2">{activeStudy.results.totalValue}</div>
                <div className="text-xs text-white/60">{t.caseStudies.labels.totalValueCreated}</div>
              </div>
              <div className="glass p-4 md:p-5 text-center">
                <div className="text-sm lg:text-base font-semibold text-white mb-2">{activeStudy.results.revenueImpact}</div>
                <div className="text-xs text-white/60">{t.caseStudies.labels.revenueImpact}</div>
              </div>
            </div>
          </div>

          {/* Additional Result & Quote */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">{t.caseStudies.labels.customerExperience}</div>
              <div className="text-sm text-white/80">{activeStudy.results.customerSat}</div>
            </div>
            <div className="p-5 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div className="flex items-start gap-3">
                <svg className="w-8 h-8 text-[#22C55E] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <div>
                  <p className="text-white/90 text-sm lg:text-base italic mb-2 leading-relaxed">{activeStudy.quote}</p>
                  <p className="text-[#22C55E] font-semibold text-sm">— {activeStudy.owner}, {t.caseStudies.labels.owner}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-12 glass p-4 md:p-6 lg:p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{t.caseStudies.bottomStats.heading}</h3>
            <p className="text-sm text-white/60">{t.caseStudies.bottomStats.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.caseStudies.bottomStats.stats.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-[#0EA5E9] mb-1">{item.stat}</div>
                <div className="text-xs text-white/60">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-white/50">
              {t.caseStudies.bottomStats.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
