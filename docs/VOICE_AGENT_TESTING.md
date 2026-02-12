# Voice Agent Testing Procedures

Comprehensive test cases for both voice agents.

## Pre-Deployment Testing (Local/Preview)

### Run Unit Tests

```bash
# Landing page
cd ai-smb-partners
npm test

# CRM
cd ai_smb_crm_frontend
npm test
```

**Expected**: All tests pass, including `modelValidation.test.ts`

---

### Run Model Validation Tests

```bash
npm test -- modelValidation.test.ts
```

**Expected**: All OpenAI models are valid

**If fails**:
- Check `lib/openai/config.ts` for invalid model names
- Refer to https://platform.openai.com/docs/models for valid models
- Common mistake: Using `gpt-4.1-nano`, `o4-mini`, `gpt-4o-mini-tts` (all invalid)

---

### Test Build Process

```bash
# Landing page
npm run build

# CRM
npm run pages:build
```

**Expected**: Build succeeds without TypeScript errors

**If fails**:
- Check for type errors in enhanced voice agent route
- Verify all imports resolve correctly

---

## Landing Page Voice Agent Tests

### Test 1: Simple English Conversation

**Setup**: Feature flags all disabled

**Steps**:
1. Open https://kre8tion.com
2. Click voice agent button
3. Say or type: *"What services do you offer?"*

**Expected**:
- ✅ Response mentions AI agentic systems, automation, CRM
- ✅ Response time <3s
- ✅ No errors in console

**Logs to check** (Cloudflare Pages → Logs):
```
📊 Question classified as: simple (200 tokens)
⏱️ Response generated in 1500ms
```

---

### Test 2: Spanish Language Mode

**Setup**: Feature flags all disabled

**Steps**:
1. Open https://kre8tion.com
2. Click voice agent button
3. Switch language to Spanish (ES flag)
4. Say or type: *"¿Qué servicios ofrecen?"*

**Expected**:
- ✅ Response ENTIRELY in Spanish
- ✅ Mentions "sistemas agénticos", "automatización"
- ✅ No English words in response

**Logs to check**:
```
🌐 Language received: es
INSTRUCCIÓN OBLIGATORIA DE IDIOMA: Eres un asistente que SOLO responde en español
```

**Common issue**: If response is in English:
- Check that `language: 'es'` is being sent to API
- Verify language instruction is FIRST in messages array

---

### Test 3: Lead Extraction

**Setup**: `FF_VOICE_LEAD_EXTRACTION=true`, all others false

**Steps**:
1. Open voice agent
2. Say: *"I run an HVAC business with 15 employees. My email is john@hvac.com and I'm wasting too much time on scheduling."*

**Expected**:
- ✅ Normal response (no user-visible change)
- ✅ Logs show extracted data:

```
🎯 Lead extracted: john@hvac.com
Voice Agent Feature Flags: { extraction: ✅, scoring: ❌, crmSync: ❌, ... }
```

**Verify extraction**:
- Email: `john@hvac.com`
- Industry: `HVAC`
- Employee count: Detected if mentioned as 5-10, 10-25, 25-50, 50+
- Pain points: `wasting too much time on scheduling`
- Sentiment: Likely `negative` or `neutral`

**If not working**:
- Check flag is exactly `FF_VOICE_LEAD_EXTRACTION=true`
- Verify flag set for Production environment
- Check logs for feature flag status

---

### Test 4: Lead Scoring

**Setup**: `FF_VOICE_LEAD_EXTRACTION=true`, `FF_VOICE_LEAD_SCORING=true`

**Test 4a: High-Value Lead**

**Steps**:
1. Say: *"I own a plumbing company with 20 employees. Email: owner@plumbingco.com, phone 555-1234. We're struggling with dispatching and missed appointments."*

**Expected logs**:
```
🎯 Lead extracted: owner@plumbingco.com
📊 Lead score: 90/100 (high) - Target industry match, Ideal business size (10-50 employees), Has email, Has phone, Profile completeness shows high intent
```

