/**
 * Lead Scorer - Evaluates the quality and fit of a lead
 */

import { LeadData } from './leadManager';

export interface ScoreResult {
  score: number;
  tier: 'low' | 'medium' | 'high';
  factors: string[];
}

/**
 * Calculate lead score based on profile data
 */
export function calculateLeadScore(data: Partial<LeadData>): ScoreResult {
  let score = 0;
  const factors: string[] = [];

  // 1. Industry Fit (Weight: 30)
  const targetIndustries = ['hvac', 'plumbing', 'construction', 'property management', 'real estate'];
  if (data.industry) {
    if (targetIndustries.includes(data.industry.toLowerCase())) {
      score += 30;
      factors.push('Target industry match');
    } else {
      score += 10;
      factors.push('Standard industry');
    }
  }

  // 2. Business Size Fit (Weight: 30)
  if (data.employeeCount) {
    if (data.employeeCount === '10-25' || data.employeeCount === '25-50') {
      score += 30;
      factors.push('Ideal business size (10-50 employees)');
    } else if (data.employeeCount === '5-10') {
      score += 20;
      factors.push('Good business size (5-10 employees)');
    } else if (data.employeeCount === '50+') {
      score += 15;
      factors.push('Enterprise lead');
    } else {
      score += 5;
      factors.push('Micro-business');
    }
  }

  // 3. Contact Info completeness (Weight: 20)
  if (data.email) {
    score += 10;
    factors.push('Has email');
  }
  if (data.phone) {
    score += 10;
    factors.push('Has phone');
  }

  // 4. Intent Indicators (Weight: 20)
  // These will be passed from the Voice Agent's analysis in the future
  // For now, if we have both industry and employees, it shows high intent
  if (data.industry && data.employeeCount) {
    score += 20;
    factors.push('Profile completeness shows high intent');
  }

  // Determine tier
  let tier: 'low' | 'medium' | 'high' = 'low';
  if (score >= 80) tier = 'high';
  else if (score >= 50) tier = 'medium';

  return { score, tier, factors };
}
