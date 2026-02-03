'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="tag flex items-center gap-2">
            <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
            <span>50+ SMBs Building Their Own AI Systems</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Build <span className="gradient-text">Intelligent AI Systems</span> That Transform Your Business
          </h1>
          <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Your creative partner for building agentic systems. Learn where in your business the opportunities are to design, deploy, and master AI that works for you—not just with you now and for future industry leading changes. We can guide and stick with you every step of the way.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#get-started" className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Building Together
            </a>
            <a href="#how-it-works" className="btn-glass w-full sm:w-auto inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              See Our Partnership
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {[
            { value: '100+', label: 'AI Agents Built' },
            { value: '8 weeks', label: 'To System Mastery' },
            { value: '50+', label: 'SMBs Building AI' },
            { value: '95%', label: 'Build Independently' },
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