**Score breakdown**:
- Industry (plumbing): +30 pts
- Employee count (20): +30 pts
- Email: +10 pts
- Phone: +10 pts
- Completeness: +20 pts
- **Total: 100/100** → `high` tier

---

**Test 4b: Low-Value Lead**

**Steps**:
1. Say: *"My email is jane@example.com"*

**Expected logs**:
```
🎯 Lead extracted: jane@example.com
📊 Lead score: 10/100 (low) - Has email
```

**Score breakdown**:
- Email: +10 pts
- **Total: 10/100** → `low` tier

---

**Test 4c: Medium-Value Lead**

**Steps**:
1. Say: *"I run a retail store with 8 employees, email sarah@store.com"*

**Expected logs**:
```
📊 Lead score: 55/100 (medium) - Standard industry, Good business size (5-10 employees), Has email, Profile completeness
```

---

### Test 5: CRM Sync

**Setup**: `FF_VOICE_LEAD_EXTRACTION=true`, `FF_VOICE_LEAD_SCORING=true`, `FF_VOICE_CRM_SYNC=true`

**Test 5a: New Lead Creation**

**Steps**:
1. Voice conversation with: *"HVAC business, 15 employees, email newlead@hvac.com"*
2. Check logs
3. Login to https://app.kre8tion.com/leads
4. Search for `newlead@hvac.com`

**Expected**:
- ✅ Logs show: `✅ Lead synced to CRM: ID 123`
- ✅ Lead appears in CRM
- ✅ Score field populated: `80-100`
- ✅ Notes field: `"Voice Agent | Score: high (...)"`
- ✅ Source: `"Voice Agent"`

---

**Test 5b: Lead Deduplication**

**Steps**:
1. Have another conversation with same email: *"This is a follow-up, my email is newlead@hvac.com, I'm very interested now"*
2. Check logs
3. Check CRM

**Expected**:
- ✅ Logs show: `✅ Lead synced to CRM: ID 123` (SAME ID)
- ✅ Lead **updated**, NOT duplicated
- ✅ Only ONE lead in CRM with that email
- ✅ Notes appended or updated
- ✅ Sentiment may change (to `positive` based on "very interested")

**If duplicates created**:
- Check `syncLeadToCRM` function (should check email first)
- Verify NCB `leads` table has email as unique or indexed
- Check logs for "existing lead" logic

---

### Test 6: Admin Alerts

**Setup**: All flags `true`, `ADMIN_EMAIL` and `EMAILIT_API_KEY` set

**Test 6a: High-Value Lead Alert**

**Steps**:
1. Conversation: *"Construction company, 25 employees, email boss@construction.com, phone 555-9999"*
2. Check logs
3. Check admin email inbox (ADMIN_EMAIL)

**Expected**:
- ✅ Logs: `📧 Admin alert sent for high-value lead`
- ✅ Email received within 10 seconds
- ✅ Subject: `🔥 High-Value Lead from Voice Agent`
- ✅ Body includes:
  - Email: `boss@construction.com`
  - Industry: `Construction`
  - Employee Count: `25-50`
  - Score: `100/100 (high)`
  - Factors: List of scoring factors
  - Link to CRM

---

**Test 6b: Low-Value Lead (No Alert)**

**Steps**:
1. Conversation: *"My email is test@example.com"*
2. Check logs
3. Check admin email

**Expected**:
- ✅ No alert sent (score too low)
- ✅ Logs do NOT show `📧 Admin alert sent`
- ✅ No email received

**Alert criteria**:
- Only sent for `tier === 'high'` (score 80+)
- Requires all flags enabled + email configured

---

### Test 7: Rate Limiting

**Setup**: Any config

**Steps**:
1. Send 15 rapid requests to `/api/voice-agent/chat`
2. Check responses

**Expected**:
- ✅ First 10 requests succeed (200 OK)
- ✅ 11th+ requests fail with 429 (Too Many Requests)
- ✅ Error message: `"Rate limit exceeded"`

**Rate limit**: 10 requests per minute per session

**To reset**: Wait 60 seconds or use different `sessionId`

---

### Test 8: Cost Monitoring

**Setup**: Any config with OpenAI calls

