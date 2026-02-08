# NoCodeBackend MCP Integration Guide

When the user asks to build an app using **NoCodeBackend (NCB)**, follow this guide EXACTLY.

---

## GOLDEN PATH (MANDATORY WORKFLOW)

1. **Create Database**
   - Use the `create_database` MCP tool.

2. **Fetch Integration Prompts**
   - IMMEDIATELY call `get_integration_prompts`.
   - Save the prompts as two files in your project root:
     - `auth_proxy_setup.md` - Authentication setup
     - `data_proxy_setup.md` - Data proxy and CRUD setup

---

## Two APIs — Choose the Right One

NCB has **two separate API endpoints** for different use cases:

### 1. OpenAPI (server-to-server, guest/public writes)
- **URL**: `https://openapi.nocodebackend.com`
- **Auth**: `Authorization: Bearer ${NCB_SECRET_KEY}`
- **Instance param**: `?Instance=36905_ai_smb_crm` (**capital `I`**)
- **Use for**: Booking routes, any unauthenticated/guest writes, server-side operations
- **Secret key**: From NCB Dashboard → Settings (NOT the `ncb_` prefixed MCP token)
- See `openapi-guide.md` for full details

### 2. Data Proxy API (authenticated user CRUD with RLS)
- **URL**: `https://app.nocodebackend.com/api/data`
- **Auth**: Session cookies (`better-auth.session_token`)
- **Instance param**: `?instance=36905_ai_smb_crm` (**lowercase `i`**)
- **Use for**: CRM data proxy, authenticated user operations
- See `data-proxy-setup.md` for full details

### 3. Auth API
- **URL**: `https://app.nocodebackend.com/api/user-auth`
- **Use for**: Sign-in, sign-up, session management
- See `auth-proxy-setup.md` for full details

---

## Environment Variables (SERVER-ONLY)

These variables MUST exist in `.env.local`
They MUST NEVER be exposed to the browser.

```env
NCB_INSTANCE=36905_ai_smb_crm
NCB_AUTH_API_URL=https://app.nocodebackend.com/api/user-auth
NCB_DATA_API_URL=https://app.nocodebackend.com/api/data
NCB_OPENAPI_URL=https://openapi.nocodebackend.com
NCB_SECRET_KEY=<from NCB Dashboard → Settings>
```

**Rules**
- On Cloudflare Pages: use `getRequestContext().env` (NOT `process.env`)
- Library files can't call `getRequestContext()` — pass `env` as parameter
- NEVER hardcode
- NEVER use `NEXT_PUBLIC_*`

---

## Authentication: Session Cookies (Data Proxy only)

NCB uses session cookies for authenticated user operations. The cookies are:
- `better-auth.session_token` - The session token
- `better-auth.session_data` - The session data

**NCB accepts cookies in BOTH formats:**
- `better-auth.session_token` (without prefix)
- `__Secure-better-auth.session_token` (with prefix)

NCB dynamically finds any cookie ending with `better-auth.session_token`.

### Cookie Flow

1. **User logs in** → NCB returns cookies with `__Secure-` prefix
2. **Auth proxy transforms** → Strips prefix for localhost compatibility
3. **Browser stores** → Cookies as `better-auth.*` (no prefix)
4. **Forwarding to NCB** → Forward cookies (either format works)
5. **NCB validates** → Authenticates user and enforces RLS

---

## RLS (Row-Level Security)

- Controlled via `ncba_rls_config` table
- Tables with `user_id` column get RLS by default
- Tables WITHOUT `user_id` (like `bookings`) need `policy: 'public'` in `ncba_rls_config`
- Setting: `INSERT INTO ncba_rls_config (table_name, policy) VALUES ('tablename', 'public');`
- **Note**: Public RLS policy works with OpenAPI Bearer auth; Data Proxy API still requires session cookies regardless

---

## TypeScript Conventions for NCB Data

- **Nullable columns**: Use `string | null` (NOT `string | undefined`) to match DB
- **Don't send `created_at`**: Let DB `current_timestamp()` default handle it
- **Empty optional fields**: Send `null`, not empty string `""`
- **OpenAPI create response**: Returns `{"status":"success","id":N}` — no `data` wrapper
- **OpenAPI read response**: Returns `{"status":"success","data":[...],"metadata":{...}}`

---

## Auth API Endpoints

Base URL: `https://app.nocodebackend.com/api/user-auth`

- **Get Session**: `GET /get-session?instance={instance}`
- **Sign In**: `POST /sign-in/email?instance={instance}`
- **Sign Up**: `POST /sign-up/email?instance={instance}`
- **Sign Out**: `POST /sign-out?instance={instance}`
- **Providers**: `GET /providers?instance={instance}`

---

## Swagger

Available via `mcp__nocodebackend__get_swagger` — returns full OpenAPI spec.
Server URL in swagger is `openapi.nocodebackend.com`.
Security scheme is `bearerAuth` (Bearer token using `NCB_SECRET_KEY`).

---

## Common Failures

- Using `process.env` on CF Pages (undefined) — use `getRequestContext().env`
- Using Data Proxy API for guest writes (requires session cookies) — use OpenAPI instead
- Using MCP token (`ncb_` prefix) as Bearer auth — use `NCB_SECRET_KEY` from dashboard
- Using lowercase `instance` with OpenAPI — OpenAPI needs capital `Instance`
- Using capital `Instance` with Data Proxy — Data Proxy needs lowercase `instance`
- Sending `created_at` with ISO format — let DB default handle it
- Sending empty strings `""` for nullable fields — send `null` instead
- Using `string | undefined` for nullable DB columns — use `string | null`
- Missing `credentials: "include"` in frontend fetch calls
- Letting client control `user_id`
- Not stripping `__Secure-` prefix when SETTING cookies
