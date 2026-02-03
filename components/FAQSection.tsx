'use client';

import React, { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Do I need technical skills to use AI automation?',
      answer: 'No. We handle all the technical implementation. Your team will use simple interfaces—most look like the tools you already use. We provide training and ongoing support.',
    },
    {
      question: 'How long does it take to see results?',
      answer: 'Most clients see measurable time savings within 2-4 weeks of their first workflow going live. Full ROI typically happens within 6-12 weeks depending on the package.',
    },
    {
      question: 'What happens to my data?',
      answer: 'Your data stays yours. We use enterprise-grade security and never share or sell your information. All data processing follows strict privacy standards.',
    },
    {
      question: 'What if it doesn\'t work for my business?',
      answer: 'We offer a 30-day results guarantee. If you don\'t see measurable time savings, we\'ll work for free until you do. Plus, you can cancel after the initial 3-month period.',
    },
    {
      question: 'Can AI handle complex customer interactions?',
      answer: 'Yes, with human oversight. Our AI handles routine tasks and escalates complex situations to your team. You stay in control of important decisions.',
    },
    {
      question: 'What systems do you integrate with?',
      answer: 'We integrate with most popular business tools including QuickBooks, ServiceTitan, Jobber, Google Workspace, Microsoft 365, and many more. Custom integrations are available for Enterprise clients.',
    },
  ];

  return (
    <section className="bg-[#0A0A0B] py-16 lg:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full mb-4">
            <span className="text-sm font-medium text-[#3B82F6]">FAQ</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Common questions
          </h2>
          <p className="text-lg text-[#A1A1AA]">
            Everything you need to know about AI automation.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#111113] border border-[#27272A] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[#18181B] transition-colors"
              >
                <span className="text-base font-medium text-white pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-[#71717A] shrink-0 transition-transform ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5">
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 text-center">
          <p className="text-[#A1A1AA] mb-4">Still have questions?</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-[#0EA5E9] hover:text-white font-medium transition-colors"
          >
            Get in touch
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
