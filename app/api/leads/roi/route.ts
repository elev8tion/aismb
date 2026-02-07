import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { syncROICalcToCRM } from '@/lib/voiceAgent/leadManager';
import { sendROIReport, sendROILeadDossierToAdmin } from '@/lib/email/sendEmail';
import { TASK_CATEGORIES, TIER_DATA } from '@/components/ROICalculator/types';

const TASK_NAMES: Record<string, string> = {
  scheduling: 'Scheduling & Appointments',
  communication: 'Customer Communication & Follow-up',
  dataEntry: 'Data Entry, Invoicing & Bookkeeping',
  leadResponse: 'Lead Response & Qualification',
  reporting: 'Reporting & Analytics',
  inventory: 'Inventory / Supply Tracking',
  socialMedia: 'Social Media & Marketing',
};

interface ROILeadBody {
  email: string;
  industry: string;
  employees: string;
  hourlyValue: number;
  tier: string;
  metrics: {
    taskHours?: Record<string, number>;
    monthlyRevenue?: number;
    avgDealValue?: number;
    lostLeadsPerMonth?: number;
    closeRate?: number;
    totalWeeklyHoursSaved: number;
    weeklyLaborSavings: number;
    monthlyRevenueRecovery?: number;
    annualBenefit: number;
    investment: number;
    roi: number;
    paybackWeeks: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ROILeadBody;
    const { email, industry, employees, hourlyValue, tier, metrics } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const selectedTier = TIER_DATA[tier] || TIER_DATA.foundation;

    // Build task breakdown from client-provided taskHours
    const tierName = tier === 'discovery' ? 'AI Discovery' : tier === 'foundation' ? 'Foundation Builder' : 'Systems Architect';
    const taskBreakdown = TASK_CATEGORIES.map((cat) => {
      const hours = metrics.taskHours?.[cat.id] ?? cat.defaultHoursPerWeek;
      return {
        id: cat.id,
        name: TASK_NAMES[cat.id] || cat.id,
        hoursPerWeek: hours,
        automationRate: cat.automationRate,
        weeklySavings: Math.round(hours * cat.automationRate * hourlyValue),
      };
    }).sort((a, b) => b.weeklySavings - a.weeklySavings);

    const automatedIds = new Set(
      taskBreakdown.slice(0, selectedTier.tasksAutomated).map((t) => t.id)
    );

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
      taskBreakdown: taskBreakdown.map((t) => ({
        name: t.name,
        hoursPerWeek: t.hoursPerWeek,
        automationRate: t.automationRate,
        weeklySavings: t.weeklySavings,
        automated: automatedIds.has(t.id),
      })),
      totalWeeklyHoursSaved: metrics.totalWeeklyHoursSaved,
      weeklyLaborSavings: metrics.weeklyLaborSavings,
      recoveredLeads: metrics.lostLeadsPerMonth ? Math.round(metrics.lostLeadsPerMonth * 0.6 * 10) / 10 : 0,
      monthlyRevenueRecovery: metrics.monthlyRevenueRecovery ?? 0,
      annualBenefit: metrics.annualBenefit,
      investment: metrics.investment,
      roi: metrics.roi,
      paybackWeeks: metrics.paybackWeeks,
      consultantCost: Math.round(metrics.totalWeeklyHoursSaved * 175 * 52),
      agencyCost: 6500 * 12,
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
