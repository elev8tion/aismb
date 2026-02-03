'use client';

import React from 'react';

export default function CaseStudiesSection() {
  const caseStudies = [
    {
      company: 'Peak HVAC Solutions',
      industry: 'HVAC Services',
      size: '12 employees',
      testimonial: 'We were drowning in after-hours calls and manual scheduling. Now our AI copilot handles 80% of it—and customers love the instant response.',
      ownerName: 'Mike Richardson',
      ownerTitle: 'Owner',
      results: [
        { metric: 'Time Saved', value: '15 hrs/week' },
        { metric: 'Response Time', value: '2 min avg' },
        { metric: 'ROI Payback', value: '6 weeks' },
      ],
      specificResult: 'Cut proposal time from 4 hours to 30 minutes',
    },
    {
      company: 'Metro Property Group',
      industry: 'Property Management',
      size: '8 employees',
      testimonial: 'Manual maintenance requests were killing us. The AI system triages, assigns vendors, and updates tenants automatically.',
      ownerName: 'Sarah Chen',
      ownerTitle: 'Managing Partner',
      results: [
        { metric: 'Time Saved', value: '12 hrs/week' },
        { metric: 'Satisfaction', value: '+35%' },
        { metric: 'Cost Savings', value: '$4.2k/mo' },
      ],
      specificResult: 'Reduced coordination time by 70%',
    },
    {
      company: 'ProFlow Plumbing',
      industry: 'Plumbing Services',
      size: '15 employees',
      testimonial: 'I was skeptical about AI, but the team educated us first. Now we handle 2x the emergency calls without adding staff.',
      ownerName: 'David Martinez',
      ownerTitle: 'CEO',
      results: [
        { metric: 'Time Saved', value: '20 hrs/week' },
        { metric: 'Call Handling', value: '+100%' },
        { metric: 'Revenue Impact', value: '+$18k/mo' },
      ],
      specificResult: 'Eliminated missed after-hours calls',
    },
  ];

  return (
    <section id="case-studies" className="relative py-20 lg:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="tag inline-flex mb-4" style={{ background: 'rgba(249, 115, 22, 0.2)', borderColor: 'rgba(249, 115, 22, 0.3)', color: '#F97316' }}>
            Case Studies
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Real businesses. Real results.
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            See how SMBs like yours transformed their operations.
          </p>
        </div>

        {/* Case Studies */}
        <div className="space-y-8">
          {caseStudies.map((study, idx) => (
            <div key={idx} className="glass overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left: Story */}
                <div className="p-8 lg:p-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg bg-[#0EA5E9]">
                      {study.company.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{study.company}</h3>
                      <p className="text-sm text-white/50">{study.industry} · {study.size}</p>
                    </div>
                  </div>

                  <blockquote className="mb-6">
                    <p className="text-white/70 text-base leading-relaxed mb-4">
                      "{study.testimonial}"
                    </p>
                    <footer className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-medium">
                        {study.ownerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{study.ownerName}</p>
                        <p className="text-xs text-white/50">{study.ownerTitle}</p>
                      </div>
                    </footer>
                  </blockquote>

                  <div className="tag inline-flex text-xs" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#22C55E' }}>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {study.specificResult}
                  </div>
                </div>

                {/* Right: Results */}
                <div className="p-8 lg:p-10 bg-white/[0.02] border-t lg:border-t-0 lg:border-l border-white/10">
                  <h4 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
                    Impact Metrics
                  </h4>

                  <div className="space-y-4 mb-6">
                    {study.results.map((result, rIdx) => (
                      <div key={rIdx} className="glass p-5">
                        <p className="text-xs text-white/50 mb-1">{result.metric}</p>
                        <p className="text-2xl font-bold text-white">{result.value}</p>
                      </div>
                    ))}
                  </div>

                  <button className="btn-glass w-full text-sm">
                    Read Full Case Study
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/60 mb-6">
            Join 50+ businesses already saving time with AI
          </p>
          <a href="#get-started" className="btn-primary inline-flex items-center gap-2">
            Get Your Free Assessment
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
