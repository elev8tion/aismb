# NCB Reference — AI KRE8TION Partners

This folder contains authoritative NCB documentation retrieved via the NCB MCP server.
Always consult these files before making NCB-related changes.

## Files

| File | Description |
|------|-------------|
| `integration-guide.md` | Master guide — env vars, two APIs, auth flow, cookie handling |
| `openapi-guide.md` | OpenAPI (server-to-server) — Bearer auth, endpoints, response formats |
| `auth-proxy-setup.md` | Auth proxy route setup, cookie transform, sign-in/out patterns |
| `data-proxy-setup.md` | Data proxy route setup, RLS, CRUD endpoints, frontend usage |
| `schema.json` | Full database schema — all tables, columns, types, FKs, RLS flags |
| `rls-config.md` | Row-Level Security config — which tables are public vs auth-required |

## Two NCB APIs — When to Use Which

| | OpenAPI (server-to-server) | Data Proxy (authenticated users) |
|---|---|---|
| **URL** | `https://openapi.nocodebackend.com` | `https://app.nocodebackend.com/api/data` |
| **Auth** | `Authorization: Bearer ${NCB_SECRET_KEY}` | Session cookies (`better-auth.session_token`) |
| **Instance param** | `?Instance=...` (capital `I`) | `?instance=...` (lowercase `i`) |
| **Use for** | Guest/public writes (bookings), server-side operations | Authenticated user CRUD with RLS |
| **Env vars** | `NCB_OPENAPI_URL`, `NCB_SECRET_KEY` | `NCB_DATA_API_URL`, `NCB_INSTANCE` |
| **Create response** | `{"status":"success","id":N}` | `{"data":{...}}` |
| **Read response** | `{"status":"success","data":[...],"metadata":{...}}` | `{"data":[...]}` |

## Key Facts

- **Instance**: `36905_ai_smb_crm`
- **OpenAPI**: `https://openapi.nocodebackend.com` — Bearer token auth
- **Data API**: `https://app.nocodebackend.com/api/data` — session cookie auth
- **Auth API**: `https://app.nocodebackend.com/api/user-auth`
- **Public tables**: `bookings` (via `ncba_rls_config`)
- **Cloudflare Pages**: Use `getRequestContext().env`, NOT `process.env`
- **MCP token** (`ncb_` prefix): For MCP tools ONLY, not for OpenAPI Bearer auth
- **Secret key** (from NCB Dashboard → Settings): For OpenAPI Bearer auth
- **Nullable columns**: Use `string | null` in TypeScript, not `string | undefined`
- **Don't send `created_at`**: Let DB `current_timestamp()` default handle it
