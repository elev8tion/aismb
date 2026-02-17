/**
 * Voice Agent ROI Calculator — overhead savings model.
 *
 * Matches the sovereign infrastructure pivot:
 * capital recaptured = (admin payroll + software eliminated - monthly fee) × 12
 *                    + (missed calls recovered × close rate × avg job value) × 12
 */
import { TIER_DATA } from '@/lib/shared/roiTypes';

export interface ROIInput {
  adminPayroll: number;          // monthly admin/support payroll
  softwareSubscriptions: number; // monthly software subscription spend
  missedCallsPerWeek: number;    // calls missed per week
  avgJobValue: number;           // average job or deal value
  tier: string;                  // 'discovery' | 'foundation' | 'architect'
}

export interface ROIResults {
  fixedMonthlySavings: number;
  recoveredMonthlyRevenue: number;
  totalAnnual: number;
  investment: number;
  roi: number;
  paybackWeeks: number;
  tierName: string;
}

export function calculateROI(input: ROIInput): ROIResults {
  const tierData = TIER_DATA[input.tier] ?? TIER_DATA.foundation;

  const fixedMonthlySavings = input.adminPayroll + input.softwareSubscriptions - tierData.monthlyFee;

  const capturedCallsPerMonth = input.missedCallsPerWeek * 4.33 * 0.6; // 60% capture rate
  const recoveredMonthlyRevenue = capturedCallsPerMonth * 0.35 * input.avgJobValue; // 35% close rate

  const annualFixed = fixedMonthlySavings * 12;
  const annualRevenue = recoveredMonthlyRevenue * 12;
  const totalAnnual = annualFixed + annualRevenue;

  const investment = tierData.cost;
  const roi = investment > 0 ? Math.round(((totalAnnual - investment) / investment) * 100) : 0;
  const paybackWeeks = totalAnnual > 0 ? Math.ceil(investment / (totalAnnual / 52)) : 999;

  return {
    fixedMonthlySavings,
    recoveredMonthlyRevenue,
    totalAnnual,
    investment,
    roi,
    paybackWeeks,
    tierName: tierData.name,
  };
}
