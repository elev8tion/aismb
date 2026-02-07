'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { TASK_CATEGORIES, TaskHours } from './types';

interface Props {
  taskHours: TaskHours;
  hourlyLaborCost: number;
  onChange: (taskId: string, hours: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function TimeAuditStep({ taskHours, hourlyLaborCost, onChange, onNext, onBack }: Props) {
  const { t } = useTranslations();
  const rc = t.roiCalculator;

  const totalHours = TASK_CATEGORIES.reduce(
    (sum, cat) => sum + (taskHours[cat.id] ?? cat.defaultHoursPerWeek),
    0
  );

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-1">{rc.steps.timeAudit.title}</h3>
      <p className="text-sm text-white/50 mb-4">{rc.steps.timeAudit.subtitle}</p>

      <div className="space-y-4 mb-4">
        {TASK_CATEGORIES.map((cat) => {
          const hours = taskHours[cat.id] ?? cat.defaultHoursPerWeek;
          const weeklySaving = Math.round(hours * cat.automationRate * hourlyLaborCost);
          const taskLabel = rc.tasks[cat.id as keyof typeof rc.tasks];

          return (
            <div key={cat.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-white/80 font-medium">{taskLabel}</span>
                <span className="text-xs text-[#0EA5E9] font-semibold">
                  {hours}h/wk &middot; ${weeklySaving}/wk
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={hours}
                onChange={(e) => onChange(cat.id, Number(e.target.value))}
                className="w-full"
                style={{ accentColor: '#0EA5E9' }}
              />
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/60">{rc.steps.timeAudit.totalWeeklyHours}</span>
          <span className="text-lg font-bold text-white">{totalHours} hrs/wk</span>
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
          {rc.steps.next}
        </button>
      </div>
    </div>
  );
}
