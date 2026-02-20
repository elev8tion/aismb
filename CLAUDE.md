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

### Multi-App Overview
```
Landing Page (kre8tion.com) — this repo
  ↓ writes via NCB OpenAPI
NoCodeBackend (36905_ai_smb_crm) — shared database
  ↑ reads via NCB Data Proxy
CRM (app.kre8tion.com) — ai_smb_crm_frontend/ sibling directory
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
- All transactional email goes through `lib/email/sendEmail.ts` (`sendViaEmailIt()`)
- From address: `AI KRE8TION Partners <bookings@kre8tion.com>`
- Env var: `EMAILIT_API_KEY`

## NCB Leads Table Requirements
- `user_id` is a required FK — omit it and the create silently fails
- `source` must be a valid enum — use `'other'` (not `'Calendar Booking'`)
- Default `user_id`: from env var `NCB_DEFAULT_USER_ID`
- Never send `created_at` — let the DB default handle it

## Deployment
- **Landing page**: Push to `main` → GitHub Actions auto-deploys to Cloudflare Pages (`kre8tion-app`). Check with `gh run list --limit 3`.
- **CRM**: Manual deploy only — see `ai_smb_crm_frontend/DEPLOYMENT.md`
- See `.claude/DEPLOYMENT.md` for full deployment details including required secrets
