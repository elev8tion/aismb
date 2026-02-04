'use client';

import { useState } from 'react';

export default function ROICalculator() {
  const [industry, setIndustry] = useState('other');
  const [employees, setEmployees] = useState('5-10');
  const [hourlyValue, setHourlyValue] = useState(75);
  const [tier, setTier] = useState('foundation');

  const industries = [
    { id: 'other', name: 'Other/Custom Business', timeSavings: 18 },
    { id: 'service', name: 'Service Business', timeSavings: 20 },
    { id: 'professional', name: 'Professional Services', timeSavings: 15 },
    { id: 'retail', name: 'Retail/Hospitality', timeSavings: 18 },
    { id: 'realestate', name: 'Real Estate/Property', timeSavings: 25 },
    { id: 'construction', name: 'Construction/Trades', timeSavings: 22 },
  ];

  const employeeSizes = [
    { id: '1-5', name: '1-5 employees', multiplier: 0.8 },
    { id: '5-10', name: '5-10 employees', multiplier: 1.0 },
    { id: '10-25', name: '10-25 employees', multiplier: 1.3 },
    { id: '25-50', name: '25-50 employees', multiplier: 1.6 },
  ];

  const tiers = [
    { id: 'discovery', name: 'AI Discovery', cost: 4000, weeks: 8, systemsBuilt: 1 },
    { id: 'foundation', name: 'Foundation Builder', cost: 9500, weeks: 12, systemsBuilt: 3 },
    { id: 'architect', name: 'Systems Architect', cost: 30000, weeks: 24, systemsBuilt: 6 },
  ];

  const selectedIndustry = industries.find(i => i.id === industry);
  const selectedSize = employeeSizes.find(s => s.id === employees);
  const selectedTier = tiers.find(t => t.id === tier);

  // Calculate results
  const baseTimeSavings = selectedIndustry?.timeSavings || 20;
  const adjustedTimeSavings = Math.round(baseTimeSavings * (selectedSize?.multiplier || 1));
  const weeklyValue = adjustedTimeSavings * hourlyValue;
  const totalValue = weeklyValue * (selectedTier?.weeks || 12);
  const investment = selectedTier?.cost || 9500;
  const roi = Math.round(((totalValue - investment) / investment) * 100);
  const paybackWeeks = Math.ceil(investment / weeklyValue);

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6" id="roi-calculator">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4">Calculate Your ROI</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            See your capability return on investment
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            We build intelligent systems for ANY business type. Based on real data from 68% of SMBs already using AI. Conservative estimates show most businesses achieve 150-300% ROI within 3-6 months.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Input Panel */}
          <div className="glass p-4 md:p-6 lg:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Your Business Details</h3>

            {/* Industry Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-3">Industry</label>
              <div className="grid grid-cols-1 gap-2">
                {industries.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setIndustry(ind.id)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                      industry === ind.id
                        ? 'bg-[#0EA5E9] text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {ind.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/50 mt-2">
                Don&apos;t see your industry? We work with all business types—select &quot;Other&quot; for general estimates.
              </p>
            </div>

            {/* Business Size */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-3">Business Size</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {employeeSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setEmployees(size.id)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      employees === size.id
                        ? 'bg-[#0EA5E9] text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Hourly Value */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-3">
                Your Time Value (per hour)
              </label>
              <div className="flex items-center gap-3">
                <span className="text-2xl text-white font-bold">$</span>
                <input
                  type="range"
                  min="25"
                  max="250"
                  step="25"
                  value={hourlyValue}
                  onChange={(e) => setHourlyValue(Number(e.target.value))}
                  className="flex-1"
                  style={{
                    accentColor: '#0EA5E9',
                  }}
                />
                <span className="text-2xl text-[#0EA5E9] font-bold min-w-[80px] text-right">{hourlyValue}</span>
              </div>
              <p className="text-xs text-white/50 mt-2">
                Industry average: Service businesses $50-100/hr, Professional services $100-200/hr
              </p>
            </div>

            {/* Partnership Tier */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-3">Partnership Tier</label>
              <div className="grid grid-cols-1 gap-2">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                      tier === t.id
                        ? 'bg-[#0EA5E9] text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{t.name}</span>
                      <span className="text-xs opacity-70">${t.cost.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex flex-col gap-4">
            {/* Main ROI Card */}
            <div className="glass p-4 md:p-6 lg:p-8 flex-1">
              <h3 className="text-lg font-bold text-white mb-6">Your Projected Results</h3>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">Time Saved</div>
                  <div className="text-2xl font-bold text-[#0EA5E9]">{adjustedTimeSavings} hrs/week</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">Weekly Value</div>
                  <div className="text-2xl font-bold text-[#0EA5E9]">${weeklyValue.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">Investment</div>
                  <div className="text-2xl font-bold text-white">${investment.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">Systems Built</div>
                  <div className="text-2xl font-bold text-white">{selectedTier?.systemsBuilt}</div>
                </div>
              </div>

              {/* Total Value */}
              <div className="p-4 md:p-5 rounded-lg mb-4" style={{ background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <div className="text-xs text-[#0EA5E9] font-semibold mb-1">Total Value Created</div>
                <div className="text-4xl font-bold text-white mb-1">${totalValue.toLocaleString()}</div>
                <div className="text-xs text-white/60">Over {selectedTier?.weeks} weeks</div>
              </div>

              {/* ROI Highlight */}
              <div className="p-4 md:p-5 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#22C55E] font-semibold">Your ROI</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-3xl font-bold text-[#22C55E]">{roi}%</span>
                  </div>
                </div>
                <div className="text-xs text-white/70">
                  Pays for itself in ~{paybackWeeks} weeks, then continues generating value
                </div>
              </div>
            </div>

            {/* Comparison Card */}
            <div className="glass p-6">
              <h4 className="text-sm font-bold text-white/80 mb-4">Compare Alternatives</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xs text-white/60">Traditional Consultant</span>
                  <span className="text-sm font-semibold text-[#F97316]">
                    ${(125 * adjustedTimeSavings * (selectedTier?.weeks || 12)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xs text-white/60">Done-for-you Service</span>
                  <span className="text-sm font-semibold text-[#F97316]">
                    ${(3500 * Math.ceil((selectedTier?.weeks || 12) / 4)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60 font-semibold">AI SMB Partners</span>
                  <span className="text-sm font-bold text-[#22C55E]">${investment.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-[#22C55E]/10">
                <p className="text-xs text-[#22C55E] font-semibold">
                  Save{' '}
                  {Math.round(
                    ((Math.min(125 * adjustedTimeSavings * (selectedTier?.weeks || 12), 3500 * Math.ceil((selectedTier?.weeks || 12) / 4)) - investment) /
                      Math.min(125 * adjustedTimeSavings * (selectedTier?.weeks || 12), 3500 * Math.ceil((selectedTier?.weeks || 12) / 4))) *
                      100
                  )}
                  % vs alternatives + you own the capability forever
                </p>
              </div>
            </div>

            {/* CTA */}
            <a href="#pricing" className="btn-primary text-center py-4 rounded-2xl font-semibold">
              Start Building Your Systems
            </a>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-white/50 max-w-3xl mx-auto">
            Calculations based on conservative estimates from industry data (McKinsey, Gartner, SBA reports). Actual results vary by business.
            Time savings data from documented AI automation implementations across 68% of SMBs currently using AI in 2025.
          </p>
        </div>
      </div>
    </section>
  );
}
