'use client';

import React from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function SocialProofBar() {
  const { t } = useTranslations();

  return (
    <section className="relative py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-sm font-medium text-white/50 uppercase tracking-wider mb-8">
          {t.socialProof.heading}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
          {t.socialProof.companies.map((company, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className="w-12 h-12 glass flex items-center justify-center group-hover:border-white/20 transition-colors">
                <span className="text-sm font-bold text-[#0EA5E9]">
                  {company.name.split(' ').map(w => w[0]).join('')}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{company.name}</p>
                <p className="text-xs text-white/50">{company.industry}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
