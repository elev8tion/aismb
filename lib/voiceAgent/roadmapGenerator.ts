/**
 * Roadmap Generator - Aggregates data for the AI Strategy Report
 */

import { LeadData } from './leadManager';
import { ScoreResult } from './leadScorer';

export interface StrategyReport {
  leadName: string;
  industry: string;
  currentMaturity: string;
  recommendedTier: string;
  projectedAnnualSavings: number;
  prioritySystems: string[];
  implementationTimeline: string;
}

/**
 * Generate a strategy report object based on lead data
 */
export function generateStrategyReport(lead: LeadData, score: ScoreResult): StrategyReport {
  const isHighValue = score.tier === 'high';
  
  // Logic to determine recommended tier
  let recommendedTier = 'AI Discovery';
  if (isHighValue || lead.employeeCount === '25-50' || lead.employeeCount === '50+') {
    recommendedTier = 'Systems Architect';
  } else if (lead.employeeCount === '10-25' || lead.employeeCount === '5-10') {
    recommendedTier = 'Foundation Builder';
  }

  // Determine priority systems based on industry
  const systemsByIndustry: Record<string, string[]> = {
    'HVAC': ['Dispatch AI', 'Automated Quote Generator', 'Follow-up Bot'],
    'Plumbing': ['Scheduling Agent', 'Invoice Processor', 'Customer Support Voice Agent'],
    'Property Management': ['Tenant Portal AI', 'Maintenance Triaging Agent', 'Lease Renewal Bot'],
    'Construction': ['Bid Assistant', 'Project Timeline AI', 'Subcontractor Comms Agent'],
    'Real Estate': ['Lead Qualifier', 'Showing Scheduler', 'Nurture Campaign Bot'],
  };

  const industryKey = lead.industry?.toUpperCase() || 'OTHER';
  const prioritySystems = systemsByIndustry[industryKey] || ['Customer Communication Agent', 'Task Automation Agent'];

  return {
    leadName: lead.firstName || 'Business Owner',
    industry: lead.industry || 'Service Industry',
    currentMaturity: score.tier === 'low' ? 'Initial Exploration' : score.tier === 'medium' ? 'Ready for Transformation' : 'High Priority Scaler',
    recommendedTier,
    projectedAnnualSavings: 0, // Would be calculated from ROI calc data if available
    prioritySystems,
    implementationTimeline: recommendedTier === 'AI Discovery' ? '8 Weeks' : recommendedTier === 'Foundation Builder' ? '12 Weeks' : '24 Weeks',
  };
}
