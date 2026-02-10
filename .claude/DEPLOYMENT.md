# Cloudflare Deployment Guide - Landing Page

## Multi-App Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    KREATION PLATFORM                            │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   kre8tion.com (Landing Page)      app.kre8tion.com (CRM)      │
│   ├── ai-smb-partners/             ├── ai_smb_crm_frontend/    │
│   ├── Project: kre8tion-app        ├── Project: ai-smb-crm     │
│   ├── Voice Agent                  ├── Dashboard               │
│   ├── ROI Calculator               ├── Pipeline                │
│   └── Lead Capture ────────────────└── Lead Management         │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

## Project Information

| Setting | Value |
|---------|-------|
| **GitHub Repo** | `elev8tion/aismb` |
| **Cloudflare Project** | `kre8tion-app` |
| **Production URL** | https://kre8tion.com |
| **Pages URL** | https://kre8tion-app.pages.dev |
| **Related CRM** | https://app.kre8tion.com (ai-smb-crm project) |

---

## Deployment Method

### Primary: GitHub Actions Auto-Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and deploys automatically.

```
Push to main → GitHub Actions → npm install → build → deploy to Cloudflare Pages
```

**Check deploy status:**
```bash
gh run list --limit 3
```

**IMPORTANT:**
- The workflow uses `npm install --legacy-peer-deps` — do NOT use `npm ci` (workerd binary mismatch breaks it)
- Secrets are managed in GitHub repo settings (Settings → Secrets and variables → Actions)

### Fallback: Manual CLI Deploy

If you need to deploy manually (e.g., GH Actions is down):

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Build for Cloudflare
npm run pages:build

# 3. Deploy to kre8tion-app
npx wrangler pages deploy .vercel/output/static --project-name=kre8tion-app --commit-dirty=true
```

**Note:** The build uses `@cloudflare/next-on-pages` which internally calls Vercel's build tooling to create the output format. This does NOT deploy to Vercel - it's just the build standard. Your site is 100% hosted on Cloudflare Pages.

---

## KV Namespaces

These are already configured in `wrangler.toml`:

| Binding | ID | Purpose |
|---------|-----|---------|
| `VOICE_SESSIONS` | `2afab9ebf67e4d12874cdaa464079816` | Conversation memory |
| `RATE_LIMIT_KV` | `3da863a3e1854b8f84c0066a37b6c847` | API rate limiting |
| `COST_MONITOR_KV` | `091326b587024f5d9ff870616992706e` | Cost tracking |
| `RESPONSE_CACHE_KV` | `88589fbf9e604e5f8564fb82849909bd` | Response caching |

---

## Environment Variables

Required in both GitHub Actions secrets AND Cloudflare dashboard (Settings → Environment Variables):

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Voice agent API calls |
| `NCB_INSTANCE` | NCB database instance (`36905_ai_smb_crm`) |
| `NCB_DATA_API_URL` | NCB Data Proxy API base URL |
| `NCB_AUTH_API_URL` | NCB Auth API base URL |
| `NCB_OPENAPI_URL` | NCB OpenAPI base URL (server-to-server) |
| `NCB_SECRET_KEY` | NCB OpenAPI Bearer token |
| `EMAILIT_API_KEY` | EmailIt email sending API key |
| `ADMIN_EMAIL` | Admin notification recipient |

GitHub Actions also requires:
- `CLOUDFLARE_API_TOKEN` — Wrangler deploy authentication
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account identifier

**Edge runtime note:** `process.env` does NOT work on Cloudflare Pages. Use `getRequestContext().env` in API routes. Library files that aren't routes can't call `getRequestContext()` — pass `env` as a parameter instead.

---

## Common Issues

### "icon.png not configured for edge runtime"
Move `app/icon.png` to `public/icon.png`:
```bash
mv app/icon.png public/icon.png
```

### "Invalid target es2024"
This is a wrangler/esbuild version issue. The GH Actions workflow pins `wranglerVersion: '3.80.0'` to avoid this.

### Build succeeds but deploy fails
Check that KV bindings are also configured in Cloudflare dashboard, not just wrangler.toml.

### `npm ci` fails with workerd mismatch
Use `npm install --legacy-peer-deps` instead. This is a known issue with the workerd binary.

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for Cloudflare
npm run pages:build

# Deploy manually (fallback only — prefer pushing to main)
npx wrangler pages deploy .vercel/output/static --project-name=kre8tion-app --commit-dirty=true

# Check GH Actions deploy status
gh run list --limit 3

# List Cloudflare projects
npx wrangler pages project list

# View deployment logs
npx wrangler pages deployment tail --project-name=kre8tion-app
```

