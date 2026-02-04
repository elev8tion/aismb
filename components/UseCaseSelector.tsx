'use client';

import React, { useState } from 'react';

export default function UseCaseSelector() {
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const complexityLevels = [
    { id: 'all', name: 'All Systems' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const agenticSystems = [
    {
      id: 1,
      complexity: 'beginner',
      name: 'Customer Communication Agent',
      description: 'Intelligent systems that handle inquiries, schedule appointments, send follow-ups, and maintain conversation context across channels.',
      whatYouLearn: 'Natural language processing, calendar integration, CRM connections',
      industries: 'Any customer-facing business',
      capabilities: ['24/7 availability', 'Context retention', 'Multi-channel']
    },
    {
      id: 2,
      complexity: 'beginner',
      name: 'Task Automation Agent',
      description: 'Smart agents that automate repetitive workflows like data entry, email responses, and status updates based on triggers you define.',
      whatYouLearn: 'Workflow automation, trigger design, API integrations',
      industries: 'Operations-heavy businesses',
      capabilities: ['Trigger-based', 'Rule learning', 'Error handling']
    },
    {
      id: 3,
      complexity: 'intermediate',
      name: 'Intelligent Document Processor',
      description: 'Advanced systems that read proposals, invoices, contracts; extract critical data; route for action; and learn from patterns over time.',
      whatYouLearn: 'Document AI, data extraction, pattern recognition',
      industries: 'Construction, legal, property management',
      capabilities: ['OCR + Understanding', 'Smart routing', 'Learning system']
    },
    {
      id: 4,
      complexity: 'intermediate',
      name: 'Predictive Business Analyst',
      description: 'Data-driven agents that analyze sales patterns, forecast cash flow, identify opportunities, and alert you to trends before they become problems.',
      whatYouLearn: 'Data analysis, forecasting models, business intelligence',
      industries: 'Any data-driven business',
      capabilities: ['Trend detection', 'Forecasting', 'Opportunity alerts']
    },
    {
      id: 5,
      complexity: 'advanced',
      name: 'Multi-Agent Orchestration',
      description: 'Coordinated systems where multiple specialized agents work together, delegating tasks and sharing information to handle complex workflows.',
      whatYouLearn: 'Agent collaboration, task delegation, system architecture',
      industries: 'Complex operations businesses',
      capabilities: ['Agent coordination', 'Dynamic routing', 'Scalable']
    },
    {
      id: 6,
      complexity: 'advanced',
      name: 'Adaptive Learning System',
      description: 'Intelligent systems that continuously learn from your business operations, adapt to changes, and suggest optimizations based on what works.',
      whatYouLearn: 'Machine learning integration, feedback loops, optimization',
      industries: 'Future-focused businesses',
      capabilities: ['Self-improving', 'Adaptive behavior', 'Optimization']
    },
  ];

  const filteredSystems = selectedComplexity === 'all' ? agenticSystems : agenticSystems.filter(sys => sys.complexity === selectedComplexity);

  return (
    <section id="solutions" className="relative py-20 lg:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4" style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' }}>
            Intelligent Systems
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Agentic systems that learn and adapt
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Build intelligent systems tailored to YOUR business—regardless of industry. Each system type teaches you new capabilities you can apply across your operations. These are examples, not limits.
          </p>
        </div>

        {/* Complexity Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {complexityLevels.map((level) => (
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
                <p className="text-xs text-[#0EA5E9] font-semibold mb-1">You&apos;ll Learn:</p>
                <p className="text-xs text-white/70">{system.whatYouLearn}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-white/50 max-w-2xl mx-auto">
            These are system types, not rigid templates. We&apos;ll work together to adapt them to your unique business needs and opportunities—no matter what industry you&apos;re in.
          </p>
        </div>
      </div>
    </section>
  );
}