# NCB Reference — AI KRE8TION Partners

This folder contains authoritative NCB documentation retrieved via the NCB MCP server.
Always consult these files before making NCB-related changes.

## Files

| File | Description |
|------|-------------|
| `integration-guide.md` | Master guide — env vars, auth flow, cookie handling, data API |
| `auth-proxy-setup.md` | Auth proxy route setup, cookie transform, sign-in/out patterns |
| `data-proxy-setup.md` | Data proxy route setup, RLS, CRUD endpoints, frontend usage |
| `schema.json` | Full database schema — all tables, columns, types, FKs, RLS flags |
| `rls-config.md` | Row-Level Security config — which tables are public vs auth-required |

## Key Facts

- **Instance**: `36905_ai_smb_crm`
- **Data API**: `https://app.nocodebackend.com/api/data`
- **Auth API**: `https://app.nocodebackend.com/api/user-auth`
- **Auth method**: Session cookies (`better-auth.session_token`)
- **Public tables**: `bookings` (via `ncba_rls_config`)
- **Cloudflare Pages**: Use `getRequestContext().env`, NOT `process.env`
