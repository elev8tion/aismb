import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Edge runtime test',
    timestamp: new Date().toISOString(),
  });
}

export const runtime = 'edge';
