'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { ROIResults } from './types';

interface Props {
  results: ROIResults;
  visible: boolean;
}

function formatPayback(weeks: number, wksLabel: string, moLabel: string): string {
  if (weeks < 52) return `${weeks} ${wksLabel}`;
  const months = Math.round(weeks / 4.33);
  return `${months} ${moLabel}`;
}

export default function MiniResultsBar({ results, visible }: Props) {
  const { t } = useTranslations();
  const rc = t.roiCalculator.results;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="glass border-t border-white/10 px-4 py-3">
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
          <div className="text-center">
            <div className="text-[10px] text-white/50 font-medium">{rc.miniRoi}</div>
            <div className="text-lg font-bold text-[#22C55E]">{results.roi}%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-white/50 font-medium">{rc.miniSavings}</div>
            <div className="text-lg font-bold text-[#0EA5E9]">${results.weeklyLaborSavings.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-white/50 font-medium">{rc.miniPayback}</div>
            <div className="text-lg font-bold text-[#F97316]">
              {formatPayback(results.paybackWeeks, rc.weeksShort, rc.monthsShort)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
