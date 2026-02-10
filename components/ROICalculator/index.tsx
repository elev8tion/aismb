'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from '@/contexts/LanguageContext';
import {
  TASK_CATEGORIES,
  BusinessBasicsState,
  TaskHours,
  RevenueImpactState,
} from './types';
import { useROICalculation } from './useROICalculation';
import StepIndicator from './StepIndicator';
import BusinessBasicsStep from './BusinessBasicsStep';
import TimeAuditStep from './TimeAuditStep';
import RevenueImpactStep from './RevenueImpactStep';
import ResultsPanel from './ResultsPanel';
import ComparisonCard from './ComparisonCard';
import EmailCapture from './EmailCapture';
import InputSummary from './InputSummary';

const TOTAL_STEPS = 4;

function buildDefaultTaskHours(): TaskHours {
  const hours: TaskHours = {};
  TASK_CATEGORIES.forEach((cat) => {
    hours[cat.id] = cat.defaultHoursPerWeek;
  });
  return hours;
}

export default function ROICalculator() {
  const { t } = useTranslations();
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState('foundation');

  const [basics, setBasics] = useState<BusinessBasicsState>({
    industry: 'other',
    employees: '5-10',
    hourlyLaborCost: 35,
  });

  const [taskHours, setTaskHours] = useState<TaskHours>(buildDefaultTaskHours);

  const [revenue, setRevenue] = useState<RevenueImpactState>({
    monthlyRevenue: 50000,
    avgDealValue: 500,
    lostLeadsPerMonth: 10,
    closeRate: 25,
  });

  const results = useROICalculation({
    hourlyLaborCost: basics.hourlyLaborCost,
    taskHours,
    revenue,
    tier,
  });

  const handleBasicsChange = useCallback(
    (updates: Partial<BusinessBasicsState>) => setBasics((prev) => ({ ...prev, ...updates })),
    []
  );

  const handleTaskHoursChange = useCallback(
    (taskId: string, hours: number) =>
      setTaskHours((prev) => ({ ...prev, [taskId]: hours })),
    []
  );

  const handleRevenueChange = useCallback(
    (updates: Partial<RevenueImpactState>) => setRevenue((prev) => ({ ...prev, ...updates })),
    []
  );

  const nextStep = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const goToStep = useCallback((target: number) => {
    if (target < step) setStep(target);
  }, [step]);

  return (
    <section className="relative py-20 lg:py-32 px-4 sm:px-6" id="roi-calculator">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="tag inline-flex mb-4">{t.roiCalculator.tag}</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            {t.roiCalculator.heading}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t.roiCalculator.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left Column: Step Wizard */}
          <div className="glass p-4 md:p-6 lg:p-8">
            <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} onStepClick={goToStep} />

            {step === 1 && (
              <BusinessBasicsStep
                state={basics}
                onChange={handleBasicsChange}
                onNext={nextStep}
                tier={tier}
                onTierChange={setTier}
              />
            )}
            {step === 2 && (
              <TimeAuditStep
                taskHours={taskHours}
                hourlyLaborCost={basics.hourlyLaborCost}
                onChange={handleTaskHoursChange}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 3 && (
              <RevenueImpactStep
                state={revenue}
                onChange={handleRevenueChange}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {step === 4 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{t.roiCalculator.steps.results.title}</h3>
                <p className="text-sm text-white/50 mb-6">{t.roiCalculator.steps.results.subtitle}</p>

                {/* Mobile-only: show results inline */}
                <div className="lg:hidden space-y-4 mb-4">
                  <ResultsPanel results={results} tier={tier} onTierChange={setTier} />
                  <ComparisonCard results={results} />
                  <EmailCapture
                    basics={basics}
                    taskHours={taskHours}
                    revenue={revenue}
                    tier={tier}
                    results={results}
                  />
                </div>

                {/* Desktop: EmailCapture + InputSummary in left column */}
                <div className="hidden lg:block space-y-4 mb-4">
                  <EmailCapture
                    basics={basics}
                    taskHours={taskHours}
                    revenue={revenue}
                    tier={tier}
                    results={results}
                  />
                  <InputSummary basics={basics} taskHours={taskHours} revenue={revenue} />
                </div>

                <button
                  onClick={prevStep}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 font-semibold rounded-xl transition-colors border border-white/10 mb-3"
                >
                  {t.roiCalculator.steps.back}
                </button>
                <a
                  href="#pricing"
                  className="block w-full py-3 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold rounded-xl transition-colors text-center"
                >
                  {t.roiCalculator.cta}
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Live Results (desktop) */}
          <div className="hidden lg:flex flex-col gap-4">
            <ResultsPanel results={results} tier={tier} onTierChange={setTier} />
            <ComparisonCard results={results} />
            {step < 4 && (
              <EmailCapture
                basics={basics}
                taskHours={taskHours}
                revenue={revenue}
                tier={tier}
                results={results}
              />
            )}
            <a
              href="#pricing"
              className="btn-primary text-center py-4 rounded-2xl font-semibold"
            >
              {t.roiCalculator.cta}
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 text-center">
          <p className="text-xs text-white/50 max-w-3xl mx-auto">
            {t.roiCalculator.disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