---

## Dashboard Links

- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Pages Project:** Workers & Pages → kre8tion-app
- **GitHub Repo:** https://github.com/elev8tion/aismb

---

## CRM Integration

The CRM is deployed separately at `app.kre8tion.com`:

| Setting | Value |
|---------|-------|
| **CRM URL** | https://app.kre8tion.com |
| **CRM Project** | `ai-smb-crm` |
| **Database** | NoCodeBackend `36905_ai_smb_crm` |
| **Local Path** | `/Users/kcdacre8tor/ai_smb_crm_frontend` |

### Data Flow: Landing Page → CRM

The landing page syncs lead data to the CRM **directly via the NCB OpenAPI** (not via CRM webhooks). The sync logic lives in `lib/voiceAgent/leadManager.ts`.

```
Voice Agent Session ──┐
                      │
ROI Calculator   ─────┼──▶  NCB OpenAPI  ──▶  CRM Database  ──▶  CRM Dashboard
                      │     (direct)          (36905_ai_smb_crm)  (app.kre8tion.com)
Calendar Booking ─────┘
```

**Example:** `app/api/leads/roi/route.ts` calls `syncROICalcToCRM()` which writes directly to NCB OpenAPI using `getRequestContext().env` for credentials.

### Existing Webhook Endpoints (Landing Page)

| Endpoint | Source | Purpose |
|----------|--------|---------|
| `POST /api/webhooks/stripe` | Stripe | Payment event handling |
| `POST /api/webhooks/emailit` | EmailIt | Email delivery status callbacks |

### CRM Development

See `/Users/kcdacre8tor/ai_smb_crm_frontend/DEPLOYMENT.md` for CRM deployment guide.

---

## NoCodeBackend API Reference

### CRITICAL: Two Different APIs with Different `instance` Casing

NCB has two APIs. They use **different casing** for the instance parameter:

| API | Base URL | Instance Param | Auth | Use For |
|-----|----------|---------------|------|---------|
| **OpenAPI** | `https://openapi.nocodebackend.com` | `?Instance=` (capital I) | `Authorization: Bearer ${NCB_SECRET_KEY}` | Server-to-server, guest writes (bookings, lead sync) |
| **Data Proxy** | `https://app.nocodebackend.com/api/data` | `?instance=` (lowercase i) | Session cookies | Authenticated user CRUD with RLS |

```bash
# OpenAPI — capital I
https://openapi.nocodebackend.com/create/leads?Instance=36905_ai_smb_crm

# Data Proxy — lowercase i
https://app.nocodebackend.com/api/data/read/leads?instance=36905_ai_smb_crm
```

### Auth API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user-auth/providers?instance=...` | GET | List enabled auth providers |
| `/api/user-auth/sign-up/email?instance=...` | POST | Create new user |
| `/api/user-auth/sign-in/email?instance=...` | POST | Sign in user |
| `/api/user-auth/get-session?instance=...` | GET | Get current session |
| `/api/user-auth/sign-out?instance=...` | POST | Sign out user |

### Data Proxy Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/data/read/<table>?instance=...` | GET | Read records |
| `/api/data/create/<table>?instance=...` | POST | Create record |

### Enable Auth Providers

Before users can authenticate, enable the credential provider:

```sql
-- Via NCB MCP server
INSERT INTO ncba_config (id, provider, enabled, created_at, updated_at)
VALUES (UUID(), 'credential', 1, NOW(), NOW());
```

### Creating Users (Correct Way)

**NEVER manually insert into ncba_user/ncba_account tables.**

Use the sign-up API:

```bash
curl -X POST "https://app.nocodebackend.com/api/user-auth/sign-up/email?instance=36905_ai_smb_crm" \
  -H "Content-Type: application/json" \
  -H "X-Database-Instance: 36905_ai_smb_crm" \
  -d '{"name":"User Name","email":"user@email.com","password":"Password123"}'
```

### Debugging NCB Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing instance parameter" | Wrong casing for the API you're calling | OpenAPI uses capital `Instance`, Data Proxy uses lowercase `instance` |
| 500 on sign-up/sign-in | Auth provider not enabled | Insert into `ncba_config` |
| Empty response | Missing env vars | Check Cloudflare Production env vars |
| "Unexpected end of JSON" | API returning empty body | Check env vars and instance name |
