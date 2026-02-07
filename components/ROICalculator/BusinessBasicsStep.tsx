'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { BusinessBasicsState, TIER_DATA } from './types';

interface Props {
  state: BusinessBasicsState;
  onChange: (updates: Partial<BusinessBasicsState>) => void;
  onNext: () => void;
  tier: string;
  onTierChange: (tier: string) => void;
}

export default function BusinessBasicsStep({ state, onChange, onNext, tier, onTierChange }: Props) {
  const { t } = useTranslations();
  const rc = t.roiCalculator;

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-1">{rc.steps.basics.title}</h3>
      <p className="text-sm text-white/50 mb-6">{rc.steps.basics.subtitle}</p>

      {/* Industry */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-white/80 mb-2">{rc.labels.industry}</label>
        <div className="grid grid-cols-1 gap-2">
          {rc.industries.map((ind) => (
            <button
              key={ind.id}
              onClick={() => onChange({ industry: ind.id })}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                state.industry === ind.id
                  ? 'bg-[#0EA5E9] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              {ind.name}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Count */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-white/80 mb-2">{rc.labels.businessSize}</label>
        <div className="grid grid-cols-2 gap-2">
          {rc.employeeSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => onChange({ employees: size.id })}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                state.employees === size.id
                  ? 'bg-[#0EA5E9] text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }`}
            >
              {size.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hourly Labor Cost */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-white/80 mb-2">{rc.labels.hourlyLaborCost}</label>
        <div className="flex items-center gap-3">
          <span className="text-xl text-white font-bold">$</span>
          <input
            type="range"
            min="15"
            max="250"
            step="5"
            value={state.hourlyLaborCost}
            onChange={(e) => onChange({ hourlyLaborCost: Number(e.target.value) })}
            className="flex-1"
            style={{ accentColor: '#0EA5E9' }}
          />
          <span className="text-xl text-[#0EA5E9] font-bold min-w-[60px] text-right">
            ${state.hourlyLaborCost}
          </span>
        </div>
        <p className="text-xs text-white/40 mt-1">{rc.hourlyLaborCostNote}</p>
      </div>

      {/* Tier Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-white/80 mb-2">{rc.labels.partnershipTier}</label>
        <div className="grid grid-cols-3 gap-2">
          {rc.tiers.map((ti) => {
            const tierInfo = TIER_DATA[ti.id];
            return (
              <button
                key={ti.id}
                onClick={() => onTierChange(ti.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                  tier === ti.id
                    ? 'bg-[#0EA5E9] text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div>{ti.name}</div>
                {tierInfo && (
                  <div className="text-[10px] opacity-70 mt-0.5">
                    ${tierInfo.cost.toLocaleString()}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-xl transition-colors"
      >
        {rc.steps.next}
      </button>
    </div>
  );
}
