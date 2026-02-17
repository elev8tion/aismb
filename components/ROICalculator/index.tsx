'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from '@/contexts/LanguageContext';
import { TIER_DATA } from './types';

const TIER_MONTHLY: Record<string, number> = {
  discovery: 750,
  foundation: 1500,
  architect: 3000,
};

const TIER_NAMES: Record<string, string> = {
  discovery: 'The Revenue Guard — $750/mo',
  foundation: 'The Operations Sovereign — $1,500/mo',
  architect: 'The Enterprise Fortress — $3,000/mo',
};

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString();
}

export default function ROICalculator() {
  const { t } = useTranslations();

  const [payroll, setPayroll] = useState(3000);
  const [software, setSoftware] = useState(500);
  const [missedCalls, setMissedCalls] = useState(20);
  const [avgJobValue, setAvgJobValue] = useState(400);
  const [tier, setTier] = useState('discovery');

  const results = useMemo(() => {
    const monthlyFee = TIER_MONTHLY[tier] ?? 750;
    const tierData = TIER_DATA[tier] ?? TIER_DATA.discovery;

    // Fixed savings: what we eliminate minus what we charge
    const fixedMonthlySavings = payroll + software - monthlyFee;

    // Recovered revenue: missed calls × capture rate × close rate × job value
    const capturedCallsPerMonth = missedCalls * 4.33 * 0.6; // 60% capture
    const recoveredMonthlyRevenue = capturedCallsPerMonth * 0.35 * avgJobValue; // 35% close

    const annualFixed = fixedMonthlySavings * 12;
    const annualRevenue = recoveredMonthlyRevenue * 12;
    const totalAnnual = annualFixed + annualRevenue;

    const investment = tierData.cost;
    const roi = investment > 0 ? Math.round(((totalAnnual - investment) / investment) * 100) : 0;
    const paybackWeeks = totalAnnual > 0 ? Math.ceil(investment / (totalAnnual / 52)) : 999;

    return {
      fixedMonthlySavings,
      recoveredMonthlyRevenue,
      annualFixed,
      annualRevenue,
      totalAnnual,
      investment,
      roi,
      paybackWeeks,
      monthlyFee,
    };
  }, [payroll, software, missedCalls, avgJobValue, tier]);

  const isPositive = results.fixedMonthlySavings > 0;

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6" id="roi-calculator">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4">{t.roiCalculator.tag}</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t.roiCalculator.heading}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t.roiCalculator.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column: Inputs */}
          <div className="glass p-4 md:p-6 lg:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Your Current Overhead</h3>
              <p className="text-sm text-white/50 mb-6">Tell us what you're spending on admin and software today.</p>

              {/* Monthly Admin/Support Payroll */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-white/80">Monthly Admin / Support Payroll</label>
                  <span className="text-sm font-bold text-white">{fmt(payroll)}/mo</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={250}
                  value={payroll}
                  onChange={(e) => setPayroll(Number(e.target.value))}
                  className="w-full accent-[#0EA5E9]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>$0</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* Monthly Software Subscriptions */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-white/80">Monthly Software Subscriptions</label>
                  <span className="text-sm font-bold text-white">{fmt(software)}/mo</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={50}
                  value={software}
                  onChange={(e) => setSoftware(Number(e.target.value))}
                  className="w-full accent-[#0EA5E9]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>$0</span>
                  <span>$3,000</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-6" />

              <h3 className="text-lg font-bold text-white mb-1">Missed Revenue</h3>
              <p className="text-sm text-white/50 mb-5">Calls and leads slipping through the cracks each week.</p>

              {/* Missed Calls Per Week */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-white/80">Missed Calls Per Week</label>
                  <span className="text-sm font-bold text-white">{missedCalls} calls</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={missedCalls}
                  onChange={(e) => setMissedCalls(Number(e.target.value))}
                  className="w-full accent-[#F97316]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>0 calls</span>
                  <span>100 calls</span>
                </div>
              </div>

              {/* Avg Job Value */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-white/80">Average Job / Deal Value</label>
                  <span className="text-sm font-bold text-white">{fmt(avgJobValue)}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={avgJobValue}
                  onChange={(e) => setAvgJobValue(Number(e.target.value))}
                  className="w-full accent-[#F97316]"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                  <span>$50</span>
                  <span>$5,000</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-6" />

              {/* Tier Selection */}
              <div>
                <label className="text-sm font-medium text-white/80 block mb-3">Select Infrastructure Tier</label>
                <div className="space-y-2">
                  {Object.entries(TIER_NAMES).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setTier(id)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                        tier === id
                          ? 'bg-[#0EA5E9]/20 border-[#0EA5E9]/60 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col gap-4">
            {/* Hero Result */}
            <div className="glass p-6 md:p-8" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
              <p className="text-xs text-[#22C55E] font-semibold uppercase tracking-wider mb-2">Total Annual Capital Recaptured</p>
              <div className={`text-5xl lg:text-6xl font-bold mb-2 ${results.totalAnnual > 0 ? 'text-[#22C55E]' : 'text-white/40'}`}>
                {results.totalAnnual > 0 ? fmt(results.totalAnnual) : '$0'}
              </div>
              <p className="text-sm text-white/50">per year in eliminated overhead + recovered revenue</p>
            </div>

            {/* Breakdown */}
            <div className="glass p-5 md:p-6 space-y-4">
              <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">Savings Breakdown</h4>

              {/* Fixed Savings */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-white font-medium">Fixed Monthly Savings</p>
                  <p className="text-xs text-white/50">
                    ({fmt(payroll + software)}/mo overhead) − ({fmt(results.monthlyFee)}/mo fee)
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isPositive ? 'text-[#22C55E]' : 'text-[#F97316]'}`}>
                    {fmt(results.fixedMonthlySavings)}<span className="text-xs font-normal text-white/40">/mo</span>
                  </p>
                  <p className="text-xs text-white/40">{fmt(results.annualFixed)}/yr</p>
                </div>
              </div>

              <div className="border-t border-white/10" />

              {/* Recovered Revenue */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-white font-medium">Recovered Revenue</p>
                  <p className="text-xs text-white/50">
                    {missedCalls} missed calls/wk × 60% capture × 35% close × {fmt(avgJobValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#0EA5E9]">
                    {fmt(results.recoveredMonthlyRevenue)}<span className="text-xs font-normal text-white/40">/mo</span>
                  </p>
                  <p className="text-xs text-white/40">{fmt(results.annualRevenue)}/yr</p>
                </div>
              </div>
            </div>

            {/* ROI Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass p-4 text-center">
                <p className="text-2xl font-bold text-white">{results.roi}%</p>
                <p className="text-xs text-white/50 mt-1">Annual ROI</p>
              </div>
              <div className="glass p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {results.paybackWeeks < 999 ? `${results.paybackWeeks}` : '—'}
                  <span className="text-sm font-normal text-white/50"> wks</span>
                </p>
                <p className="text-xs text-white/50 mt-1">Payback Period</p>
              </div>
            </div>

            {/* CTA */}
            <a
              href="#pricing"
              className="btn-primary text-center py-4 rounded-2xl font-semibold block"
            >
              {t.roiCalculator.cta}
            </a>

            <p className="text-xs text-white/40 text-center">
              60% call capture rate · 35% close rate · Actual results vary
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-white/50 max-w-3xl mx-auto">
            {t.roiCalculator.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
