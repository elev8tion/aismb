'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from '@/contexts/LanguageContext';
import { TIER_DATA } from './types';

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString();
}

export default function ROICalculator() {
  const { t } = useTranslations();
  const rc = t.roiCalculator;

  const [payroll, setPayroll] = useState(3000);
  const [software, setSoftware] = useState(500);
  const [missedCalls, setMissedCalls] = useState(20);
  const [avgJobValue, setAvgJobValue] = useState(400);
  const [tier, setTier] = useState('discovery');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const results = useMemo(() => {
    const tierData = TIER_DATA[tier] ?? TIER_DATA.discovery;
    const { monthlyFee, cost: investment, setupFee, months } = tierData;

    // Fixed savings: what we eliminate minus what we charge
    const fixedMonthlySavings = payroll + software - monthlyFee;

    // Recovered revenue: missed calls × capture rate × close rate × job value
    const capturedCallsPerMonth = missedCalls * 4.33 * 0.6; // 60% capture
    const recoveredMonthlyRevenue = capturedCallsPerMonth * 0.35 * avgJobValue; // 35% close

    const annualFixed = fixedMonthlySavings * 12;
    const annualRevenue = recoveredMonthlyRevenue * 12;
    const totalAnnual = annualFixed + annualRevenue;

    const roi = investment > 0 ? Math.round(((totalAnnual - investment) / investment) * 100) : 0;
    const paybackWeeks = totalAnnual > 0 ? Math.ceil(investment / (totalAnnual / 52)) : 999;

    return {
      fixedMonthlySavings,
      recoveredMonthlyRevenue,
      annualFixed,
      annualRevenue,
      totalAnnual,
      investment,
      setupFee,
      monthlyFee,
      months,
      roi,
      paybackWeeks,
    };
  }, [payroll, software, missedCalls, avgJobValue, tier]);

  const isPositive = results.fixedMonthlySavings > 0;

  const handleSendReport = async () => {
    if (!email || !email.includes('@')) {
      setEmailError(rc.email.error);
      return;
    }
    setEmailError('');
    setEmailLoading(true);
    try {
      const res = await fetch('/api/leads/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tier,
          metrics: {
            payroll,
            software,
            missedCalls,
            avgJobValue,
            ...results,
          },
        }),
      });
      if (res.ok) {
        setEmailSent(true);
      } else {
        setEmailError(rc.email.error);
      }
    } catch {
      setEmailError(rc.email.error);
    }
    setEmailLoading(false);
  };

  const tierNames = rc.tiers as Record<string, string>;

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6" id="roi-calculator">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4">{rc.tag}</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {rc.heading}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {rc.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column: Inputs */}
          <div className="glass p-4 md:p-6 lg:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{rc.overheadTitle}</h3>
              <p className="text-sm text-white/50 mb-6">{rc.overheadSubtitle}</p>

              {/* Monthly Admin/Support Payroll */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-white/80">{rc.labels.adminPayroll}</label>
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
                  <label className="text-sm font-medium text-white/80">{rc.labels.software}</label>
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

              <h3 className="text-lg font-bold text-white mb-1">{rc.missedRevenueTitle}</h3>
              <p className="text-sm text-white/50 mb-5">{rc.missedRevenueSubtitle}</p>

              {/* Missed Calls Per Week */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-white/80">{rc.labels.missedCalls}</label>
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
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>

              {/* Avg Job Value */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-white/80">{rc.labels.avgJobValue}</label>
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
                <label className="text-sm font-medium text-white/80 block mb-1">{rc.tierSelectLabel}</label>
                <p className="text-xs text-white/40 mb-3">{rc.tierNote}</p>
                <div className="space-y-2">
                  {Object.values(TIER_DATA).map((td) => (
                    <button
                      key={td.id}
                      onClick={() => setTier(td.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all border ${
                        tier === td.id
                          ? 'bg-[#0EA5E9]/20 border-[#0EA5E9]/60'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-semibold ${tier === td.id ? 'text-white' : 'text-white/70'}`}>
                          {tierNames[td.id] ?? td.name}
                        </span>
                        <span className={`text-sm font-bold ${tier === td.id ? 'text-[#0EA5E9]' : 'text-white/40'}`}>
                          {fmt(td.monthlyFee)}/mo
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        {td.components} {rc.tierScope.components} · {td.months} {rc.tierScope.minimum} · {fmt(td.setupFee)} {rc.tierScope.setup}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/30 mt-2">{rc.roiNote}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col gap-4">
            {/* Hero Result */}
            <div className="glass p-6 md:p-8" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
              <p className="text-xs text-[#22C55E] font-semibold uppercase tracking-wider mb-2">{rc.results.totalLabel}</p>
              <div className={`text-5xl lg:text-6xl font-bold mb-2 ${results.totalAnnual > 0 ? 'text-[#22C55E]' : 'text-white/40'}`}>
                {results.totalAnnual > 0 ? fmt(results.totalAnnual) : '$0'}
              </div>
              <p className="text-sm text-white/50">{rc.results.totalSubtitle}</p>
            </div>

            {/* Breakdown */}
            <div className="glass p-5 md:p-6 space-y-4">
              <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">{rc.results.savingsBreakdown}</h4>

              {/* Fixed Savings */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-white font-medium">{rc.results.fixedSavings}</p>
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
                  <p className="text-sm text-white font-medium">{rc.results.recoveredRevenue}</p>
                  <p className="text-xs text-white/50">
                    {missedCalls} calls/wk × 60% × 35% × {fmt(avgJobValue)}
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
                <p className="text-xs text-white/50 mt-1">{rc.results.annualROI}</p>
                <p className="text-xs text-white/30 mt-0.5">{fmt(results.investment)} {rc.results.vsCommitment}</p>
              </div>
              <div className="glass p-4 text-center">
                <p className="text-2xl font-bold text-white">
                  {results.paybackWeeks < 999 ? `${results.paybackWeeks}` : '—'}
                  <span className="text-sm font-normal text-white/50"> wks</span>
                </p>
                <p className="text-xs text-white/50 mt-1">{rc.results.paybackPeriod}</p>
                <p className="text-xs text-white/30 mt-0.5">{rc.results.thenYouOwn}</p>
              </div>
            </div>

            {/* Email Capture */}
            {emailSent ? (
              <div className="glass p-4 text-center" style={{ borderColor: 'rgba(34, 197, 94, 0.4)' }}>
                <p className="text-[#22C55E] font-semibold text-sm">{rc.email.success}</p>
              </div>
            ) : (
              <div className="glass p-4 space-y-3">
                <p className="text-xs text-white/60 font-medium">{rc.email.prompt}</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReport()}
                    placeholder={rc.email.placeholder}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]/60"
                  />
                  <button
                    onClick={handleSendReport}
                    disabled={emailLoading}
                    className="bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                  >
                    {emailLoading ? rc.email.sending : rc.email.send}
                  </button>
                </div>
                {emailError && <p className="text-xs text-[#F97316]">{emailError}</p>}
              </div>
            )}

            {/* CTA */}
            <a
              href="#pricing"
              className="btn-primary text-center py-4 rounded-2xl font-semibold block"
            >
              {rc.cta}
            </a>

            <p className="text-xs text-white/40 text-center">{rc.rateNote}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-white/50 max-w-3xl mx-auto">{rc.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