**Steps**:
1. Have 10+ conversations (varied complexity)
2. Check KV namespace `COST_MONITOR_KV`

**Expected**:
- ✅ Keys like `cost:2026-02-12` exist
- ✅ Values track total cost in cents
- ✅ Dashboard shows cost trends

**Monitor in production**: Set up alerts if daily cost exceeds threshold

---

## CRM Voice Agent Tests

### Test 9: CRM Login & Access

**Steps**:
1. Go to https://app.kre8tion.com
2. Login with valid credentials
3. Open voice agent
4. Say: *"Hello"*

**Expected**:
- ✅ Response acknowledges greeting (fast tier)
- ✅ No auth errors
- ✅ Session cookie present in request

**If 401 error**:
- User not logged in
- Session expired
- Better-auth config issue

---

### Test 10: Three-Tier Model Routing

**Test 10a: Fast Tier**

**Steps**:
1. Say: *"Hi"* or *"Hello"*

**Expected logs**:
```
Model tier selected: fast (gpt-4o-mini)
⏱️ Response in ~500-1000ms
```

**Fast tier criteria**:
- Short message (<50 chars)
- Simple greeting or navigation

---

**Test 10b: Standard Tier**

**Steps**:
1. Say: *"Give me a summary of all my open leads"*

**Expected logs**:
```
Model tier selected: standard (gpt-4o-mini)
Tool calls: listLeads
⏱️ Response in ~1000-2000ms
```

**Standard tier criteria**:
- Multi-step query
- Tool calling required
- Moderate complexity

---

**Test 10c: Reasoning Tier**

**Steps**:
1. Say: *"Why haven't we closed more deals this month? What patterns do you see?"*

**Expected logs**:
```
Model tier selected: reasoning (gpt-4o)
⏱️ Response in ~2000-4000ms
```

**Reasoning tier criteria**:
- "Why" questions
- "Analyze" requests
- "Explain" prompts
- Complex strategic queries

**Cost note**: `gpt-4o` is ~30x more expensive than `gpt-4o-mini`. Use sparingly.

---

### Test 11: Tool Calling

**Test 11a: List Leads**

**Steps**:
1. Say: *"Show me new leads"*

**Expected**:
- ✅ Response lists recent leads
- ✅ Includes: name, email, status, created date
- ✅ Logs show tool call: `listLeads(filters: {status: 'new'})`

---

**Test 11b: Create Task**

**Steps**:
1. Say: *"Create a task to follow up with John tomorrow"*

**Expected**:
- ✅ Response confirms task created
- ✅ Task appears in CRM tasks list
- ✅ Logs show tool call: `createTask({title: 'Follow up with John', due_date: '...'})`

---

**Test 11c: Pipeline Navigation**

**Steps**:
1. Say: *"Show me the pipeline"*

**Expected**:
- ✅ Response includes pipeline stats (qualified, proposal, negotiation, closed)
- ✅ Logs show tool call: `getPipelineSummary()`

---

### Test 12: Spanish Mode (CRM)

**Steps**:
1. Login to CRM
2. Open voice agent
3. Say: *"Muéstrame los leads nuevos"*

**Expected**:
- ✅ Response in Spanish
- ✅ Tool call executes correctly
- ✅ Data returned and formatted

**Common issue**: Spanish may not work if language detection is English-only. Check CRM config.

---

### Test 13: Error Handling

**Test 13a: Invalid Tool Call**

**Steps**:
1. Say: *"Delete all leads"* (dangerous operation, should be blocked)

**Expected**:
- ✅ Agent declines or asks for confirmation
- ✅ No mass deletion occurs
- ✅ Logs show safety check triggered

---

**Test 13b: Network Failure**

**Steps**:
1. Disconnect internet mid-conversation
2. Send message

**Expected**:
- ✅ Error response: `"Failed to generate response"`
- ✅ User-friendly error message
- ✅ No crash or infinite loop

---

