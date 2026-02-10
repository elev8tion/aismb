/**
 * Re-export all ROI types and constants from the shared source of truth.
 * This file exists so existing component imports don't break.
 */
export {
  TASK_CATEGORIES,
  TIER_DATA,
  type TaskCategory,
  type TierConfig,
  type BusinessBasicsState,
  type TaskHours,
  type RevenueImpactState,
  type TaskSavingsBreakdown,
  type ROIResults,
} from '@/lib/shared/roiTypes';
