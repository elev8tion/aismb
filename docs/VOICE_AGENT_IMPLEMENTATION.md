# Voice Agent Implementation Guide

## Architecture Overview

The AI KRE8TION Partners platform has **two separate voice agents**:

### 1. Landing Page Voice Agent (`ai-smb-partners`)
- **Purpose**: Lead generation, information gathering, ROI calculations
- **URL**: `https://kre8tion.com/api/voice-agent/chat`
- **Authentication**: Public (no auth required)
- **Model**: `gpt-4o-mini` (cost-effective for most queries)
- **Features**: Gradually activated via feature flags
- **Database**: NCB OpenAPI (Bearer auth with secret key)

### 2. CRM Voice Agent (`ai_smb_crm_frontend`)
- **Purpose**: Internal operations, CRM navigation, data queries
- **URL**: `https://app.kre8tion.com/api/agent/chat`
- **Authentication**: Session cookies (authenticated users only)
- **Models**: Three-tier routing (`gpt-4o-mini` for most, `gpt-4o` for reasoning)
- **Features**: All 47 tools active
- **Database**: NCB Data Proxy (session cookies with RLS)

## Two-Agent System Rationale

**Why separate agents?**
1. **Different audiences**: Guests vs authenticated CRM users
2. **Different permissions**: Public info vs CRM data access
3. **Different costs**: Landing page optimized for volume/cost
4. **Different complexity**: Landing page simple → CRM advanced

## Model Selection Strategy

### Landing Page (Simple)
- **Chat**: `gpt-4o-mini` ($0.10/$0.40 per 1M tokens)
- **Transcription**: `whisper-1` ($0.006 per minute)
- **TTS**: `tts-1` ($15 per 1M characters)

### CRM (Three-Tier Routing)
- **Fast**: `gpt-4o-mini` — Greetings, simple lookups
- **Standard**: `gpt-4o-mini` — Multi-step queries, summaries
- **Reasoning**: `gpt-4o` — Complex "why" questions, analysis

**Routing Logic** (`lib/agent/modelRouter.ts`):
- Fast: User message <50 chars + no tool calls needed
- Reasoning: Question contains "why", "how does", "analyze", "explain"
- Standard: Everything else

## Feature Flag System

### What Are Feature Flags?

Feature flags allow **gradual rollout** of voice agent capabilities:
- Start with all flags **disabled** (safe default)
- Enable one feature at a time
- Test thoroughly before next feature
- Instant rollback by disabling flag (no code deploy)

### Available Flags

Set these in **Cloudflare Pages Environment Variables** (dashboard):

```bash
FF_VOICE_LEAD_EXTRACTION=false   # Extract email, industry, pain points from conversations
FF_VOICE_LEAD_SCORING=false      # Score leads based on industry fit and intent
FF_VOICE_CRM_SYNC=false          # Sync qualified leads to CRM database
FF_VOICE_ANALYTICS=false         # Track sentiment, topics, conversion funnel (future)
FF_VOICE_ADMIN_ALERTS=false      # Email alerts for high-value leads
```

### Feature Dependencies

**Must enable in order**:
1. `LEAD_EXTRACTION` first (foundation)
2. `LEAD_SCORING` second (requires extraction)
3. `CRM_SYNC` third (requires scoring)
4. `ADMIN_ALERTS` fourth (requires CRM sync)
5. `ANALYTICS` independent (can enable anytime)

### How to Activate a Feature

**Step 1**: Set flag to `true` in Cloudflare Pages
1. Go to Cloudflare dashboard → Pages → `kre8tion-app`
2. Settings → Environment variables → Production
3. Add/edit variable: `FF_VOICE_LEAD_EXTRACTION=true`
4. Changes take effect immediately (edge runtime)

**Step 2**: Test the feature
- Have a voice conversation with lead info
- Check Cloudflare Pages logs for feature output
- Verify expected behavior (see Testing Guide)

**Step 3**: Monitor for issues
- Watch logs for errors
- Check CRM for lead data (if sync enabled)
- Verify email delivery (if alerts enabled)

**Step 4**: Rollback if needed
- Set flag back to `false` in dashboard
- Feature deactivates immediately

## Code Organization

### Landing Page (`ai-smb-partners`)

```
lib/
  voiceAgent/
    leadManager.ts       — Extract + sync leads to CRM
    leadScorer.ts        — Score leads (0-100 scale)
    analyticsAgent.ts    — Track sentiment, topics (dormant)
    knowledgeBase.ts     — Company info, services, pricing
    questionClassifier.ts — Smart token limits per complexity
    sessionStorage.ts    — Conversation history (KV)
    responseCache.ts     — Cache common questions (KV)

  openai/
    config.ts            — Model names, costs, helpers

  featureFlags.ts        — Feature flag parsing

  ncb/
    client.ts            — NCB OpenAPI integration

app/api/
  voice-agent/
    chat/route.ts        — Main chat endpoint (features integrated here)
```

### CRM (`ai_smb_crm_frontend`)

```
lib/
  agent/
    modelRouter.ts       — Three-tier model selection
    tools/index.ts       — 47 CRM tools (leads, tasks, pipeline, etc.)
    ncbClient.ts         — NCB Data Proxy integration

  openai/
    config.ts            — Model names (MUST BE VALID)

app/api/
  agent/
    chat/route.ts        — Main chat endpoint (tool calling)
```

## Integration Points

### 1. NCB (NoCodeBackend) Database

**Two different APIs depending on context:**

