/**
 * Auth Providers Proxy Route
 *
 * PURPOSE: Pipeline User Transition
 * This route enables shared authentication between the landing page (kre8tion.com)
 * and the CRM (app.kre8tion.com). When users complete actions on the landing page
 * (voice agent sessions, ROI calculator, calendar booking), they can seamlessly
 * transition to the CRM without re-authenticating.
 *
 * CRITICAL: NCB requires lowercase 'instance' parameter, NOT 'Instance'
 */

import { NextResponse } from "next/server";
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  const { env } = getRequestContext();
  const url = `${env.NCB_AUTH_API_URL}/providers?instance=${env.NCB_INSTANCE}`;
  const res = await fetch(url);
  const data: Record<string, unknown> = await res.json();
  return NextResponse.json(data);
}
