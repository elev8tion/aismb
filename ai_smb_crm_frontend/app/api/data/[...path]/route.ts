import { NextRequest, NextResponse } from "next/server";
import { getOptionalRequestContext } from "@cloudflare/next-on-pages";
import { checkRateLimit, getClientIP } from '@/lib/security/rateLimiter.kv';
import { extractAuthCookies, getSessionUser, type NCBEnv } from "@/lib/agent/ncbClient";
import { isDemoUser } from "@/lib/demo/session";
import { demoReadOnlyResponse, demoReadResponse } from "@/lib/demo/data";

export const runtime = 'edge';

// User-scoped tables. Access is restricted by operation below; these are not public.
const USER_PROFILE_TABLE = 'user_profiles';
const CUSTOMER_ACCESS_TABLE = 'customer_access';

// Tables customers can READ (not write). Customer IDs are checked against
// customer_access before the request is sent through the secret-key path.
const CUSTOMER_TABLES = new Set([
  'partnerships',
  'delivered_systems',
  'companies',
]);

// Internal team members can work CRM records but cannot delete or alter access/settings.
const TEAM_MEMBER_TABLES = new Set([
  'leads',
  'contacts',
  'companies',
  'opportunities',
  'partnerships',
  'drafts',
  'voice_sessions',
  'roi_calculations',
  'activities',
  'bookings',
]);

// Tables without a user_id column — NCB Data Proxy can't filter by user,
// so we must use Bearer auth (secret key) to read them.
const NO_USER_ID_TABLES = new Set([
  'bookings',
  'availability_settings',
  'blocked_dates',
]);

interface DataProxyConfig {
  instance: string;
  dataApiUrl: string;
  openApiUrl: string;
  authApiUrl: string;
  secretKey: string;
}

function buildConfig(env: NCBEnv): DataProxyConfig {
  return {
    instance: env.NCB_INSTANCE,
    dataApiUrl: env.NCB_DATA_API_URL,
    openApiUrl: env.NCB_OPENAPI_URL || 'https://openapi.nocodebackend.com',
    authApiUrl: env.NCB_AUTH_API_URL,
    secretKey: env.NCB_SECRET_KEY || '',
  };
}

async function getUserRole(config: DataProxyConfig, userId: string): Promise<string | null> {
  if (!userId || !config.secretKey) return null;

  // Use OpenAPI + Bearer token — no session cookie dependency, always works.
  const url = `${config.openApiUrl}/read/user_profiles?Instance=${config.instance}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.secretKey}`,
    },
  });

  if (res.ok) {
    const data: any = await res.json();
    if (data.data && Array.isArray(data.data)) {
      const profile = data.data.find((p: any) => String(p.user_id) === String(userId));
      return profile?.role ?? null;
    }
  }
  return null;
}

function extractTableName(path: string): string | null {
  // path format: "read/leads", "create/leads", "update/leads/123", "delete/leads/123"
  const parts = path.split('/');
  if (parts.length >= 2) {
    return parts[1];
  }
  return null;
}

function extractOperation(path: string): string {
  return path.split('/')[0] || '';
}

