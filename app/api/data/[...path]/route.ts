/**
 * Data Proxy Route - Landing Page to CRM Pipeline
 *
 * PURPOSE: Pipeline User Transition
 * This route enables authenticated data access from the landing page (kre8tion.com)
 * to the shared CRM database. Users who have authenticated can access their data
 * (leads, ROI calculations, voice sessions) from the landing page before fully
 * transitioning to the CRM dashboard.
 *
 * Use Cases:
 * - Display user's previous ROI calculations
 * - Show voice agent conversation history
 * - Pre-fill forms with existing lead data
 * - Allow users to view their appointment history
 *
 * CRITICAL: NCB requires lowercase 'instance' parameter, NOT 'Instance'
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

function getConfig() {
  const instance = process.env.NCB_INSTANCE;
  const dataApiUrl = process.env.NCB_DATA_API_URL;
  const authApiUrl = process.env.NCB_AUTH_API_URL;

  if (!instance || !dataApiUrl || !authApiUrl) {
    throw new Error(`Missing environment variables: NCB_INSTANCE=${instance ? 'set' : 'MISSING'}, NCB_DATA_API_URL=${dataApiUrl ? 'set' : 'MISSING'}, NCB_AUTH_API_URL=${authApiUrl ? 'set' : 'MISSING'}`);
  }

  return { instance, dataApiUrl, authApiUrl };
}

function extractAuthCookies(cookieHeader: string): string {
  if (!cookieHeader) return "";

  const cookies = cookieHeader.split(";");
  const authCookies: string[] = [];

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (
      trimmed.startsWith("better-auth.session_token=") ||
      trimmed.startsWith("better-auth.session_data=")
    ) {
      authCookies.push(trimmed);
    }
  }

  return authCookies.join("; ");
}

async function getSessionUser(
  cookieHeader: string
): Promise<{ id: string } | null> {
  const config = getConfig();
  const authCookies = extractAuthCookies(cookieHeader);
  if (!authCookies) return null;

  const url = `${config.authApiUrl}/get-session?instance=${config.instance}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Database-Instance": config.instance,
      Cookie: authCookies,
    },
  });

  if (res.ok) {
    const data: { user?: { id: string } } = await res.json();
    return data.user || null;
  }
  return null;
}

async function proxyToNCB(req: NextRequest, path: string, body?: string) {
  const config = getConfig();
  const searchParams = new URLSearchParams();
  searchParams.set("instance", config.instance);

  req.nextUrl.searchParams.forEach((val, key) => {
    if (key !== "instance") searchParams.append(key, val);
  });

  const url = `${config.dataApiUrl}/${path}?${searchParams.toString()}`;
  const origin = req.headers.get("origin") || req.nextUrl.origin;

  const cookieHeader = req.headers.get("cookie") || "";
  const authCookies = extractAuthCookies(cookieHeader);

  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      "X-Database-Instance": config.instance,
      Cookie: authCookies,
      Origin: origin,
    },
    body: body || undefined,
  });

  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const cookieHeader = req.headers.get("cookie") || "";

    const user = await getSessionUser(cookieHeader);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return proxyToNCB(req, path.join("/"));
  } catch (error) {
    console.error('Data GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathStr = path.join("/");
    const body = await req.text();
    const cookieHeader = req.headers.get("cookie") || "";

    const user = await getSessionUser(cookieHeader);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (pathStr.startsWith("create/") && body) {
      try {
        const parsed = JSON.parse(body);
        delete parsed.user_id;
        parsed.user_id = user.id;
        return proxyToNCB(req, pathStr, JSON.stringify(parsed));
      } catch {
        // Continue without modification
      }
    }

    return proxyToNCB(req, pathStr, body);
  } catch (error) {
    console.error('Data POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const body = await req.text();
    const cookieHeader = req.headers.get("cookie") || "";

    const user = await getSessionUser(cookieHeader);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (body) {
      try {
        const parsed = JSON.parse(body);
        delete parsed.user_id;
        return proxyToNCB(req, path.join("/"), JSON.stringify(parsed));
      } catch {
        // Continue without modification
      }
    }

    return proxyToNCB(req, path.join("/"), body);
  } catch (error) {
    console.error('Data PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const cookieHeader = req.headers.get("cookie") || "";

    const user = await getSessionUser(cookieHeader);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return proxyToNCB(req, path.join("/"));
  } catch (error) {
    console.error('Data DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
