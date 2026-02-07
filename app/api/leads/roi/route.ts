import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { syncROICalcToCRM } from '@/lib/voiceAgent/leadManager';
import { sendROIReport, sendROILeadDossierToAdmin } from '@/lib/email/sendEmail';
import { TASK_CATEGORIES, TIER_DATA } from '@/components/ROICalculator/types';

const TASK_NAMES: Record<string, Record<string, string>> = {
  en: {
    scheduling: 'Scheduling & Appointments',
    communication: 'Customer Communication & Follow-up',
    dataEntry: 'Data Entry, Invoicing & Bookkeeping',
    leadResponse: 'Lead Response & Qualification',
    reporting: 'Reporting & Analytics',
    inventory: 'Inventory / Supply Tracking',
    socialMedia: 'Social Media & Marketing',
  },
  es: {
    scheduling: 'Programaci\u00f3n y Citas',
    communication: 'Comunicaci\u00f3n con Clientes y Seguimiento',
    dataEntry: 'Entrada de Datos, Facturaci\u00f3n y Contabilidad',
    leadResponse: 'Respuesta y Calificaci\u00f3n de Prospectos',
    reporting: 'Reportes y An\u00e1lisis',
    inventory: 'Seguimiento de Inventario / Suministros',
    socialMedia: 'Redes Sociales y Marketing',
  },
};

interface TaskBreakdownItem {
  taskId: string;
  hoursPerWeek: number;
  automationRate: number;
  weeklySavings: number;
}

interface ROILeadBody {
  email: string;
  industry: string;
  employees: string;
  hourlyValue: number;
  tier: string;
  locale?: string;
  metrics: {
    taskHours?: Record<string, number>;
    monthlyRevenue?: number;
    avgDealValue?: number;
    lostLeadsPerMonth?: number;
    closeRate?: number;
    totalWeeklyHoursSaved: number;
    weeklyLaborSavings: number;
    monthlyRevenueRecovery?: number;
    recoveredLeads?: number;
    annualBenefit: number;
    investment: number;
    roi: number;
    paybackWeeks: number;
    consultantCost?: number;
    agencyCost?: number;
    automatedTasks?: TaskBreakdownItem[];
    taskBreakdown?: TaskBreakdownItem[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ROILeadBody;
    const { email, industry, employees, hourlyValue, tier, locale, metrics } = body;
    const lang = locale === 'es' ? 'es' : 'en';
    const taskNames = TASK_NAMES[lang];

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const selectedTier = TIER_DATA[tier] || TIER_DATA.foundation;
    const tierNameMap: Record<string, Record<string, string>> = {
      en: { discovery: 'AI Discovery', foundation: 'Foundation Builder', architect: 'Systems Architect' },
      es: { discovery: 'AI Discovery', foundation: 'Constructor de Base', architect: 'Arquitecto de Sistemas' },
    };
    const tierName = tierNameMap[lang][tier] || tierNameMap.en[tier] || tier;

    // Use frontend-calculated task breakdown directly so email matches what user sees.
    // Fall back to server-side recalculation only for legacy requests missing the data.
    const automatedIds = new Set(
      (metrics.automatedTasks || []).map((t) => t.taskId)
    );

    let taskBreakdown: { id: string; name: string; hoursPerWeek: number; automationRate: number; weeklySavings: number }[];

    if (metrics.taskBreakdown && metrics.taskBreakdown.length > 0) {
      // Use exact frontend values
      taskBreakdown = metrics.taskBreakdown.map((t) => ({
        id: t.taskId,
        name: taskNames[t.taskId] || t.taskId,
        hoursPerWeek: t.hoursPerWeek,
        automationRate: t.automationRate,
        weeklySavings: t.weeklySavings,
      }));
    } else {
      // Legacy fallback: recalculate from taskHours
      taskBreakdown = TASK_CATEGORIES.map((cat) => {
        const hours = metrics.taskHours?.[cat.id] ?? cat.defaultHoursPerWeek;
        return {
          id: cat.id,
          name: taskNames[cat.id] || cat.id,
          hoursPerWeek: hours,
          automationRate: cat.automationRate,
          weeklySavings: Math.round(hours * cat.automationRate * hourlyValue),
        };
      }).sort((a, b) => b.weeklySavings - a.weeklySavings);

      // Recalculate automatedIds from tier for legacy path
      taskBreakdown.slice(0, selectedTier.tasksAutomated).forEach((t) => automatedIds.add(t.id));
    }

    // Sync to CRM (awaited — edge runtime kills unawaited promises)
    await syncROICalcToCRM({
      email,
      industry,
      employeeCount: employees,
      hourlyRate: hourlyValue,
      selectedTier: tier,
      calculations: metrics,
    }).catch((err) => console.error('Failed to sync ROI lead to CRM:', err));

    // Get EmailIt API key from Cloudflare env
    let emailitApiKey: string | undefined;
    try {
      const { env } = getRequestContext();
      emailitApiKey = env.EMAILIT_API_KEY;
    } catch {
      console.warn('[Email] Cloudflare context unavailable (local dev), skipping emails');
    }

    console.log('[ROI] Email API key available:', !!emailitApiKey);

    if (!emailitApiKey) {
      console.error('[ROI] EMAILIT_API_KEY missing — cannot send emails');
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
      }, { status: 500 });
    }

