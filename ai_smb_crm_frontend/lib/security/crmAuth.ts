import type { NextRequest } from 'next/server';
import { getSessionUser, type NCBEnv } from '@/lib/agent/ncbClient';

export interface CRMAuth {
  user: { id: string; email: string; name: string };
  role: string | null;
}

function openApiBase(env: NCBEnv) {
  return env.NCB_OPENAPI_URL || 'https://openapi.nocodebackend.com';
}

async function openApiRead(env: NCBEnv, table: string): Promise<any[]> {
  if (!env.NCB_SECRET_KEY) return [];

  const url = new URL(`${openApiBase(env)}/read/${table}`);
  url.searchParams.set('Instance', env.NCB_INSTANCE);

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.NCB_SECRET_KEY}`,
    },
  });
  if (!res.ok) return [];

  const data: any = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

export async function getCRMAuth(
  env: NCBEnv,
  req: NextRequest,
): Promise<CRMAuth | null> {
  const cookieHeader = req.headers.get('cookie') || '';
  const user = await getSessionUser(env, cookieHeader);
  if (!user) return null;

  const profiles = await openApiRead(env, 'user_profiles');
  const profile = profiles.find((row) => String(row.user_id) === String(user.id));

  return { user, role: profile?.role ?? null };
}

export async function hasPartnershipAccess(
  env: NCBEnv,
  auth: CRMAuth,
  partnershipId: string | number,
): Promise<boolean> {
  if (auth.role === 'admin' || auth.role === 'team_member') return true;
  if (auth.role !== 'customer') return false;

  const accessRows = await openApiRead(env, 'customer_access');
  return accessRows.some((row) =>
    String(row.user_id) === String(auth.user.id) &&
    String(row.partnership_id) === String(partnershipId),
  );
}

export function unauthorizedStatus(auth: CRMAuth | null, adminOnly = false): 401 | 403 | null {
  if (!auth) return 401;
  if (adminOnly && auth.role !== 'admin') return 403;
  return null;
}
