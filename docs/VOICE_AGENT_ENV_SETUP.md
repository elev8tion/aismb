# Voice Agent Environment Setup Guide

This guide lists all environment variables required for both voice agents to function.

## Landing Page (`kre8tion.com`) - Project: `kre8tion-app`

Set these in **Cloudflare Pages Dashboard** → Settings → Environment variables → Production

### OpenAI API

```bash
OPENAI_API_KEY=sk-proj-...
```

**Where to get it**: https://platform.openai.com/api-keys

**Used for**:
- Voice transcription (`whisper-1`)
- Chat completions (`gpt-4o-mini`)
- Text-to-speech (`tts-1`)

---

### NCB (NoCodeBackend) - OpenAPI

```bash
NCB_INSTANCE=36905_ai_smb_crm
NCB_OPENAPI_URL=https://openapi.nocodebackend.com
NCB_SECRET_KEY=...
```

**Where to get `NCB_SECRET_KEY`**:
- Login to https://app.nocodebackend.com
- Go to Settings → API Keys
- Copy the **secret key** (NOT the `ncb_` prefixed MCP token)

**Used for**:
- Lead submissions from voice agent (guest writes)
- Booking creation
- ROI calculation saves

**IMPORTANT**: This uses the **OpenAPI** endpoint with Bearer auth, NOT the Data Proxy.

---

### EmailIt (Transactional Emails)

```bash
EMAILIT_API_KEY=...
ADMIN_EMAIL=kc@kre8tion.com
```

**Where to get `EMAILIT_API_KEY`**:
- Login to https://emailit.com
- Go to Settings → API Keys
- Copy the API key

**Used for**:
- Booking confirmations
- Assessment confirmations
- Lead dossiers (admin notifications)
- ROI report delivery
- **Admin alerts for high-value leads** (if `FF_VOICE_ADMIN_ALERTS=true`)

**Domain verification**: `kre8tion.com` must be verified in EmailIt with SPF, DKIM, and DMARC records.

---

### Feature Flags (Start with all FALSE)

```bash
FF_VOICE_LEAD_EXTRACTION=false
FF_VOICE_LEAD_SCORING=false
FF_VOICE_CRM_SYNC=false
FF_VOICE_ANALYTICS=false
FF_VOICE_ADMIN_ALERTS=false
```

**How to activate**: Change to `true` one at a time, test thoroughly.

**Activation order**:
1. `LEAD_EXTRACTION` first
2. `LEAD_SCORING` second
3. `CRM_SYNC` third
4. `ADMIN_ALERTS` fourth (requires `ADMIN_EMAIL` + `EMAILIT_API_KEY`)
5. `ANALYTICS` independent (dormant, for future use)

---

### KV Namespaces (Already Bound in wrangler.toml)

These are **already configured** in `wrangler.toml`. Do NOT add to environment variables manually.

```toml
[[kv_namespaces]]
binding = "VOICE_SESSIONS"
id = "23e84aa024414eeb9b5edb2b254bbe3b"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "b7addbaac289495ba3cac09e573fe279"

[[kv_namespaces]]
binding = "COST_MONITOR_KV"
id = "6173089a0e644193b07e7419055f4c7a"

[[kv_namespaces]]
binding = "RESPONSE_CACHE_KV"
id = "cbef44c800ca49eb81e2b08b95f05d11"
```

**If these namespaces don't exist** (fresh deployment):
1. Create via `wrangler kv:namespace create VOICE_SESSIONS`
2. Update `wrangler.toml` with the returned ID
3. Repeat for each namespace

---

### Optional: Google Calendar Integration (Future)

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://kre8tion.com/api/booking/calendar/google/callback
```

**Status**: Booking system exists but calendar integration not yet active.

---

## CRM (`app.kre8tion.com`) - Project: `ai-smb-crm`

Set these in **Cloudflare Pages Dashboard** → Settings → Environment variables → Production

### OpenAI API

```bash
OPENAI_API_KEY=sk-proj-...
```

**Same key as landing page** (can share across projects).

**Used for**:
- Three-tier chat completions
- Tool-calling agent
- Voice transcription (future)

---

### NCB (NoCodeBackend) - Data Proxy

```bash
NCB_INSTANCE=36905_ai_smb_crm
NCB_AUTH_API_URL=https://app.nocodebackend.com/api/user-auth
NCB_DATA_API_URL=https://app.nocodebackend.com/api/data
```

**IMPORTANT**: The CRM uses the **Data Proxy API** (session cookies), NOT the OpenAPI.

**Used for**:
- Agent tool calls (authenticated user CRUD)
- Row-level security (RLS) policies
- User authentication

**No secret key needed** - authentication is via session cookies set by better-auth.

---

### Stripe (Billing System)

```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_DISCOVERY_MONTHLY=price_...
STRIPE_PRICE_FOUNDATION_MONTHLY=price_...
STRIPE_PRICE_ARCHITECT_MONTHLY=price_...
```

**Where to get these**:
- Login to https://dashboard.stripe.com
- Go to Developers → API keys → Secret key
- Go to Products → Prices → Copy price IDs

**Used for**:
- Invoice creation
- Subscription management
- Webhook automation (setup paid → auto-subscribe → welcome email)

---

### EmailIt (CRM Emails)

```bash
EMAILIT_API_KEY=...
```

**Same key as landing page**.

**Used for**:
- Welcome emails (on setup payment received)
- Payment failure alerts
- Partnership status updates

---

### KV Namespaces (Create if not exist)

```toml
[[kv_namespaces]]
binding = "AGENT_SESSIONS"
id = "..."  # Create via wrangler kv:namespace create AGENT_SESSIONS

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "..."  # Create via wrangler kv:namespace create RATE_LIMIT_KV
```

---

## Verification Checklist

### After Setting Environment Variables

**Landing Page:**
- [ ] `OPENAI_API_KEY` set and valid
- [ ] `NCB_SECRET_KEY` set (from NCB dashboard, NOT MCP token)
- [ ] `NCB_INSTANCE` = `36905_ai_smb_crm`
- [ ] `NCB_OPENAPI_URL` = `https://openapi.nocodebackend.com`
- [ ] `EMAILIT_API_KEY` set and valid
- [ ] `ADMIN_EMAIL` = your email address
- [ ] All feature flags = `false` initially
- [ ] KV namespaces bound in `wrangler.toml`

