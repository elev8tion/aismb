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

## Environment Variables (SERVER-ONLY)

These variables MUST exist in `.env.local`
They MUST NEVER be exposed to the browser.

```env
NCB_INSTANCE=<instance_name>
NCB_AUTH_API_URL=https://app.nocodebackend.com/api/user-auth
NCB_DATA_API_URL=https://app.nocodebackend.com/api/data
```

**Rules**
- ALWAYS read from `process.env`
- NEVER hardcode
- NEVER use `NEXT_PUBLIC_*`

---

## Authentication: Session Cookies

NCB uses session cookies for authentication. The cookies are:
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

## Auth Proxy (REQUIRED)

**Path:** `app/api/auth/[...path]/route.ts`

### Responsibilities
- Proxy requests to `NCB_AUTH_API_URL`
- Transform cookies for localhost compatibility
- Handle sign-out gracefully

### Required Headers

When proxying to NCB Data API:
```typescript
headers: {
  "Content-Type": "application/json",
  "X-Database-Instance": CONFIG.instance,
  "Cookie": authCookies,
  "Origin": origin,
}
```

---

## RLS (Row-Level Security)

- Controlled via `ncba_rls_config` table
- Tables with `user_id` column get RLS by default
- Tables WITHOUT `user_id` (like `bookings`) need `policy: 'public'` in `ncba_rls_config` to allow unauthenticated writes
- Setting: `INSERT INTO ncba_rls_config (table_name, policy) VALUES ('tablename', 'public');`

---

## Data API Endpoints

Base URL: `https://app.nocodebackend.com/api/data`

- **Create**: `POST /create/{table}?instance={instance}`
- **Read**: `GET /read/{table}?instance={instance}`
- **Read by ID**: `GET /read/{table}/{id}?instance={instance}`
- **Search**: `GET /search/{table}?instance={instance}`
- **Update**: `PUT /update/{table}/{id}?instance={instance}`
- **Delete**: `DELETE /delete/{table}/{id}?instance={instance}`

### Auth API Endpoints

Base URL: `https://app.nocodebackend.com/api/user-auth`

- **Get Session**: `GET /get-session?instance={instance}`
- **Sign In**: `POST /sign-in/email?instance={instance}`
- **Sign Up**: `POST /sign-up/email?instance={instance}`
- **Sign Out**: `POST /sign-out?instance={instance}`
- **Providers**: `GET /providers?instance={instance}`

---

## Swagger Auth

The swagger shows `bearerAuth` (JWT) as a security scheme. This is used for server-to-server API calls.

---

## Common Failures

- Calling `api.nocodebackend.com` from frontend
- Skipping auth proxy
- Missing `instance` param
- Missing `credentials: "include"` in frontend fetch calls
- Letting client control `user_id`
- Not stripping `__Secure-` prefix when SETTING cookies
- Writing to tables that need auth without session cookies or public RLS policy