function demoDataResponse(pathStr: string) {
  if (extractOperation(pathStr) !== 'read') {
    return NextResponse.json(demoReadOnlyResponse(), { status: 403 });
  }
  return NextResponse.json(demoReadResponse(extractTableName(pathStr)), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

function demoReadOnly() {
  return NextResponse.json(demoReadOnlyResponse(), { status: 403 });
}

function isAuthorized(table: string | null, role: string | null, operation: string): boolean {
  if (!table) return false;
  if (role === 'admin') return true;
  if (role === 'team_member' && table && TEAM_MEMBER_TABLES.has(table)) {
    return operation !== 'delete';
  }

  // Profiles are created on first login and edited only by their owner.
  if (table === USER_PROFILE_TABLE) {
    return ['read', 'create', 'update'].includes(operation);
  }

  // Customers may inspect their own access records, but cannot grant or revoke access.
  if (table === CUSTOMER_ACCESS_TABLE) {
    return operation === 'read';
  }

  // Customers may only read their own bookings, enforced by customerScopeAllowed.
  if (table === 'bookings') {
    return operation === 'read';
  }

  // Customer-owned CRM data is read-only and scoped by customer_access.
  if (CUSTOMER_TABLES.has(table)) {
    return role === 'customer' && operation === 'read';
  }

  // Availability and all other tables are admin-only.
  return false;
}

async function readOpenApiRows(
  config: DataProxyConfig,
  table: string,
  params: Record<string, string> = {},
): Promise<any[]> {
  if (!config.secretKey) return [];

  const url = new URL(`${config.openApiUrl}/read/${table}`);
  url.searchParams.set('Instance', config.instance);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.secretKey}`,
    },
  });
  if (!res.ok) return [];

  const data: any = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

async function customerScopeAllowed(
  config: DataProxyConfig,
  table: string | null,
  operation: string,
  searchParams: URLSearchParams,
  user: { id: string; email: string },
): Promise<boolean> {
  if (!table || operation !== 'read') return false;

  if (table === 'bookings') {
    return searchParams.get('guest_email')?.toLowerCase() === user.email.toLowerCase();
  }

  if (table === CUSTOMER_ACCESS_TABLE) {
    return searchParams.get('user_id') === user.id;
  }

  if (!CUSTOMER_TABLES.has(table)) return true;

  const accessRows = await readOpenApiRows(config, CUSTOMER_ACCESS_TABLE);
  const partnershipIds = new Set(
    accessRows
      .filter((row) => String(row.user_id) === String(user.id))
      .map((row) => String(row.partnership_id)),
  );
  if (partnershipIds.size === 0) return false;

  const requestedIds = (key: string) => (searchParams.get(key) || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (table === 'partnerships') {
    const ids = [...requestedIds('id'), ...requestedIds('id__in')];
    return ids.length > 0 && ids.every((id) => partnershipIds.has(id));
  }

  if (table === 'delivered_systems') {
    const ids = [...requestedIds('partnership_id'), ...requestedIds('partnership_id__in')];
    return ids.length > 0 && ids.every((id) => partnershipIds.has(id));
  }

  const partnerships = await readOpenApiRows(config, 'partnerships', {
    id__in: [...partnershipIds].join(','),
  });
  const companyIds = new Set(partnerships.map((row) => String(row.company_id)));
  const ids = [...requestedIds('id'), ...requestedIds('id__in')];
  return ids.length > 0 && ids.every((id) => companyIds.has(id));
}

async function profileMutationAllowed(
  config: DataProxyConfig,
  path: string,
  req: NextRequest,
  role: string | null,
  user: { id: string },
): Promise<boolean> {
  if (role === 'admin' || !path.startsWith(`update/${USER_PROFILE_TABLE}`)) return true;

  const profileId = path.split('/')[2] || req.nextUrl.searchParams.get('id');
  if (!profileId) return false;

  const profiles = await readOpenApiRows(config, USER_PROFILE_TABLE);
  return profiles.some((profile) =>
    String(profile.id) === String(profileId) && String(profile.user_id) === String(user.id),
  );
}

function forbidden() {
  return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

async function rateLimit(req: NextRequest, env: Record<string, unknown>): Promise<NextResponse | null> {
  const kv = env.RATE_LIMIT_KV as KVNamespace | undefined;
  if (!kv) return null;
  const ip = getClientIP(req);
  const result = await checkRateLimit(kv, `data:${ip}`);
  if (!result.allowed) {
    return new NextResponse(JSON.stringify({ error: result.reason || 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter),
      },
    });
  }
  return null;
}

async function proxyToNCB(config: DataProxyConfig, req: NextRequest, path: string, body?: string, bypassRLS = false) {
  // Accept legacy ?id= callers during migration, but forward the canonical NCB path.
  const parts = path.split('/');
  const legacyId = parts.length === 2 &&
    (parts[0] === 'update' || parts[0] === 'delete')
    ? req.nextUrl.searchParams.get('id')
    : null;
  const targetPath = legacyId ? `${path}/${encodeURIComponent(legacyId)}` : path;

  const searchParams = new URLSearchParams();
  searchParams.set("Instance", config.instance);

  req.nextUrl.searchParams.forEach((val, key) => {
    if (key !== "Instance" && key !== "instance" && key !== "path" && !(legacyId && key === 'id')) {
      searchParams.append(key, val);
    }
  });

  // bypassRLS: use OpenAPI endpoint (Bearer token, no RLS) so guest records are visible.
  // Data Proxy endpoint only understands cookie auth — Bearer token there does nothing.
  const baseUrl = bypassRLS ? config.openApiUrl : config.dataApiUrl;
  const url = `${baseUrl}/${targetPath}?${searchParams.toString()}`;
  const origin = req.headers.get("origin") || req.nextUrl.origin;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Database-Instance": config.instance,
    Origin: origin,
  };

  if (bypassRLS && config.secretKey) {
    headers["Authorization"] = `Bearer ${config.secretKey}`;
  } else {
    const cookieHeader = req.headers.get("cookie") || "";
    headers["Cookie"] = extractAuthCookies(cookieHeader);
  }

  const res = await fetch(url, {
    method: req.method,
    headers,
    body: body || undefined,
  });

  // NCB returns 404 for empty result sets on reads. Normalize to 200 with empty data
  // so the browser doesn't log "Failed to load resource" console errors.
  if (res.status === 404 && targetPath.startsWith("read/")) {
    return new NextResponse(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.text();

  const isRead = targetPath.startsWith("read/");
  return new NextResponse(data, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      ...(isRead && { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" }),
      ...(!isRead && { "Cache-Control": "no-store" }),
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const ctx = getOptionalRequestContext();
  const cfEnv = (ctx?.env || process.env) as any;
  const env = cfEnv as unknown as NCBEnv;
  const config = buildConfig(env);

  const limited = await rateLimit(req, cfEnv as unknown as Record<string, unknown>);
  if (limited) return limited;

  const { path } = await params;
  const pathStr = path.join("/");
  const cookieHeader = req.headers.get("cookie") || "";

  const user = await getSessionUser(env, cookieHeader);
  if (isDemoUser(user)) {
    return demoDataResponse(pathStr);
  }
  const role = user ? await getUserRole(config, user.id) : null;

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const table = extractTableName(pathStr);
  const operation = extractOperation(pathStr);
  if (!isAuthorized(table, role, operation)) {
    return forbidden();
  }

  if (role === 'customer' && !(await customerScopeAllowed(
    config,
    table,
    operation,
    req.nextUrl.searchParams,
    user,
  ))) {
    return forbidden();
  }

  // Bypass RLS for: (1) admins — use Bearer token so all records are visible regardless
  // of which user_id wrote them (landing page writes with NCB_DEFAULT_USER_ID, CRM
  // admin reads need to see everything), (2) customer reads on CUSTOMER_TABLES (admin-owned
  // data), (3) tables without user_id column (NCB can't filter by user, needs Bearer auth)
  const bypassRLS = !!table && (
    role === 'admin' ||
    (role === 'customer' && CUSTOMER_TABLES.has(table)) ||
    NO_USER_ID_TABLES.has(table)
  );
  return proxyToNCB(config, req, pathStr, undefined, bypassRLS);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const ctx = getOptionalRequestContext();
  const cfEnv = (ctx?.env || process.env) as any;
  const env = cfEnv as unknown as NCBEnv;
  const config = buildConfig(env);

  const limited = await rateLimit(req, cfEnv as unknown as Record<string, unknown>);
  if (limited) return limited;

  const { path } = await params;
  const pathStr = path.join("/");
  const body = await req.text();
  const cookieHeader = req.headers.get("cookie") || "";

  const user = await getSessionUser(env, cookieHeader);
  if (isDemoUser(user)) {
    return demoReadOnly();
  }
  const role = user ? await getUserRole(config, user.id) : null;

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const table = extractTableName(pathStr);
  const operation = extractOperation(pathStr);
  if (!isAuthorized(table, role, operation)) {
    return forbidden();
  }

  if (!(await profileMutationAllowed(config, pathStr, req, role, user))) {
    return forbidden();
  }

  if (pathStr.startsWith("create/") && body) {
    try {
      const parsed = JSON.parse(body);
      delete parsed.user_id;
      parsed.user_id = user.id;
      return proxyToNCB(config, req, pathStr, JSON.stringify(parsed));
    } catch {
      // Continue without modification
    }
  }

  return proxyToNCB(config, req, pathStr, body);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const ctx = getOptionalRequestContext();
  const cfEnv = (ctx?.env || process.env) as any;
  const env = cfEnv as unknown as NCBEnv;
  const config = buildConfig(env);

  const limited = await rateLimit(req, cfEnv as unknown as Record<string, unknown>);
  if (limited) return limited;

  const { path } = await params;
  const pathStr = path.join("/");
  const body = await req.text();
  const cookieHeader = req.headers.get("cookie") || "";

  const user = await getSessionUser(env, cookieHeader);
  if (isDemoUser(user)) {
    return demoReadOnly();
  }
  const role = user ? await getUserRole(config, user.id) : null;

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const table = extractTableName(pathStr);
  const operation = extractOperation(pathStr);
  if (!isAuthorized(table, role, operation)) {
    return forbidden();
  }

  if (!(await profileMutationAllowed(config, pathStr, req, role, user))) {
    return forbidden();
  }

  if (body) {
    try {
      const parsed = JSON.parse(body);
      delete parsed.user_id;
      return proxyToNCB(config, req, pathStr, JSON.stringify(parsed));
    } catch {
      // Continue without modification
    }
  }

  return proxyToNCB(config, req, pathStr, body);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const ctx = getOptionalRequestContext();
  const cfEnv = (ctx?.env || process.env) as any;
  const env = cfEnv as unknown as NCBEnv;
  const config = buildConfig(env);

  const limited = await rateLimit(req, cfEnv as unknown as Record<string, unknown>);
  if (limited) return limited;

  const { path } = await params;
  const pathStr = path.join("/");
  const cookieHeader = req.headers.get("cookie") || "";

  const user = await getSessionUser(env, cookieHeader);
  if (isDemoUser(user)) {
    return demoReadOnly();
  }
  const role = user ? await getUserRole(config, user.id) : null;

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const table = extractTableName(pathStr);
  const operation = extractOperation(pathStr);
  if (!isAuthorized(table, role, operation)) {
    return forbidden();
  }

  return proxyToNCB(config, req, pathStr);
}
