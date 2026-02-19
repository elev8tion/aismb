import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/cloudflare/env';
import { sendROIReport, sendROILeadDossierToAdmin } from '@/lib/email/sendEmail';
import { syncLeadToCRM } from '@/lib/voiceAgent/leadManager';

interface ROILeadBody {
  email: string;
  tier: string;
  locale?: string;
  metrics: {
    payroll: number;
    software: number;
    missedCalls: number;
    avgJobValue: number;
    fixedMonthlySavings: number;
    recoveredMonthlyRevenue: number;
    annualFixed: number;
    annualRevenue: number;
    totalAnnual: number;
    investment: number;
    setupFee: number;
    monthlyFee: number;
    months: number;
    roi: number;
    paybackWeeks: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ROILeadBody;
    const { email, tier, locale, metrics } = body;
    const lang = locale === 'es' ? 'es' : 'en';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const tierNameMap: Record<string, Record<string, string>> = {
      en: {
        discovery: 'The Revenue Guard',
        foundation: 'The Operations Sovereign',
        architect: 'The Enterprise Fortress',
      },
      es: {
        discovery: 'El Guardia de Ingresos',
        foundation: 'El Soberano de Operaciones',
        architect: 'La Fortaleza Empresarial',
      },
    };
    const tierName = tierNameMap[lang][tier] || tierNameMap.en[tier] || tier;

    // Get env from Cloudflare context
    const env = getEnv() as unknown as Record<string, string>;
    const emailitApiKey = env.EMAILIT_API_KEY;

    if (!emailitApiKey) {
      console.error('[ROI] EMAILIT_API_KEY missing — cannot send emails');
      return NextResponse.json({
        success: false,
        error: 'Email service not configured',
      }, { status: 500 });
    }

    // Build report data matching new ROIReportData interface
    const reportData = {
      tier: tierName,
      locale: lang,
      payroll: metrics.payroll,
      software: metrics.software,
      missedCalls: metrics.missedCalls,
      avgJobValue: metrics.avgJobValue,
      fixedMonthlySavings: metrics.fixedMonthlySavings,
      recoveredMonthlyRevenue: metrics.recoveredMonthlyRevenue,
      annualFixed: metrics.annualFixed,
      annualRevenue: metrics.annualRevenue,
      totalAnnual: metrics.totalAnnual,
      investment: metrics.investment,
      roi: metrics.roi,
      paybackWeeks: metrics.paybackWeeks,
      monthlyFee: metrics.monthlyFee,
    };

    // Send user report — awaited (edge runtime kills unawaited promises)
    await sendROIReport({
      to: email,
      report: reportData,
      emailitApiKey,
    });

    // Brief pause to avoid EmailIt per-second rate limit (2 req/s)
    await new Promise((r) => setTimeout(r, 1000));

    // Admin dossier
    try {
      await sendROILeadDossierToAdmin({
        adminEmail: 'connect@elev8tion.one',
        lead: {
          email,
          tier: tierName,
          payroll: metrics.payroll,
          software: metrics.software,
          missedCalls: metrics.missedCalls,
          avgJobValue: metrics.avgJobValue,
          fixedMonthlySavings: metrics.fixedMonthlySavings,
          recoveredMonthlyRevenue: metrics.recoveredMonthlyRevenue,
          totalAnnual: metrics.totalAnnual,
          investment: metrics.investment,
          roi: metrics.roi,
          paybackWeeks: metrics.paybackWeeks,
        },
        emailitApiKey,
      });
    } catch (err) {
      console.error('[Email] Failed to send ROI dossier:', err instanceof Error ? err.message : err);
    }

    // Sync to CRM — create or update lead by email
    // If this email later books, syncLeadToCRM will find this record and update it
    try {
      await syncLeadToCRM({
        email,
        source: 'roi-calculator',
        sourceDetail: `${tierName} — ${metrics.roi}% ROI, ${Math.round(metrics.totalAnnual / 1000)}k/yr, payback ${metrics.paybackWeeks} wks`,
        qualified_score: Math.min(100, Math.round(metrics.roi / 5)),
      }, env);
    } catch (err) {
      console.error('[ROI] CRM sync failed:', err instanceof Error ? err.message : err);
    }

    return NextResponse.json({
      success: true,
      message: 'Report sent successfully',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Lead capture error:', msg);
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
