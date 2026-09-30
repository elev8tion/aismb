# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev                     # Start local dev server
npm run build                   # Next.js build (standard)
npm run pages:build             # Build for Cloudflare Pages deployment

# Linting & Testing
npm run lint                    # ESLint
npm run test                    # Vitest watch mode
npm run test:run                # Vitest single run
npm run test:admin-booking      # Integration test: admin booking API (18 tests)

# Single test file
npx vitest run lib/booking/__tests__/availability.test.ts

# Build shared types (required if packages/shared-types changes)
cd packages/shared-types && npm run build && cd ../..

# Install (use this to bypass workerd version mismatch)
npm install --ignore-scripts
```

## Architecture

### Monorepo Structure
This is a monorepo containing both apps. The single remote is `github.com/elev8tion/aismb.git`.

```
/ (root)                        — Landing page (kre8tion.com)
ai_smb_crm_frontend/            — CRM (app.kre8tion.com)
packages/shared-types/          — Shared TypeScript/Zod types
```

```
Landing Page (kre8tion.com)
  ↓ writes via NCB OpenAPI
NoCodeBackend (36905_ai_smb_crm) — shared database
  ↑ reads via NCB Data Proxy
CRM (app.kre8tion.com)
```

Both apps share the same NCB instance — writes from the landing page appear in the CRM immediately with no sync layer.

### Edge Runtime (Cloudflare Workers)
All API routes run on Cloudflare's edge. Critical rules:
- **Never use `getRequestContext()` directly** — throws in local dev. Use `getOptionalRequestContext()` with fallback: `const ctx = getOptionalRequestContext(); const env = (ctx?.env || process.env) as any;`
- Library files (`lib/`) cannot call `getRequestContext()` — the route must pass `env` as a parameter
- No Node.js-only APIs in API routes

### KV Namespaces (wrangler.toml)
| Binding | Purpose |
|---|---|
| `VOICE_SESSIONS` | Voice agent conversation memory |
| `RATE_LIMIT_KV` | Per-IP rate limiting |
| `COST_MONITOR_KV` | OpenAI cost tracking |
| `RESPONSE_CACHE_KV` | Response caching |

### API Architecture
- **NCB OpenAPI** (`lib/ncb/client.ts`): server-to-server, Bearer token, `?Instance=36905_ai_smb_crm` (capital I)
- **NCB Data Proxy** (`app/api/data/[...path]/route.ts`): authenticated user CRUD, session cookies, `?instance=36905_ai_smb_crm` (lowercase i)
- All NCB calls go through `lib/ncb/client.ts` — use `getNCBConfig(env, 'admin')` or `getNCBConfig(env, 'guest')`

### Admin Security
- `middleware.ts` protects `/admin/*` and `/api/admin/*`
- Auth via `Authorization: Bearer ${ADMIN_API_KEY}` header or `admin-token` cookie
- Dev mode allows access when `ADMIN_API_KEY` is not set

### Monorepo / Shared Types
- `packages/shared-types/` exports `@kre8tion/shared-types`
- Contains TypeScript interfaces + 20+ Zod schemas for all data models
- Import pattern: `import { adminBookingRequestSchema, validate, formatZodErrors } from '@kre8tion/shared-types'`
- Must `npm run build` in that package after changes; symlinked via workspace config

### Booking System
- `lib/booking/availability.ts` — slot calculation (30-min intervals, Mon-Fri 9-5 default)
- `lib/booking/createBooking.ts` — pipeline: NCB write → email → calendar invite
- `components/Booking/BookingModal.tsx` — 4-step wizard UI

### Voice Agent
- `lib/voiceAgent/agents/router.ts` — intent classification
- `lib/voiceAgent/leadManager.ts` — lead scoring + CRM sync; always use `toNCBLeadPayload()` for NCB writes
- `lib/voiceAgent/sessionManager.ts` — KV-backed conversation memory

### Email
Canonical: `docs/EMAIL.md`. Do not mix the two EmailIt paths.
- **This app** sends product mail via REST (`sendViaEmailIt()` in `lib/email/sendEmail.ts`). Not SMTP. Not nodemailer.
- From: `AI KRE8TION Partners <bookings@kre8tion.com>`
- Secret: GitHub `EMAILIT_API_KEY` → Cloudflare Pages. Local CRM demo does not need it.
- **NCB** sends auth mail (signup / verify / password reset) over EmailIt SMTP from the NCB dashboard. That is not in this repo.

## NCB Leads Table Requirements
- `user_id` is a required FK — omit it and the create silently fails
- `source` must be a valid enum — use `'other'` (not `'Calendar Booking'`)
- Default `user_id`: from env var `NCB_DEFAULT_USER_ID`
- Never send `created_at` — let the DB default handle it

## Deployment

### Landing page (kre8tion.com)
- Push to `main` → GitHub Actions auto-deploys to Cloudflare Pages (`kre8tion-app`)
- **Path filter**: only fires when files outside `ai_smb_crm_frontend/` change
- Check status: `gh run list --limit 3`
- See `.claude/DEPLOYMENT.md` for required secrets

### CRM (app.kre8tion.com)
- **No auto-deploy** — manual CLI only, run from inside `ai_smb_crm_frontend/`
- `npm run pages:build && npx wrangler pages deploy .vercel/output/static --project-name=ai-smb-crm --commit-dirty=true --no-bundle`
- See `ai_smb_crm_frontend/DEPLOYMENT.md` for full details

<!-- vnodes:begin (generated — do not edit inside this block) -->
## vnodes context engine

This project is indexed by vnodes (local code-graph context engine). Prefer its
MCP tools over raw file exploration.

Every task:
1. If there is no knowledge base yet, call `create_knowledge_base` — that indexes the tree and seeds the first durable finding.
2. Call `run_pipeline` once at the start with the task.
3. Before changing a file or symbol, call `get_impact_graph` on it.
4. After a change you are keeping, `save_observation` what you learned (link the file).
5. Keep the index current with kept changes: `vnodes index`. `vnodes check` fails when `.vnodes/manifest.json` does not match the tree (older than HEAD in practice). Install `vnodes hook install` so pre-commit reindexes and stages the manifest, or run `vnodes check` in CI.

- `run_pipeline` — ONE call per task for orientation: pivot files in full, supporting skeletons, and prior-session memories with rationale, inside a token budget. Call it first, once, per task.
- `get_context_capsule` — Assemble a context capsule for a task without intent narration — same engine as run_pipeline.
- `get_impact_graph` — who depends on a file/symbol before you change it. Call this before editing a file.
- `search_logic_flow` — Shortest dependency path between two files or symbols.
- `get_skeleton` — signatures-only view instead of reading a whole file.
- `get_session_context` — Recent observations from this and previous sessions (stale ones flagged, never dropped).
- `search_memory` — recall findings from previous sessions (pass findings_only for the diary).
- `save_observation` — record a durable insight (link a file for staleness tracking).
- `forget_observation` — delete a manual finding by id when it is wrong or no longer true.
- `update_observation` — edit a manual finding by id.
- `index_status` — index health when a result looks stale or wrong.
- `create_knowledge_base` — Make this directory a knowledge base and index it. First call seeds a durable foundation finding from the graph.
- `list_knowledge_bases` — list registry ids/paths/states before forget or hide.
- `forget_knowledge_base` — remove a knowledge base from the registry by id (does not delete .vnodes).
- `hide_knowledge_base` — hide a knowledge base from the picker.
- `show_knowledge_base` — unhide a knowledge base.
- `workspace_setup` — Define a multi-repo workspace ({name|workspace_id, repos:[{alias,path}]}) and write parent pointers into secondary repos.
- `forget_workspace` — remove workspace.json and parent pointers; indexes stay.
- `forget_activity` — delete auto-captured tool-call rows; manual findings stay.

Avoid re-sending full context every turn; one pipeline orientation call per
task keeps session cost bounded.
<!-- vnodes:end -->
