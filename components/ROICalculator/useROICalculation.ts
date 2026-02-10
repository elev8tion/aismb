import { useMemo } from 'react';
import { TaskHours, RevenueImpactState, ROIResults } from './types';
import { calculateROI } from '@/lib/shared/roiEngine';

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
  return useMemo(
    () => calculateROI({ hourlyLaborCost, taskHours, revenue, tier }),
    [hourlyLaborCost, taskHours, revenue, tier],
  );
}