**CRM:**
- [ ] `OPENAI_API_KEY` set and valid
- [ ] `NCB_INSTANCE` = `36905_ai_smb_crm`
- [ ] `NCB_AUTH_API_URL` = `https://app.nocodebackend.com/api/user-auth`
- [ ] `NCB_DATA_API_URL` = `https://app.nocodebackend.com/api/data`
- [ ] Stripe keys set (secret + 3 price IDs)
- [ ] `EMAILIT_API_KEY` set
- [ ] KV namespaces bound

---

## Testing Environment Variables

### Test OpenAI API Key

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

Should return list of models. If error:
- Key is invalid or expired
- Go to https://platform.openai.com/api-keys to regenerate

---

### Test NCB OpenAPI

```bash
curl "https://openapi.nocodebackend.com/read/leads?Instance=36905_ai_smb_crm" \
  -H "Authorization: Bearer $NCB_SECRET_KEY"
```

Should return `{"status":"success","data":[...]}`. If 401:
- Secret key is wrong
- Check NCB dashboard → Settings for correct key

---

### Test EmailIt API

```bash
curl https://api.emailit.com/v1/emails \
  -X POST \
  -H "Authorization: Bearer $EMAILIT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "AI KRE8TION Partners <bookings@kre8tion.com>",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email from the voice agent setup.</p>"
  }'
```

Should return `{"id":"...","status":"sent"}`. If error:
- API key is invalid
- Domain not verified (check EmailIt dashboard)

---

### Test Feature Flags

1. Set `FF_VOICE_LEAD_EXTRACTION=true` in Cloudflare
2. Have voice conversation mentioning email
3. Check Cloudflare Pages logs → Functions
4. Should see: `Voice Agent Feature Flags: { extraction: ✅, ... }`
5. Should see: `🎯 Lead extracted: email@example.com`

If not working:
- Flag not set correctly (check spelling, value must be `"true"`)
- Changes can take ~1 minute to propagate
- Try triggering a new deployment

---

## Environment Variable Security

**DO NOT**:
- ❌ Commit `.env` files to git
- ❌ Share API keys in Slack/email
- ❌ Use production keys in development

**DO**:
- ✅ Set secrets in Cloudflare Pages dashboard only
- ✅ Use separate keys for development/production
- ✅ Rotate keys periodically (every 90 days)
- ✅ Monitor API usage for anomalies

---

## Common Issues

### "Missing NCB environment variables"

**Cause**: `NCB_INSTANCE`, `NCB_OPENAPI_URL`, or `NCB_SECRET_KEY` not set.

**Fix**:
1. Go to Cloudflare Pages → `kre8tion-app` → Settings → Environment variables
2. Verify all three are set for **Production** environment
3. Redeploy if needed

---

### "OpenAI API key invalid"

**Cause**: Key expired, revoked, or not set.

**Fix**:
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Update `OPENAI_API_KEY` in Cloudflare Pages
4. Changes take effect immediately (edge runtime)

---

### "EmailIt API returned 401"

**Cause**: `EMAILIT_API_KEY` invalid or domain not verified.

**Fix**:
1. Verify API key at https://emailit.com/settings
2. Check domain verification (SPF, DKIM, DMARC records)
3. Update key in Cloudflare if changed

---

### Feature flag not activating

**Cause**: Typo in flag name, value not exactly `"true"`, or not in Production env.

**Fix**:
1. Check spelling: `FF_VOICE_LEAD_EXTRACTION` (case-sensitive)
2. Value must be string `"true"` (not `1`, `yes`, `True`)
3. Ensure set for **Production** environment (not Preview)
4. Wait 1-2 minutes for edge propagation

---

## Next Steps

After setting all environment variables:
1. Read [VOICE_AGENT_IMPLEMENTATION.md](./VOICE_AGENT_IMPLEMENTATION.md) for architecture
2. Read [VOICE_AGENT_TESTING.md](./VOICE_AGENT_TESTING.md) for test procedures
3. Gradually enable feature flags one at a time
4. Monitor logs and CRM for expected behavior