#### Landing Page: OpenAPI (guest writes)
- **URL**: `https://openapi.nocodebackend.com`
- **Auth**: `Authorization: Bearer ${NCB_SECRET_KEY}`
- **Instance**: `?Instance=36905_ai_smb_crm` (capital `I`)
- **Endpoints**: `/read/{table}`, `/create/{table}`, `/update/{table}/{id}`
- **Use for**: Public lead submission, booking creation

#### CRM: Data Proxy (authenticated user CRUD)
- **URL**: `https://app.nocodebackend.com/api/data`
- **Auth**: Session cookies (`better-auth.session_token`)
- **Instance**: `?instance=36905_ai_smb_crm` (lowercase `i`)
- **Use for**: CRM tool calls, RLS-protected data

### 2. EmailIt (Transactional Emails)

- **API**: `POST https://api.emailit.com/v1/emails`
- **Auth**: `Authorization: Bearer ${EMAILIT_API_KEY}`
- **From**: `AI KRE8TION Partners <bookings@kre8tion.com>`
- **Tags**: `['kre8tion', 'landing', '<type>']` (landing page)
- **Tags**: `['kre8tion', 'crm', '<type>']` (CRM)

### 3. Cloudflare KV Namespaces

**Landing Page:**
- `VOICE_SESSIONS`: Conversation history (session management)
- `RATE_LIMIT_KV`: API rate limiting
- `COST_MONITOR_KV`: OpenAI cost tracking
- `RESPONSE_CACHE_KV`: Cached responses (common questions)

**CRM:**
- `AGENT_SESSIONS`: Conversation history
- `RATE_LIMIT_KV`: Rate limiting

## Feature Activation Checklist

### Phase 1: Lead Extraction

**Enable**: `FF_VOICE_LEAD_EXTRACTION=true`

**What it does**:
- Extracts email, industry, employee count from conversations
- Detects pain points (scheduling, billing, manual work)
- Detects objections (price, skepticism, timing)
- Detects sentiment (positive, neutral, negative)

**Test**:
1. Conversation: *"I run an HVAC business, my email is john@hvac.com"*
2. Check logs: Should see `🎯 Lead extracted: john@hvac.com`
3. Should detect industry: "HVAC"

**Rollback**: Set to `false`

---

### Phase 2: Lead Scoring

**Enable**: `FF_VOICE_LEAD_SCORING=true` (requires extraction enabled)

**What it does**:
- Scores leads 0-100 based on:
  - Industry fit (30 pts): HVAC, plumbing, construction = high
  - Business size (30 pts): 10-50 employees = ideal
  - Contact quality (20 pts): Has email + phone
  - Intent (20 pts): Profile completeness
- Assigns tier: `high` (80+), `medium` (50-79), `low` (<50)

**Test**:
1. Conversation: *"I run an HVAC business with 15 employees, email john@hvac.com, phone 555-1234"*
2. Check logs: Should see `📊 Lead score: 90/100 (high) - Target industry match, Ideal business size, Has email, Has phone, Profile completeness`
3. Low-score test: *"My email is jane@example.com"*
4. Should see `📊 Lead score: 10/100 (low) - Has email`

**Rollback**: Set to `false`

---

### Phase 3: CRM Sync

**Enable**: `FF_VOICE_CRM_SYNC=true` (requires scoring enabled)

**What it does**:
- Syncs lead to CRM database (NCB `leads` table)
- Deduplicates by email (updates existing, creates new)
- Populates fields: email, industry, employeeCount, qualified_score, notes, sentiment, pain_points, etc.
- Sets source: "Voice Agent"

**Test**:
1. Complete voice conversation with email
2. Check logs: Should see `✅ Lead synced to CRM: ID 123`
3. Login to app.kre8tion.com/leads
4. Verify lead appears with correct score and notes
5. Have another conversation with same email
6. Verify lead **updated** (not duplicated)

**Rollback**: Set to `false`

---

### Phase 4: Admin Alerts

**Enable**: `FF_VOICE_ADMIN_ALERTS=true` (requires CRM sync enabled)

**Requires**: `ADMIN_EMAIL` and `EMAILIT_API_KEY` env vars set

**What it does**:
- Sends email to admin for **high-value leads only** (score 80+)
- Email includes: email, industry, score, factors, pain points, sentiment
- Link to CRM to view lead

**Test**:
1. Conversation resulting in high score (80+)
2. Check logs: Should see `📧 Admin alert sent for high-value lead`
3. Check admin email inbox
4. Verify email received with lead details
5. Low-score conversation: Should NOT send email

**Rollback**: Set to `false`

---

## Future Enhancements Roadmap

See [VOICE_AGENT_ROADMAP.md](./VOICE_AGENT_ROADMAP.md) for detailed future plans.

### Short-term (1-2 months)
- Voice session persistence to NCB
- Voice session replay UI in CRM
- Sentiment analysis dashboard
- A/B test system prompts
- More languages (French, Portuguese)

### Medium-term (3-6 months)
- Real-time voice streaming (WebSockets)
- Voice biometrics for caller ID
- AI-generated follow-up emails
- Phone system integration (Twilio)

### Long-term (6-12 months)
- Multi-agent orchestration
- Predictive lead scoring (ML)
- Voice workflow automation
- Zapier/Make integration
- White-label voice agent offering

---

## Common Issues & Solutions

See [VOICE_AGENT_TROUBLESHOOTING.md](./VOICE_AGENT_TROUBLESHOOTING.md) for detailed troubleshooting.

## Testing Procedures

See [VOICE_AGENT_TESTING.md](./VOICE_AGENT_TESTING.md) for comprehensive test cases.

## Environment Setup

See [VOICE_AGENT_ENV_SETUP.md](./VOICE_AGENT_ENV_SETUP.md) for all required environment variables.
