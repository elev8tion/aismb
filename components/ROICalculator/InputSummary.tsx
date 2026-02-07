'use client';

import { useTranslations } from '@/contexts/LanguageContext';
import { BusinessBasicsState, TaskHours, RevenueImpactState } from './types';

interface Props {
  basics: BusinessBasicsState;
  taskHours: TaskHours;
  revenue: RevenueImpactState;
}

export default function InputSummary({ basics, taskHours, revenue }: Props) {
  const { t } = useTranslations();
  const rc = t.roiCalculator;
  const is = rc.inputSummary;

  const industryName = rc.industries.find((i) => i.id === basics.industry)?.name ?? basics.industry;
  const employeeName = rc.employeeSizes.find((s) => s.id === basics.employees)?.name ?? basics.employees;
  const totalHours = Object.values(taskHours).reduce((sum, h) => sum + h, 0);

  const items = [
    { label: is.industry, value: industryName },
    { label: is.teamSize, value: employeeName },
    { label: is.hourlyRate, value: `$${basics.hourlyLaborCost}` },
    { label: is.weeklyHours, value: `${totalHours} hrs` },
    { label: is.monthlyRevenue, value: `$${revenue.monthlyRevenue.toLocaleString()}` },
    { label: is.lostLeads, value: `${revenue.lostLeadsPerMonth}` },
  ];

  return (
    <div className="hidden lg:block glass p-4 md:p-6">
      <h4 className="text-sm font-bold text-white/70 mb-3">{is.title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="p-2 rounded-lg bg-white/5 border border-white/10">
            <div className="text-[10px] text-white/40">{item.label}</div>
            <div className="text-sm font-semibold text-white">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
