'use client';

import { useState } from 'react';
import { useTranslations } from '@/contexts/LanguageContext';
import { BusinessBasicsState, TaskHours, RevenueImpactState, ROIResults } from './types';

interface Props {
  basics: BusinessBasicsState;
  taskHours: TaskHours;
  revenue: RevenueImpactState;
  tier: string;
  results: ROIResults;
}

export default function EmailCapture({ basics, taskHours, revenue, tier, results }: Props) {
  const { t, language } = useTranslations();
  const rc = t.roiCalculator;

  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = async () => {
    if (!email || !email.includes('@')) return;

    setIsSending(true);
    try {
      const selectedIndustry = rc.industries.find((i) => i.id === basics.industry);
      const selectedSize = rc.employeeSizes.find((s) => s.id === basics.employees);
      const selectedTier = rc.tiers.find((ti) => ti.id === tier);

      const response = await fetch('/api/leads/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          industry: selectedIndustry?.name,
          employees: selectedSize?.name,
          hourlyValue: basics.hourlyLaborCost,
          tier: selectedTier?.id,
          locale: language,
          metrics: {
            taskHours,
            monthlyRevenue: revenue.monthlyRevenue,
            avgDealValue: revenue.avgDealValue,
            lostLeadsPerMonth: revenue.lostLeadsPerMonth,
            closeRate: revenue.closeRate,
            totalWeeklyHoursSaved: results.totalWeeklyHoursSaved,
            weeklyLaborSavings: results.weeklyLaborSavings,
            monthlyRevenueRecovery: results.monthlyRevenueRecovery,
            recoveredLeads: results.recoveredLeads,
            annualBenefit: results.annualBenefit,
            investment: results.investment,
            roi: results.roi,
            paybackWeeks: results.paybackWeeks,
            consultantCost: results.consultantCost,
            agencyCost: results.agencyCost,
            automatedTasks: results.automatedTasks.map((t) => ({
              taskId: t.taskId,
              hoursPerWeek: t.hoursPerWeek,
              automationRate: t.automationRate,
              weeklySavings: t.weeklySavings,
            })),
            taskBreakdown: results.taskBreakdown.map((t) => ({
              taskId: t.taskId,
              hoursPerWeek: t.hoursPerWeek,
              automationRate: t.automationRate,
              weeklySavings: t.weeklySavings,
            })),
          },
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

  if (sentSuccess) {
    return (
      <div className="glass p-5">
        <div className="flex items-center gap-2 p-3 bg-[#22C55E]/10 rounded-lg border border-[#22C55E]/30">
          <svg className="w-5 h-5 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-[#22C55E] font-medium">{rc.emailCapture.success}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-5">
      <h4 className="text-sm font-semibold text-white mb-3">{rc.emailCapture.heading}</h4>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder={rc.emailCapture.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#0EA5E9]"
        />
        <button
          onClick={handleSend}
          disabled={isSending || !email}
          className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {isSending ? rc.emailCapture.sending : rc.emailCapture.send}
        </button>
      </div>
      <p className="text-xs text-white/40 mt-2">{rc.emailCapture.note}</p>
    </div>
  );
}
