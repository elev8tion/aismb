/**
 * Pure-function ROI Calculator for Voice Agent
 *
 * Identical math to components/ROICalculator/useROICalculation.ts
 * but without React dependencies, so it can run server-side.
 */

import {
  TASK_CATEGORIES,
  TIER_DATA,
  TaskHours,
  RevenueImpactState,
  TaskSavingsBreakdown,
  ROIResults,
} from '@/components/ROICalculator/types';

export interface ROIInput {
  hourlyLaborCost: number;
  taskHours: Partial<TaskHours>;
  revenue: Partial<RevenueImpactState>;
  tier: string;
}

const DEFAULT_REVENUE: RevenueImpactState = {
  monthlyRevenue: 50000,
  avgDealValue: 2000,
  lostLeadsPerMonth: 5,
  closeRate: 30,
};

export function calculateROI(input: ROIInput): ROIResults {
  const hourlyLaborCost = input.hourlyLaborCost || 25;
  const tier = input.tier || 'foundation';
  const selectedTier = TIER_DATA[tier] || TIER_DATA.foundation;

  const revenue: RevenueImpactState = {
    ...DEFAULT_REVENUE,
    ...input.revenue,
  };

  // 1. Calculate per-task savings and sort descending
  const taskBreakdown: TaskSavingsBreakdown[] = TASK_CATEGORIES.map((cat) => {
    const hours = input.taskHours[cat.id] ?? cat.defaultHoursPerWeek;
    return {
      taskId: cat.id,
      hoursPerWeek: hours,
      automationRate: cat.automationRate,
      weeklySavings: hours * cat.automationRate * hourlyLaborCost,
    };
  }).sort((a, b) => b.weeklySavings - a.weeklySavings);

  // 2. Select top N tasks per tier
  const automatedTasks = taskBreakdown.slice(0, selectedTier.tasksAutomated);

  // 3. Sum weekly labor savings
  let weeklyLaborSavings = automatedTasks.reduce((sum, t) => sum + t.weeklySavings, 0);
  weeklyLaborSavings *= selectedTier.efficiencyBoost;

  const totalWeeklyHoursSaved = automatedTasks.reduce(
    (sum, t) => sum + t.hoursPerWeek * t.automationRate,
    0
  ) * selectedTier.efficiencyBoost;

  // 4. Revenue recovery
  const recoveredLeads = revenue.lostLeadsPerMonth * 0.60;
  const monthlyRevenueRecovery =
    recoveredLeads * (revenue.closeRate / 100) * revenue.avgDealValue;

  // 5. Combined
  const totalWeeklyBenefit = weeklyLaborSavings + monthlyRevenueRecovery / 4.33;
  const annualBenefit = totalWeeklyBenefit * 52;
  const investment = selectedTier.cost;
  const roi = investment > 0 ? Math.round(((annualBenefit - investment) / investment) * 100) : 0;
  const paybackWeeks =
    totalWeeklyBenefit > 0 ? Math.ceil(investment / totalWeeklyBenefit) : 999;

  // 6. Comparison costs
  const consultantCost = Math.round(totalWeeklyHoursSaved * 175 * 52);
  const agencyCost = 6500 * 12;

  return {
    taskBreakdown,
    automatedTasks,
    totalWeeklyHoursSaved: Math.round(totalWeeklyHoursSaved * 10) / 10,
    weeklyLaborSavings: Math.round(weeklyLaborSavings),
    recoveredLeads: Math.round(recoveredLeads * 10) / 10,
    monthlyRevenueRecovery: Math.round(monthlyRevenueRecovery),
    totalWeeklyBenefit: Math.round(totalWeeklyBenefit),
    annualBenefit: Math.round(annualBenefit),
    investment,
    roi,
    paybackWeeks,
    consultantCost,
    agencyCost,
  };
}
