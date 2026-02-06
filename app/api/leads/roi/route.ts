import { NextRequest, NextResponse } from 'next/server';
import { syncROICalcToCRM } from '@/lib/voiceAgent/leadManager';

interface ROILeadBody {
  email: string;
  industry: string;
  employees: string;
  hourlyValue: number;
  tier: string;
  metrics: {
    timeSaved: number;
    weeklyValue: number;
    totalValue: number;
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

    // 🔄 SYNC TO CRM: Save lead and ROI calculation
    console.log(`🎯 Syncing ROI Lead to CRM: ${email}`);
    
    // Non-blocking sync to CRM
    syncROICalcToCRM({
      email,
      industry,
      employeeCount: employees,
      hourlyRate: hourlyValue,
      selectedTier: tier,
      calculations: metrics
    }).catch(err => console.error('Failed to sync ROI lead to CRM:', err));

    // SIMULATION: Log to console for visibility in logs
    console.log('📝 ROI LEAD PROCESSED:', {
      email,
      industry,
      employees,
      tier,
      roi: `${metrics?.roi}%`
    });

    // Return success
    return NextResponse.json({ 
      success: true,
      message: 'Report sent successfully' 
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
