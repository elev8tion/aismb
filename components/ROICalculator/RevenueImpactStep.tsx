'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { RevenueImpactState } from './types';

interface Props {
  state: RevenueImpactState;
  onChange: (updates: Partial<RevenueImpactState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-white/80 mb-2">{label}</label>
      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-[#0EA5E9]">
        {prefix && <span className="pl-3 text-white/50 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="pr-3 text-white/50 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

export default function RevenueImpactStep({ state, onChange, onNext, onBack }: Props) {
  const { t } = useTranslations();
  const rc = t.roiCalculator;

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-1">{rc.steps.revenue.title}</h3>
      <p className="text-sm text-white/50 mb-6">{rc.steps.revenue.subtitle}</p>

      <div className="space-y-4 mb-6">
        <NumberInput
          label={rc.steps.revenue.monthlyRevenue}
          value={state.monthlyRevenue}
          onChange={(v) => onChange({ monthlyRevenue: v })}
          prefix="$"
          min={0}
          step={1000}
        />
        <NumberInput
          label={rc.steps.revenue.avgDealValue}
          value={state.avgDealValue}
          onChange={(v) => onChange({ avgDealValue: v })}
          prefix="$"
          min={0}
          step={100}
        />
        <NumberInput
          label={rc.steps.revenue.lostLeads}
          value={state.lostLeadsPerMonth}
          onChange={(v) => onChange({ lostLeadsPerMonth: v })}
          min={0}
          step={1}
          suffix="/mo"
        />
        <div>
          <label className="block text-sm font-semibold text-white/80 mb-2">{rc.steps.revenue.closeRate}</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={state.closeRate}
              onChange={(e) => onChange({ closeRate: Number(e.target.value) })}
              className="flex-1"
              style={{ accentColor: '#0EA5E9' }}
            />
            <span className="text-lg text-[#0EA5E9] font-bold min-w-[50px] text-right">
              {state.closeRate}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-xl transition-colors border border-white/10"
        >
          {rc.steps.back}
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-xl transition-colors"
        >
          {rc.steps.seeResults}
        </button>
      </div>
    </div>
  );
}
