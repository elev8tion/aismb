'use client';

import React from 'react';

export default function ProblemSection() {
  const painPoints = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'You know AI is the future, but where do you start?',
      description: 'The AI revolution is happening now. Your competitors are building systems while you\'re still researching. You need a partner who can show you the opportunities in YOUR business.',
      stat: '78% feel behind',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: 'Tired of expensive consultants that leave you dependent',
      description: 'Done-for-you services cost $10K+/month and disappear when you stop paying. You want to BUILD capability, not rent it. Learn to create systems that you own and control.',
      stat: '$120K+/year cost',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      title: 'Generic AI tools don\'t fit your unique business',
      description: 'ChatGPT and off-the-shelf software can\'t handle your specific workflows. You need custom intelligent systems designed around YOUR operations, built to adapt as your industry changes.',
      stat: '65% poor fit',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'You want to learn and build, not just buy',
      description: 'You\'re a builder at heart. You want to understand how AI systems work, identify opportunities yourself, and create intelligent solutions that grow with your business for years to come.',
      stat: 'Learning = ownership',
    },
  ];

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="tag inline-flex mb-4" style={{ background: 'rgba(249, 115, 22, 0.2)', borderColor: 'rgba(249, 115, 22, 0.3)', color: '#F97316' }}>
            The Real Challenge
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            The opportunity isn&apos;t just efficiency—it&apos;s capability
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            You don&apos;t just need AI tools. You need to understand where the opportunities are and how to build intelligent systems that transform your business for the future.
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {painPoints.map((point, idx) => (
            <div key={idx} className="glass glass-hover p-4 md:p-6 lg:p-8 transition-all duration-300">
              <div className="flex items-start gap-3 md:gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-[#F97316]" style={{ background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                  {point.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {point.title}
                    </h3>
                    <span className="text-sm font-bold text-[#F97316] shrink-0 px-3 py-1 rounded-full" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
                      {point.stat}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
