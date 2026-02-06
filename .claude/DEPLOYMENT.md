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

### Manual CLI Deploy (Required)

```bash
# 1. Build for Cloudflare
npm run pages:build

# 2. Deploy to kre8tion-app (MUST use --no-bundle flag)
npx wrangler pages deploy .vercel/output/static --project-name=kre8tion-app --commit-dirty=true --no-bundle
```

**IMPORTANT:** The `--no-bundle` flag is required to avoid the "Invalid target es2024" error.

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

Required in Cloudflare dashboard (Settings → Environment Variables):

```
OPENAI_API_KEY=sk-...
```

---

## Common Issues

### "icon.png not configured for edge runtime"
Move `app/icon.png` to `public/icon.png`:
```bash
mv app/icon.png public/icon.png
```

### "Invalid target es2024"
This is a wrangler/esbuild version issue. Usually resolves on retry or Cloudflare auto-deploy handles it.

### Build succeeds but deploy fails
Check that KV bindings are also configured in Cloudflare dashboard, not just wrangler.toml.

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for Cloudflare
npm run pages:build

# Deploy manually
npx wrangler pages deploy .vercel/output/static --project-name=kre8tion-app --commit-dirty=true

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

```
Voice Agent Session ──┐
                      │
ROI Calculator   ─────┼──▶  CRM Database  ──▶  CRM Dashboard
                      │     (NCB)              (app.kre8tion.com)
Calendar Booking ─────┘
```

### Webhooks to Implement

These endpoints in the CRM receive data from the landing page:

| Endpoint | Trigger | Purpose |
|----------|---------|---------|
| `POST /api/webhooks/voice-agent` | Voice session ends | Sync transcript to CRM |
| `POST /api/webhooks/roi-calculator` | ROI calc submitted | Create/update lead |
| `POST /api/webhooks/calendar` | Booking created | Create activity |

### Sending Data to CRM

Example from landing page API route:

```typescript
// In landing page: app/api/leads/roi/route.ts
// After capturing lead data, sync to CRM:

await fetch('https://app.kre8tion.com/api/webhooks/roi-calculator', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.CRM_WEBHOOK_SECRET,
  },
  body: JSON.stringify({
    email,
    industry,
    employeeCount,
    calculations,
    timestamp: new Date().toISOString(),
  }),
});
```

### CRM Development

See `/Users/kcdacre8tor/ai_smb_crm_frontend/DEVELOPMENT.md` for full CRM development guide.

---

## NoCodeBackend API Reference

### CRITICAL: Use Lowercase `instance` Parameter

**NCB API requires lowercase `instance`, NOT `Instance`.**

```bash
# CORRECT
?instance=36905_ai_smb_crm

# WRONG - returns "Missing instance parameter"
?Instance=36905_ai_smb_crm
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user-auth/providers?instance=...` | GET | List enabled auth providers |
| `/api/user-auth/sign-up/email?instance=...` | POST | Create new user |
| `/api/user-auth/sign-in/email?instance=...` | POST | Sign in user |
| `/api/user-auth/get-session?instance=...` | GET | Get current session |
| `/api/user-auth/sign-out?instance=...` | POST | Sign out user |
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
| "Missing instance parameter" | Using `Instance` (capital I) | Use lowercase `instance` |
| 500 on sign-up/sign-in | Auth provider not enabled | Insert into `ncba_config` |
| Empty response | Missing env vars | Check Cloudflare Production env vars |
| "Unexpected end of JSON" | API returning empty body | Check env vars and instance name |
