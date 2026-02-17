/**
 * Shared NCB (NoCodeBackend) OpenAPI Client
 *
 * Single source of truth for all server-side NCB API calls.
 * Accepts `env` as a parameter so it works in both:
 *   - API routes (env from getRequestContext().env)
 *   - Voice agent tools (env passed through ToolContext)
 */

export interface NCBConfig {
  instance: string;
  openApiUrl: string;
  secretKey: string;
}

export type NCBAccessLevel = 'admin' | 'guest';

/**
 * Get NCB configuration with appropriate key based on access level.
 *
 * @param env - Environment variables
 * @param accessLevel - 'admin' (full access) or 'guest' (read-only for public bookings)
 */
export function getNCBConfig(env: Record<string, string>, accessLevel: NCBAccessLevel = 'admin'): NCBConfig {
  const instance = env.NCB_INSTANCE;
  const openApiUrl = env.NCB_OPENAPI_URL;

  // Select appropriate key based on access level
  const secretKey = accessLevel === 'guest'
    ? (env.NCB_GUEST_KEY || env.NCB_SECRET_KEY) // Fallback to admin key if guest key not set
    : env.NCB_SECRET_KEY;

  if (!instance || !openApiUrl || !secretKey) {
    throw new Error('Missing NCB environment variables (NCB_INSTANCE, NCB_OPENAPI_URL, NCB_SECRET_KEY/NCB_GUEST_KEY)');
  }

  return { instance, openApiUrl, secretKey };
}

/**
 * Read records from an NCB table.
 * Returns an empty array on failure (never throws).
 */
export async function fetchFromNCB<T>(
  env: Record<string, string>,
  tableName: string,
  filters?: Record<string, string>,
): Promise<T[]> {
  const config = getNCBConfig(env);
  const params = new URLSearchParams();
  params.set('Instance', config.instance);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => params.set(key, value));
  }

  const url = `${config.openApiUrl}/read/${tableName}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.secretKey}`,
    },
  });

  if (!res.ok) {
    console.error(`NCB fetch error for ${tableName}:`, res.status);
    return [];
  }

  const data: { data?: T[] } = await res.json();
  return data.data || [];
}

/**
 * Create a record in an NCB table.
 * Returns the created record (with `id` merged in) or null on failure.
 */
export async function createInNCB<T>(
  env: Record<string, string>,
  tableName: string,
  inputData: Partial<T>,
): Promise<T | null> {
  const config = getNCBConfig(env);
  const params = new URLSearchParams();
  params.set('Instance', config.instance);

  const url = `${config.openApiUrl}/create/${tableName}?${params.toString()}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.secretKey}`,
    },
    body: JSON.stringify(inputData),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(`NCB create error for ${tableName}:`, res.status, error);
    return null;
  }

  const result: { status?: string; id?: number; data?: T } = await res.json();

  // OpenAPI returns { status: "success", id: N } — merge id into input data
  if (result.status === 'success' && result.id) {
    return { ...inputData, id: result.id } as T;
  }

  return result.data || null;
}

/**
 * Generic NCB request for arbitrary methods/paths (used by leadManager).
 * Returns parsed result or null on failure.
 */
export async function ncbRequest<T>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  env: Record<string, string>,
  body?: Record<string, unknown>,
): Promise<T | null> {
  const config = getNCBConfig(env);

  // For GET requests, append body fields as URL query params (NCB ignores GET request bodies)
  let url = `${config.openApiUrl}/${path}?Instance=${config.instance}`;
  if (method === 'GET' && body) {
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url += `&${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
      }
    });
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.secretKey}`,
      },
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`NCB API Error (${path}):`, res.status, errorText);
      return null;
    }

    const result = (await res.json()) as { data?: T };
    return (result.data || result) as T;
  } catch (error) {
    console.error(`NCB API Exception (${path}):`, error);
    return null;
  }
}
