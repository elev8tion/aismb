'use client';

import { useTranslations } from '@/contexts/LanguageContext';

interface Props {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({ currentStep, totalSteps, onStepClick }: Props) {
  const { t } = useTranslations();
  const labels = t.roiCalculator.steps.labels;

  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isClickable = isCompleted && !!onStepClick;

        const circle = (
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
              isActive
                ? 'bg-[#0EA5E9] text-white'
                : isCompleted
                ? 'bg-[#22C55E] text-white group-hover:bg-[#16A34A]'
                : 'bg-white/10 text-white/40'
            }`}
          >
            {isCompleted ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step
            )}
          </div>
        );

        const label = (
          <span
            className={`text-xs font-medium hidden sm:block transition-colors ${
              isActive
                ? 'text-white'
                : isCompleted
                ? 'text-white/60 group-hover:text-white/80'
                : 'text-white/30'
            }`}
          >
            {labels[i]}
          </span>
        );

        return (
          <div key={step} className="flex items-center gap-2 flex-1">
            {isClickable ? (
              <button
                type="button"
                onClick={() => onStepClick(step)}
                className="flex items-center gap-2 flex-1 group cursor-pointer"
                aria-label={`Go back to step ${step}: ${labels[i]}`}
              >
                {circle}
                {label}
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                {circle}
                {label}
              </div>
            )}
            {step < totalSteps && (
              <div
                className={`h-px flex-1 min-w-[16px] ${
                  isCompleted ? 'bg-[#22C55E]' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
