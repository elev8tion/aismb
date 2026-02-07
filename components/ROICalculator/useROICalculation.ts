import { useMemo } from 'react';
import {
  TASK_CATEGORIES,
  TIER_DATA,
  TaskHours,
  RevenueImpactState,
  TaskSavingsBreakdown,
  ROIResults,
} from './types';

interface UseROICalculationParams {
  hourlyLaborCost: number;
  taskHours: TaskHours;
  revenue: RevenueImpactState;
  tier: string;
}

export function useROICalculation({
  hourlyLaborCost,
  taskHours,
  revenue,
  tier,
}: UseROICalculationParams): ROIResults {
  return useMemo(() => {
    const selectedTier = TIER_DATA[tier] || TIER_DATA.foundation;

    // 1. Calculate per-task savings and sort descending
    const taskBreakdown: TaskSavingsBreakdown[] = TASK_CATEGORIES.map((cat) => {
      const hours = taskHours[cat.id] ?? cat.defaultHoursPerWeek;
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
  }, [hourlyLaborCost, taskHours, revenue, tier]);
}