    // Await emails before returning — Cloudflare edge runtime kills the context
    // after the response is sent, so fire-and-forget promises never complete.
    const reportData = {
      industry,
      employees,
      hourlyLaborCost: hourlyValue,
      tier: tierName,
      locale: lang,
      taskBreakdown: taskBreakdown.map((t) => ({
        name: t.name,
        hoursPerWeek: t.hoursPerWeek,
        automationRate: t.automationRate,
        weeklySavings: t.weeklySavings,
        automated: automatedIds.has(t.id),
      })),
      totalWeeklyHoursSaved: metrics.totalWeeklyHoursSaved,
      weeklyLaborSavings: metrics.weeklyLaborSavings,
      recoveredLeads: metrics.recoveredLeads ?? (metrics.lostLeadsPerMonth ? Math.round(metrics.lostLeadsPerMonth * 0.6 * 10) / 10 : 0),
      monthlyRevenueRecovery: metrics.monthlyRevenueRecovery ?? 0,
      annualBenefit: metrics.annualBenefit,
      investment: metrics.investment,
      roi: metrics.roi,
      paybackWeeks: metrics.paybackWeeks,
      consultantCost: metrics.consultantCost ?? Math.round(metrics.totalWeeklyHoursSaved * 175 * 52),
      agencyCost: metrics.agencyCost ?? 6500 * 12,
    };

    // Send user report — this is the critical email the user expects
    await sendROIReport({
      to: email,
      report: reportData,
      emailitApiKey,
    });

    // Admin dossier is secondary — don't block response if it fails
    sendROILeadDossierToAdmin({
      adminEmail: 'connect@elev8tion.one',
      lead: {
        email,
        industry,
        employees,
        hourlyLaborCost: hourlyValue,
        tier: tierName,
        totalWeeklyHoursSaved: metrics.totalWeeklyHoursSaved,
        weeklyLaborSavings: metrics.weeklyLaborSavings,
        monthlyRevenueRecovery: metrics.monthlyRevenueRecovery ?? 0,
        annualBenefit: metrics.annualBenefit,
        investment: metrics.investment,
        roi: metrics.roi,
        paybackWeeks: metrics.paybackWeeks,
        taskBreakdown: taskBreakdown.map((t) => ({
          name: t.name,
          hoursPerWeek: t.hoursPerWeek,
          weeklySavings: t.weeklySavings,
        })),
      },
      emailitApiKey,
    }).catch((err) => console.error('[Email] Failed to send ROI dossier:', err));

    console.log('ROI LEAD PROCESSED:', { email, industry, employees, tier, roi: `${metrics?.roi}%` });

    return NextResponse.json({
      success: true,
      message: 'Report sent successfully',
    });
  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
