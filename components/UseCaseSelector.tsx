'use client';

import React, { useState } from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function UseCaseSelector() {
  const { t } = useTranslations();
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const filteredSystems = selectedComplexity === 'all'
    ? t.useCases.systems
    : t.useCases.systems.filter(sys => sys.complexity === selectedComplexity);

  return (
    <section id="solutions" className="relative py-20 lg:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4" style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' }}>
            {t.useCases.tag}
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t.useCases.heading}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t.useCases.description}
          </p>
        </div>

        {/* Complexity Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {t.useCases.complexityLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedComplexity(level.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedComplexity === level.id
                  ? 'bg-[#0EA5E9] text-white'
                  : 'glass text-white/70 hover:text-white hover:border-white/20'
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>

        {/* Agentic Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredSystems.map((system) => (
            <div key={system.id} className="glass glass-hover p-6 transition-all duration-300 flex flex-col">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{system.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full capitalize" style={{
                    background: system.complexity === 'beginner' ? 'rgba(34, 197, 94, 0.2)' :
                                system.complexity === 'intermediate' ? 'rgba(249, 115, 22, 0.2)' :
                                'rgba(239, 68, 68, 0.2)',
                    color: system.complexity === 'beginner' ? '#22C55E' :
                           system.complexity === 'intermediate' ? '#F97316' :
                           '#EF4444',
                    border: `1px solid ${system.complexity === 'beginner' ? 'rgba(34, 197, 94, 0.3)' :
                                         system.complexity === 'intermediate' ? 'rgba(249, 115, 22, 0.3)' :
                                         'rgba(239, 68, 68, 0.3)'}`
                  }}>
                    {system.complexity}
                  </span>
                </div>
                <p className="text-xs text-white/50">{system.industries}</p>
              </div>

              <p className="text-sm text-white/60 mb-4 leading-relaxed flex-grow">{system.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {system.capabilities.map((cap, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                    {cap}
                  </span>
                ))}
              </div>

              <div className="p-3 rounded-lg" style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                <p className="text-xs text-[#0EA5E9] font-semibold mb-1">{t.useCases.youllLearn}</p>
                <p className="text-xs text-white/70">{system.whatYouLearn}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-white/50 max-w-2xl mx-auto">
            {t.useCases.bottomNote}
          </p>
        </div>
      </div>
    </section>
  );
}