## Automated Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm test -- modelValidation.test.ts
npm test -- voiceAgent.test.ts
```

### Integration Tests (Requires Local Server)

```bash
npm run dev  # Start dev server on localhost:3000
npm run test:integration
```

**Expected**:
- ✅ All integration tests pass
- ✅ Real API calls succeed (if keys configured)
- ✅ Mock data fallback works if keys missing

---

## Performance Benchmarks

### Landing Page Voice Agent

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Response time (simple) | <1.5s | <3s | >3s |
| Response time (complex) | <3s | <5s | >5s |
| Cost per conversation | <$0.02 | <$0.05 | >$0.05 |
| Lead extraction accuracy | >90% | >80% | <80% |

### CRM Voice Agent

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Fast tier response | <1s | <2s | >2s |
| Standard tier response | <2s | <4s | >4s |
| Reasoning tier response | <4s | <8s | >8s |
| Tool call success rate | >95% | >90% | <90% |

---

## Regression Testing Checklist

Run this checklist **before every production deployment**:

### Landing Page
- [ ] Model validation tests pass
- [ ] Simple conversation works (English)
- [ ] Spanish mode works
- [ ] Lead extraction works (if enabled)
- [ ] Lead scoring accurate (if enabled)
- [ ] CRM sync no duplicates (if enabled)
- [ ] Admin alerts send (if enabled)
- [ ] Rate limiting active
- [ ] No console errors
- [ ] Build succeeds

### CRM
- [ ] Model validation tests pass
- [ ] Login required (401 if not logged in)
- [ ] Fast tier routing correct
- [ ] Standard tier routing correct
- [ ] Reasoning tier routing correct
- [ ] Tool calls execute
- [ ] No invalid model errors
- [ ] Session persistence works
- [ ] Build succeeds

---

## Monitoring in Production

### Cloudflare Pages Logs

**Where**: Cloudflare Dashboard → Pages → `kre8tion-app` → Logs

**What to watch**:
- ❌ Errors from OpenAI (400, 401, 429)
- ❌ NCB API failures (500)
- ❌ EmailIt delivery failures
- ✅ Feature flag status logged correctly
- ✅ Lead extraction/scoring/sync success

**Alert on**:
- Error rate >5% over 5 minutes
- OpenAI 429 (rate limit hit)
- NCB 401 (auth expired)

---

### OpenAI Usage Dashboard

**Where**: https://platform.openai.com/usage

**What to watch**:
- Daily token usage trends
- Cost per day
- Model distribution (should see mostly `gpt-4o-mini`)

**Alert on**:
- Daily cost >$50 (adjust threshold)
- Sudden spike in `gpt-4o` usage (expensive)

---

### EmailIt Delivery Dashboard

**Where**: https://emailit.com/dashboard

**What to watch**:
- Delivery rate >95%
- Bounce rate <2%
- Open rate (informational)

**Alert on**:
- Delivery rate drops below 90%
- Spam complaints increase

---

## Troubleshooting Common Test Failures

### Test fails: "Invalid model 'gpt-4.1-nano'"

**Fix**: Update `lib/openai/config.ts` with valid models (see VOICE_AGENT_IMPLEMENTATION.md)

### Test fails: "NCB API returned 401"

**Fix**: Check `NCB_SECRET_KEY` is correct (NOT the MCP token)

### Test fails: "Lead not synced to CRM"

**Fix**:
1. Check `FF_VOICE_CRM_SYNC=true`
2. Verify NCB credentials
3. Check logs for NCB API errors
4. Verify `leads` table exists in NCB

### Test fails: "No admin alert received"

**Fix**:
1. Check `FF_VOICE_ADMIN_ALERTS=true`
2. Verify `ADMIN_EMAIL` and `EMAILIT_API_KEY` set
3. Check score is `high` (80+)
4. Check EmailIt dashboard for delivery status
5. Check spam folder

### Test fails: "Response in English instead of Spanish"

**Fix**:
1. Verify `language: 'es'` sent to API
2. Check language instruction is FIRST in messages array
3. Clear session storage (old history may be in English)

---

## Next Steps

After testing:
1. Deploy to production (landing page auto-deploys on push to main)
2. Monitor logs for 24 hours
3. Gradually enable feature flags (one per day)
4. Collect user feedback
5. Iterate on prompts/thresholds
