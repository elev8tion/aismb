export interface TaskCategory {
  id: string;
  automationRate: number;
  defaultHoursPerWeek: number;
}

export const TASK_CATEGORIES: TaskCategory[] = [
  { id: 'scheduling',     automationRate: 0.85, defaultHoursPerWeek: 6 },
  { id: 'communication',  automationRate: 0.70, defaultHoursPerWeek: 8 },
  { id: 'dataEntry',      automationRate: 0.90, defaultHoursPerWeek: 5 },
  { id: 'leadResponse',   automationRate: 0.75, defaultHoursPerWeek: 4 },
  { id: 'reporting',      automationRate: 0.80, defaultHoursPerWeek: 3 },
  { id: 'inventory',      automationRate: 0.60, defaultHoursPerWeek: 4 },
  { id: 'socialMedia',    automationRate: 0.50, defaultHoursPerWeek: 5 },
];

export interface TierConfig {
  id: string;
  setupFee: number;
  monthlyFee: number;
  months: number;
  cost: number;
  tasksAutomated: number;
  efficiencyBoost: number;
}

export const TIER_DATA: Record<string, TierConfig> = {
  discovery:   { id: 'discovery',   setupFee: 2500,  monthlyFee: 750,  months: 2, cost: 4000,  tasksAutomated: 3, efficiencyBoost: 1.0 },
  foundation:  { id: 'foundation',  setupFee: 5000,  monthlyFee: 1500, months: 3, cost: 9500,  tasksAutomated: 6, efficiencyBoost: 1.0 },
  architect:   { id: 'architect',   setupFee: 12000, monthlyFee: 3000, months: 6, cost: 30000, tasksAutomated: 7, efficiencyBoost: 1.1 },
};

export interface BusinessBasicsState {
  industry: string;
  employees: string;
  hourlyLaborCost: number;
}

export interface TaskHours {
  [taskId: string]: number;
}

export interface RevenueImpactState {
  monthlyRevenue: number;
  avgDealValue: number;
  lostLeadsPerMonth: number;
  closeRate: number;
}

export interface TaskSavingsBreakdown {
  taskId: string;
  hoursPerWeek: number;
  automationRate: number;
  weeklySavings: number;
}

export interface ROIResults {
  taskBreakdown: TaskSavingsBreakdown[];
  automatedTasks: TaskSavingsBreakdown[];
  totalWeeklyHoursSaved: number;
  weeklyLaborSavings: number;
  recoveredLeads: number;
  monthlyRevenueRecovery: number;
  totalWeeklyBenefit: number;
  annualBenefit: number;
  investment: number;
  roi: number;
  paybackWeeks: number;
  // Comparison
  consultantCost: number;
  agencyCost: number;
}
