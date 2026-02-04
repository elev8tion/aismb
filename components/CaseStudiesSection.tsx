'use client';

import { useState } from 'react';

export default function CaseStudiesSection() {
  const [activeCase, setActiveCase] = useState(0);

  const caseStudies = [
    {
      id: 0,
      company: 'Local HVAC Company',
      industry: 'Home Services',
      revenue: '$1.2M annual revenue',
      employees: '8 employees',
      tier: 'Foundation Builder',
      investment: '$9,500',
      timeline: '3 months',
      challenge: 'Owner spending 15 hours/week on scheduling and admin. Missing maintenance contract opportunities.',
      systemsBuilt: [
        'Customer Communication Agent - 24/7 appointment scheduling',
        'Job Data Automation - Automatic QuickBooks entry',
        'Maintenance Contract Agent - Proactive renewal offers',
      ],
      results: {
        timeSaved: '20 hours/week',
        revenueImpact: '23% increase in maintenance contracts',
        customerSat: 'Response time: 4 hours → 15 minutes',
        roi: '153%',
        roiPeriod: '3 months',
        totalValue: '$24,000',
      },
      quote: 'I learned how to build these systems myself. Now I\'m thinking about what else we can automate. This changed how I think about running my business.',
      owner: 'Mike T.',
    },
    {
      id: 1,
      company: 'Boutique Marketing Agency',
      industry: 'Professional Services',
      revenue: '$850K annual revenue',
      employees: '5 employees',
      tier: 'AI Discovery',
      investment: '$4,000',
      timeline: '2 months',
      challenge: 'Spending 10+ hours/week writing similar proposals. Limited capacity for new clients.',
      systemsBuilt: [
        'Intelligent Proposal Generator - AI-powered proposal creation',
        'Past project analysis and case study matching',
        'Automated pricing and timeline generation',
      ],
      results: {
        timeSaved: '14 hours/week',
        revenueImpact: 'Increased proposals from 3/week to 8/week',
        customerSat: 'Maintained 35% win rate with 2.5x more proposals',
        roi: '450%',
        roiPeriod: '2 months',
        totalValue: '$22,000',
      },
      quote: 'We started small to test it. After seeing how this one system changed our proposal process, we immediately upgraded to Foundation Builder.',
      owner: 'Sarah K.',
    },
    {
      id: 2,
      company: 'Regional Property Management',
      industry: 'Real Estate Services',
      revenue: '$3.2M annual revenue',
      employees: '12 employees',
      tier: 'Systems Architect',
      investment: '$30,000',
      timeline: '6 months',
      challenge: 'Managing 180 units with manual processes. Reactive maintenance. High tenant turnover.',
      systemsBuilt: [
        'Intelligent Maintenance Coordinator - Auto-triage and routing',
        'Lease Renewal Agent - Predictive pricing and automation',
        'Predictive Maintenance System - Prevent failures before they happen',
        'Tenant Screening Automation - Consistent, fast decisions',
        'Multi-Agent Orchestration - All systems working together',
      ],
      results: {
        timeSaved: '35 hours/week',
        revenueImpact: 'Lease renewal rate: 68% → 81%',
        customerSat: 'Tenant NPS: 42 → 67',
        roi: '198%',
        roiPeriod: '6 months',
        totalValue: '$89,520',
      },
      quote: 'We didn\'t just buy software—we learned how to think like AI builders. Now our team identifies automation opportunities everywhere. This is a competitive advantage that will last for years.',
      owner: 'James L.',
    },
  ];

  const activeStudy = caseStudies[activeCase];

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6" id="case-studies">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4" style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' }}>
            Real Results
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Small businesses building big capabilities
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Real SMBs across diverse industries achieving 150-450% ROI within 2-6 months by building intelligent systems together. Your business can too.
          </p>
        </div>

        {/* Case Study Selector */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center">
          {caseStudies.map((study, idx) => (
            <button
              key={study.id}
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
                <span className="font-semibold text-[#F97316]">Challenge:</span> {activeStudy.challenge}
              </p>
            </div>
            <div className="glass p-4 md:p-5 lg:min-w-[200px] text-center">
              <div className="text-xs text-white/50 mb-1">Partnership Tier</div>
              <div className="text-lg font-bold text-[#0EA5E9] mb-2">{activeStudy.tier}</div>
              <div className="text-2xl font-bold text-white mb-1">{activeStudy.investment}</div>
              <div className="text-xs text-white/50">{activeStudy.timeline}</div>
            </div>
          </div>

          {/* Systems Built */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-[#0EA5E9] mb-4 uppercase tracking-wider">Systems Built Together</h4>
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
            <h4 className="text-sm font-semibold text-[#22C55E] mb-4 uppercase tracking-wider">Measurable Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass p-4 md:p-5 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[#0EA5E9] mb-2">{activeStudy.results.timeSaved}</div>
                <div className="text-xs text-white/60">Time Saved</div>
              </div>
              <div className="glass p-4 md:p-5 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[#22C55E] mb-2">{activeStudy.results.roi}%</div>
                <div className="text-xs text-white/60">ROI in {activeStudy.results.roiPeriod}</div>
              </div>
              <div className="glass p-4 md:p-5 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-white mb-2">{activeStudy.results.totalValue}</div>
                <div className="text-xs text-white/60">Total Value Created</div>
              </div>
              <div className="glass p-4 md:p-5 text-center">
                <div className="text-sm lg:text-base font-semibold text-white mb-2">{activeStudy.results.revenueImpact}</div>
                <div className="text-xs text-white/60">Revenue Impact</div>
              </div>
            </div>
          </div>

          {/* Additional Result & Quote */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-white/50 mb-1">Customer Experience</div>
              <div className="text-sm text-white/80">{activeStudy.results.customerSat}</div>
            </div>
            <div className="p-5 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div className="flex items-start gap-3">
                <svg className="w-8 h-8 text-[#22C55E] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <div>
                  <p className="text-white/90 text-sm lg:text-base italic mb-2 leading-relaxed">{activeStudy.quote}</p>
                  <p className="text-[#22C55E] font-semibold text-sm">— {activeStudy.owner}, Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-12 glass p-4 md:p-6 lg:p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Industry-Backed Results</h3>
            <p className="text-sm text-white/60">Based on documented AI automation outcomes and conservative ROI estimates across all business types</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: '10-35 hrs/week', label: 'Typical Time Savings' },
              { stat: '150-300%', label: 'Average ROI (3-6 months)' },
              { stat: '68%', label: 'SMBs Now Using AI' },
              { stat: '$10K+', label: 'Avg Annual AI Spend' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl lg:text-3xl font-bold text-[#0EA5E9] mb-1">{item.stat}</div>
                <div className="text-xs text-white/60">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-white/50">
              These examples span home services, professional services, and real estate. We build systems for any business type—your industry is next.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
