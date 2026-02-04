import { NextRequest, NextResponse } from 'next/server';

interface ROILeadBody {
  email: string;
  industry: string;
  employees: string;
  hourlyValue: number;
  tier: string;
  metrics: {
    totalValue: number;
    roi: number;
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

    // SIMULATION: Log the lead to console (Replace with DB/Email service in production)
    console.log('📝 NEW ROI LEAD CAPTURED:');
    console.log('------------------------------------------------');
    console.log(`Email: ${email}`);
    console.log(`Business: ${industry}, ${employees}`);
    console.log(`Hourly Value: $${hourlyValue}`);
    console.log(`Tier Interest: ${tier}`);
    console.log(`Est. Value: ${metrics?.totalValue}`);
    console.log(`Est. ROI: ${metrics?.roi}%`);
    console.log('------------------------------------------------');

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
