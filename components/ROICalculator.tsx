'use client';

import { useState } from 'react';
import { useTranslations } from '@/contexts/LanguageContext';

export default function ROICalculator() {
  const { t } = useTranslations();
  const [industry, setIndustry] = useState('other');
  const [employees, setEmployees] = useState('5-10');
  const [hourlyValue, setHourlyValue] = useState(75);
  const [tier, setTier] = useState('foundation');

  const industryData: Record<string, number> = {
    other: 18,
    service: 20,
    professional: 15,
    retail: 18,
    realestate: 25,
    construction: 22,
  };

  const employeeMultipliers: Record<string, number> = {
    '1-5': 0.8,
    '5-10': 1.0,
    '10-25': 1.3,
    '25-50': 1.6,
  };

  // Pricing: setup + (monthly × months) = total
  // Discovery: $2,500 + ($750 × 2) = $4,000, includes voice agent + 2 systems
  // Foundation: $5,000 + ($1,500 × 3) = $9,500, includes voice agent + 5 systems
  // Architect: $12,000 + ($3,000 × 6) = $30,000, includes voice agent + 8 systems
  const tierData: Record<string, {
    setupFee: number;
    monthlyFee: number;
    months: number;
    cost: number;
    weeks: number;
    systemsBuilt: number
  }> = {
    discovery: { setupFee: 2500, monthlyFee: 750, months: 2, cost: 4000, weeks: 8, systemsBuilt: 3 },
    foundation: { setupFee: 5000, monthlyFee: 1500, months: 3, cost: 9500, weeks: 12, systemsBuilt: 6 },
    architect: { setupFee: 12000, monthlyFee: 3000, months: 6, cost: 30000, weeks: 24, systemsBuilt: 9 },
  };

  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Calculate results
  const baseTimeSavings = industryData[industry] || 20;
  const adjustedTimeSavings = Math.round(baseTimeSavings * (employeeMultipliers[employees] || 1));
  const weeklyValue = adjustedTimeSavings * hourlyValue;
  const selectedTier = tierData[tier] || tierData.foundation;
  const totalValue = weeklyValue * selectedTier.weeks;
  const investment = selectedTier.cost;
  const roi = Math.round(((totalValue - investment) / investment) * 100);
  const paybackWeeks = Math.ceil(investment / weeklyValue);

  const handleSendReport = async () => {
    if (!email || !email.includes('@')) return;

    setIsSending(true);
    try {
      const selectedIndustry = t.roiCalculator.industries.find(i => i.id === industry);
      const selectedSize = t.roiCalculator.employeeSizes.find(s => s.id === employees);
      const selectedTierName = t.roiCalculator.tiers.find(ti => ti.id === tier);

      const response = await fetch('/api/leads/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          industry: selectedIndustry?.name,
          employees: selectedSize?.name,
          hourlyValue,
          tier: selectedTierName?.name,
          metrics: {
            timeSaved: adjustedTimeSavings,
            weeklyValue,
            totalValue,
            investment,
            roi,
            paybackWeeks
          }
        }),
      });

      if (response.ok) {
        setSentSuccess(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Failed to send report', error);
    } finally {
      setIsSending(false);
    }
  };

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
          {/* Input Panel */}
          <div className="glass p-4 md:p-6 lg:p-8">
            <h3 className="text-xl font-bold text-white mb-6">{t.roiCalculator.yourBusinessDetails}</h3>

            {/* Industry Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-3">{t.roiCalculator.labels.industry}</label>
              <div className="grid grid-cols-1 gap-2">
                {t.roiCalculator.industries.map((ind) => (
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
                {t.roiCalculator.industryNote}
              </p>
            </div>

            {/* Business Size */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-3">{t.roiCalculator.labels.businessSize}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {t.roiCalculator.employeeSizes.map((size) => (
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
                {t.roiCalculator.labels.timeValue}
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
                {t.roiCalculator.timeValueNote}
              </p>
            </div>

            {/* Partnership Tier */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-3">{t.roiCalculator.labels.partnershipTier}</label>
              <div className="grid grid-cols-1 gap-2">
                {t.roiCalculator.tiers.map((ti) => {
                  const tierInfo = tierData[ti.id];
                  return (
                    <button
                      key={ti.id}
                      onClick={() => setTier(ti.id)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                        tier === ti.id
                          ? 'bg-[#0EA5E9] text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{ti.name}</span>
                        <span className="text-xs opacity-70">
                          ${tierInfo?.setupFee.toLocaleString()} + ${tierInfo?.monthlyFee.toLocaleString()}/mo × {tierInfo?.months}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex flex-col gap-4">
            {/* Main ROI Card */}
            <div className="glass p-4 md:p-6 lg:p-8 flex-1">
              <h3 className="text-lg font-bold text-white mb-6">{t.roiCalculator.results.heading}</h3>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">{t.roiCalculator.results.timeSaved}</div>
                  <div className="text-2xl font-bold text-[#0EA5E9]">{adjustedTimeSavings} hrs/week</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">{t.roiCalculator.results.weeklyValue}</div>
                  <div className="text-2xl font-bold text-[#0EA5E9]">${weeklyValue.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">{t.roiCalculator.results.investment}</div>
                  <div className="text-2xl font-bold text-white">${investment.toLocaleString()}</div>
                  <div className="text-xs text-white/40 mt-1">
                    ${selectedTier.setupFee?.toLocaleString()} + ${selectedTier.monthlyFee?.toLocaleString()}/mo × {selectedTier.months}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-white/50 mb-1">{t.roiCalculator.results.systemsBuilt}</div>
                  <div className="text-2xl font-bold text-white">{selectedTier.systemsBuilt}</div>
                </div>
              </div>

              {/* Total Value */}
              <div className="p-4 md:p-5 rounded-lg mb-4" style={{ background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
                <div className="text-xs text-[#0EA5E9] font-semibold mb-1">{t.roiCalculator.results.totalValueCreated}</div>
                <div className="text-4xl font-bold text-white mb-1">${totalValue.toLocaleString()}</div>
                <div className="text-xs text-white/60">{t.roiCalculator.results.over} {selectedTier.weeks} {t.roiCalculator.results.weeks}</div>
              </div>

              {/* ROI Highlight */}
              <div className="p-4 md:p-5 rounded-lg mb-6" style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#22C55E] font-semibold">{t.roiCalculator.results.yourRoi}</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-3xl font-bold text-[#22C55E]">{roi}%</span>
                  </div>
                </div>
                <div className="text-xs text-white/70">
                  {t.roiCalculator.results.paysForItself}{paybackWeeks} {t.roiCalculator.results.continuesGenerating}
                </div>
              </div>

              {/* Email Capture Lead Magnet */}
              {!sentSuccess ? (
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3">{t.roiCalculator.emailCapture.heading}</h4>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder={t.roiCalculator.emailCapture.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
                    />
                    <button
                      onClick={handleSendReport}
                      disabled={isSending || !email}
                      className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      {isSending ? t.roiCalculator.emailCapture.sending : t.roiCalculator.emailCapture.send}
                    </button>
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    {t.roiCalculator.emailCapture.note}
                  </p>
                </div>
              ) : (
                <div className="pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 p-3 bg-[#22C55E]/10 rounded-lg border border-[#22C55E]/30">
                    <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-[#22C55E] font-medium">{t.roiCalculator.emailCapture.success}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Comparison Card */}
            <div className="glass p-6">
              <h4 className="text-sm font-bold text-white/80 mb-4">{t.roiCalculator.comparison.heading}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xs text-white/60">{t.roiCalculator.comparison.traditionalConsultant}</span>
                  <span className="text-sm font-semibold text-[#F97316]">
                    ${(125 * adjustedTimeSavings * selectedTier.weeks).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-xs text-white/60">{t.roiCalculator.comparison.doneForYou}</span>
                  <span className="text-sm font-semibold text-[#F97316]">
                    ${(3500 * Math.ceil(selectedTier.weeks / 4)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60 font-semibold">{t.roiCalculator.comparison.aiSmbPartners}</span>
                  <span className="text-sm font-bold text-[#22C55E]">${investment.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-[#22C55E]/10">
                <p className="text-xs text-[#22C55E] font-semibold">
                  {t.roiCalculator.comparison.savePercent}{' '}
                  {Math.round(
                    ((Math.min(125 * adjustedTimeSavings * selectedTier.weeks, 3500 * Math.ceil(selectedTier.weeks / 4)) - investment) /
                      Math.min(125 * adjustedTimeSavings * selectedTier.weeks, 3500 * Math.ceil(selectedTier.weeks / 4))) *
                      100
                  )}
                  {t.roiCalculator.comparison.ownCapability}
                </p>
              </div>
            </div>

            {/* CTA */}
            <a href="#pricing" className="btn-primary text-center py-4 rounded-2xl font-semibold">
              {t.roiCalculator.cta}
            </a>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-white/50 max-w-3xl mx-auto">
            {t.roiCalculator.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
