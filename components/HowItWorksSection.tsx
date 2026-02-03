'use client';

import React from 'react';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Discover Opportunities Together',
      description: 'Learn agentic systems fundamentals while we explore YOUR business together. Identify where AI can transform your operations now and prepare for future industry changes.',
      duration: 'Week 1-2',
      deliverable: 'Your AI roadmap + foundational knowledge',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      step: '02',
      title: 'Co-Create Your Systems',
      description: 'Build your first intelligent systems side-by-side. Learn how to design agents, integrate existing AI tools, and create solutions tailored to your unique workflows.',
      duration: 'Week 3-6',
      deliverable: 'Working AI systems + technical capability',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      step: '03',
      title: 'Deploy & Master Independence',
      description: 'Launch your systems with ongoing partnership support. Learn to monitor, optimize, and expand on your own. Master the skills to identify and build new systems independently.',
      duration: 'Week 7+',
      deliverable: 'Production systems + independent mastery',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 lg:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="tag inline-flex mb-4">Our Partnership</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Build intelligent systems together—your way
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-4">
            A collaborative journey from discovering opportunities to mastering AI systems that transform your business for the future.
          </p>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            Whether you want to build systems yourself, understand how AI works, or train your team—we'll guide and stick with you every step of the way.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {steps.map((step, idx) => (
            <div key={idx} className="glass glass-hover p-8 transition-all duration-300 flex flex-col">
              {/* Step Number */}
              <div className="text-6xl font-bold text-[#0EA5E9]/20 mb-4">
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-[#0EA5E9]" style={{ background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed flex-grow">{step.description}</p>

              {/* Deliverable */}
              <div className="mb-5 p-3 rounded-lg" style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                <p className="text-xs text-[#0EA5E9] font-semibold mb-1">You'll Get:</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🤝', label: 'Collaborative building' },
            { icon: '📚', label: 'Continuous learning' },
            { icon: '🛠️', label: 'Tools & templates' },
            { icon: '🌟', label: 'Ongoing support' },
          ].map((item, idx) => (
            <div key={idx} className="glass flex items-center gap-3 px-5 py-4">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm text-white/70">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
