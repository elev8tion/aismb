# Cloudflare Deployment Guide

## Project Information

| Setting | Value |
|---------|-------|
| **GitHub Repo** | `elev8tion/aismb` |
| **Cloudflare Project** | `kre8tion-app` |
| **Production URL** | https://kre8tion.com |
| **Pages URL** | https://kre8tion-app.pages.dev |
| **Git Auto-Deploy** | `kre8tion-app-v2` (connected to GitHub) |

---

## Deployment Methods

### Method 1: GitHub Auto-Deploy (Recommended)

The `kre8tion-app-v2` project is connected to GitHub. Simply push to main:

```bash
git add .
git commit -m "your message"
git push origin main
```

Cloudflare automatically builds and deploys on push.

**Check deployment status:** https://dash.cloudflare.com → Workers & Pages → kre8tion-app-v2 → Deployments

---

### Method 2: Manual CLI Deploy

Use when auto-deploy is not working or for immediate deployment:

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
