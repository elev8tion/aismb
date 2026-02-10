/**
 * Voice Agent ROI Calculator — thin wrapper around shared engine.
 *
 * Re-exports calculateROI and ROIInput so existing imports resolve.
 */
export { calculateROI, type ROIInput } from '@/lib/shared/roiEngine';
