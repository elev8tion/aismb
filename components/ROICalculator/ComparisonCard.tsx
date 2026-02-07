'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { ROIResults } from './types';

interface Props {
  results: ROIResults;
}

export default function ComparisonCard({ results }: Props) {
  const { t } = useTranslations();
  const rc = t.roiCalculator;

  const cheapestAlt = Math.min(results.consultantCost, results.agencyCost);
  const savingsPercent =
    cheapestAlt > 0
      ? Math.round(((cheapestAlt - results.investment) / cheapestAlt) * 100)
      : 0;

  return (
    <div className="glass p-5">
      <h4 className="text-sm font-bold text-white/80 mb-4">{rc.comparison.heading}</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div>
            <span className="text-xs text-white/60">{rc.comparison.traditionalConsultant}</span>
            <div className="text-[10px] text-white/30">{rc.comparison.consultantRate}</div>
          </div>
          <span className="text-sm font-semibold text-[#F97316]">
            ${results.consultantCost.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <div>
            <span className="text-xs text-white/60">{rc.comparison.doneForYou}</span>
            <div className="text-[10px] text-white/30">{rc.comparison.agencyRate}</div>
          </div>
          <span className="text-sm font-semibold text-[#F97316]">
            ${results.agencyCost.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/60 font-semibold">{rc.comparison.aiSmbPartners}</span>
          <span className="text-sm font-bold text-[#22C55E]">${results.investment.toLocaleString()}</span>
        </div>
      </div>
      {savingsPercent > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[#22C55E]/10">
          <p className="text-xs text-[#22C55E] font-semibold">
            {rc.comparison.savePercent} {savingsPercent}{rc.comparison.ownCapability}
          </p>
        </div>
      )}
    </div>
  );
}
