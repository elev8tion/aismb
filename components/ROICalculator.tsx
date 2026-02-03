'use client';

import React, { useState } from 'react';

export default function ROICalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [hourlyCost, setHourlyCost] = useState(50);
  const [showEmailCapture, setShowEmailCapture] = useState(false);

  const annualCostOfManualWork = hoursPerWeek * hourlyCost * 52;
  const timeSaved = hoursPerWeek * 0.3;
  const annualSavings = timeSaved * hourlyCost * 52;
  const paybackWeeks = Math.ceil((12000 + (4000 * 3)) / (annualSavings / 52));

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6" id="roi-calculator">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4" style={{ background: 'rgba(6, 182, 212, 0.2)', borderColor: 'rgba(6, 182, 212, 0.3)', color: '#06B6D4' }}>
            ROI Calculator
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            See your savings in 60 seconds
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Adjust the sliders to match your business.
          </p>
        </div>

        <div className="glass overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Inputs */}
            <div className="p-8 lg:p-10 space-y-8">
              <h3 className="text-xl font-semibold text-white mb-6">Your Business</h3>

              {/* Hours Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/70">Hours/week on manual tasks</label>
                  <span className="text-xl font-bold text-white">{hoursPerWeek}h</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
                />
                <p className="text-xs text-white/50">Most SMBs: 20-30 hrs/week</p>
              </div>

              {/* Hourly Cost Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/70">Average team hourly cost</label>
                  <span className="text-xl font-bold text-white">${hourlyCost}</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="150"
                  step="5"
                  value={hourlyCost}
                  onChange={(e) => setHourlyCost(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
                />
                <p className="text-xs text-white/50">Include wages, benefits, overhead</p>
              </div>

              {/* Annual Cost Display */}
              <div className="glass p-5">
                <p className="text-xs text-white/50 mb-1">Current annual cost of manual work</p>
                <p className="text-3xl font-bold text-[#EF4444]">
                  ${annualCostOfManualWork.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Right: Results */}
            <div className="p-8 lg:p-10 bg-white/[0.02] border-t lg:border-t-0 lg:border-l border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">Your Potential Savings</h3>

              <div className="space-y-4 mb-8">
                <div className="glass p-5">
                  <p className="text-xs text-white/50 mb-1">Time saved per week</p>
                  <p className="text-3xl font-bold text-[#22C55E]">{timeSaved.toFixed(1)} hours</p>
                  <p className="text-xs text-white/40 mt-1">Based on 30% efficiency gain</p>
                </div>

                <div className="glass p-5">
                  <p className="text-xs text-white/50 mb-1">Annual savings</p>
                  <p className="text-3xl font-bold text-[#22C55E]">${annualSavings.toLocaleString()}</p>
                </div>

                <div className="p-5 rounded-[24px]" style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                  <p className="text-xs text-[#F97316] mb-1">Estimated payback period</p>
                  <p className="text-3xl font-bold text-[#F97316]">{paybackWeeks} weeks</p>
                  <p className="text-xs text-white/40 mt-1">Based on Starter package</p>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => setShowEmailCapture(!showEmailCapture)} className="btn-primary w-full">
                  Email Me These Results
                </button>
                <button className="btn-glass w-full">
                  Book a Call to Discuss
                </button>
              </div>

              {showEmailCapture && (
                <div className="mt-4 glass p-5 space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input-glass w-full"
                  />
                  <button className="w-full bg-white text-black font-semibold py-3 rounded-2xl hover:bg-white/90 transition-colors">
                    Send Results
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40 text-center mt-6">
          * Results are estimates based on industry averages. Actual savings may vary.
        </p>
      </div>
    </section>
  );
}
