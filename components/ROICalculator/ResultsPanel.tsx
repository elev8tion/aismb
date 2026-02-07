'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { TIER_DATA, ROIResults } from './types';

interface Props {
  results: ROIResults;
  tier: string;
  onTierChange: (tier: string) => void;
}

function formatPayback(weeks: number, wksLabel: string, moLabel: string): string {
  if (weeks < 52) return `${weeks} ${wksLabel}`;
  const months = Math.round(weeks / 4.33);
  return `${months} ${moLabel}`;
}

export default function ResultsPanel({ results, tier, onTierChange }: Props) {
  const { t } = useTranslations();
  const rc = t.roiCalculator;
  const selectedTier = TIER_DATA[tier] || TIER_DATA.foundation;

  return (
    <div className="glass p-4 md:p-6 lg:p-8">
      <h3 className="text-lg font-bold text-white mb-4">{rc.results.heading}</h3>

      {/* Tier Selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-white/60 mb-2">{rc.labels.partnershipTier}</label>
        <div className="grid grid-cols-3 gap-2">
          {rc.tiers.map((ti) => {
            const tierInfo = TIER_DATA[ti.id];
            return (
              <button
                key={ti.id}
                onClick={() => onTierChange(ti.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                  tier === ti.id
                    ? 'bg-[#0EA5E9] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div>{ti.name}</div>
                {tierInfo && (
                  <div className="text-[10px] opacity-70 mt-0.5">
                    ${tierInfo.setupFee.toLocaleString()} + ${tierInfo.monthlyFee.toLocaleString()}/mo
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Pair: ROI% + Payback */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="p-4 rounded-lg"
          style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
        >
          <div className="text-xs text-[#22C55E] font-semibold mb-1">{rc.results.yourRoi}</div>
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-3xl font-bold text-[#22C55E]">{results.roi}%</span>
          </div>
        </div>
        <div
          className="p-4 rounded-lg"
          style={{ background: 'rgba(249, 115, 22, 0.15)', border: '1px solid rgba(249, 115, 22, 0.3)' }}
        >
          <div className="text-xs text-[#F97316] font-semibold mb-1">{rc.results.paybackLabel}</div>
          <div className="text-3xl font-bold text-[#F97316]">
            {formatPayback(results.paybackWeeks, rc.results.weeksShort, rc.results.monthsShort)}
          </div>
        </div>
      </div>

      {/* Annual Benefit - compact bar */}
      <div
        className="flex items-center justify-between p-3 rounded-lg mb-4"
        style={{ background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)' }}
      >
        <span className="text-sm text-[#0EA5E9] font-semibold">{rc.results.annualBenefit}</span>
        <span className="text-2xl font-bold text-white">${results.annualBenefit.toLocaleString()}</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs text-white/50 mb-1">{rc.results.timeSaved}</div>
          <div className="text-xl font-bold text-[#0EA5E9]">{results.totalWeeklyHoursSaved} hrs/wk</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs text-white/50 mb-1">{rc.results.weeklyValue}</div>
          <div className="text-xl font-bold text-[#0EA5E9]">${results.weeklyLaborSavings.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs text-white/50 mb-1">{rc.results.investment}</div>
          <div className="text-xl font-bold text-white">${results.investment.toLocaleString()}</div>
          <div className="text-[10px] text-white/40 mt-0.5">
            ${selectedTier.setupFee.toLocaleString()} + ${selectedTier.monthlyFee.toLocaleString()}/mo × {selectedTier.months}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs text-white/50 mb-1">{rc.results.tasksAutomated}</div>
          <div className="text-xl font-bold text-white">{selectedTier.tasksAutomated}</div>
        </div>
      </div>

      {/* Revenue Recovery */}
      {results.monthlyRevenueRecovery > 0 && (
        <div className="p-3 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 mb-4">
          <div className="text-xs text-[#8B5CF6] font-semibold mb-1">{rc.results.revenueRecovery}</div>
          <div className="text-lg font-bold text-white">
            ${results.monthlyRevenueRecovery.toLocaleString()}/mo
          </div>
          <div className="text-xs text-white/50">
            {results.recoveredLeads} {rc.results.recoveredLeadsLabel}
          </div>
        </div>
      )}

      {/* Task Breakdown */}
      <div className="mb-2">
        <div className="text-xs font-semibold text-white/60 mb-2">{rc.results.automatedTasksLabel}</div>
        <div className="space-y-1.5">
          {results.automatedTasks.map((task, i) => {
            const taskLabel = rc.tasks[task.taskId as keyof typeof rc.tasks];
            return (
              <div key={task.taskId} className="flex justify-between items-center text-xs">
                <span className="text-white/70">
                  <span className="text-[#22C55E] font-bold mr-1">{i + 1}.</span>
                  {taskLabel}
                </span>
                <span className="text-[#0EA5E9] font-semibold">${task.weeklySavings.toLocaleString()}/wk</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
