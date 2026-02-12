# Voice Agent Troubleshooting Guide

Quick reference for diagnosing and fixing common voice agent issues.

## Quick Diagnosis Table

| Symptom | Likely Cause | Quick Fix | Full Solution |
|---------|--------------|-----------|---------------|
| 400 error from OpenAI | Invalid model name | Check `lib/openai/config.ts` | See [Invalid Model Error](#invalid-model-error) |
| 401 error from OpenAI | API key invalid/expired | Regenerate key | See [OpenAI Auth Error](#openai-auth-error) |
| 429 from OpenAI | Rate limit hit | Wait or upgrade plan | See [Rate Limit Errors](#rate-limit-errors) |
| Lead not syncing to CRM | Flag disabled or NCB issue | Check flags + credentials | See [CRM Sync Failures](#crm-sync-failures) |
| No admin alert email | Flag disabled or email issue | Check flag + EmailIt | See [Email Delivery Issues](#email-delivery-issues) |
| Response in wrong language | Language instruction order | Check message array | See [Language Issues](#language-issues) |
| CRM agent 401 | User not logged in | Login required | See [CRM Auth Issues](#crm-auth-issues) |
| Duplicate leads created | Deduplication failing | Check email matching | See [Duplicate Lead Issues](#duplicate-lead-issues) |
| Slow response (>5s) | Model/network issue | Check tier routing | See [Performance Issues](#performance-issues) |

---

## OpenAI Errors

### Invalid Model Error

**Symptom**:
```
OpenAI API error 400: Invalid model 'gpt-4.1-nano' or 'o4-mini'
```

**Root cause**: Using model names that don't exist in OpenAI's API

**How to diagnose**:
1. Check Cloudflare Pages logs for exact error message
2. Note which model name is invalid
3. Compare against valid models: https://platform.openai.com/docs/models

**Fix**:

**CRM** (`ai_smb_crm_frontend/lib/openai/config.ts`):
```typescript
export const MODELS = {
  fast: 'gpt-4o-mini',          // ✅ NOT 'gpt-4.1-nano'
  standard: 'gpt-4o-mini',      // ✅ NOT 'gpt-4.1-mini'
  reasoning: 'gpt-4o',          // ✅ NOT 'o4-mini'
  transcription: 'whisper-1',   // ✅
  tts: 'tts-1',                 // ✅ NOT 'gpt-4o-mini-tts'
  voice: 'echo',                // ✅
  voiceEs: 'nova',              // ✅
}
```

**Landing Page** (`ai-smb-partners/lib/openai/config.ts`):
```typescript
export const MODELS = {
  transcription: 'whisper-1',  // ✅
  chat: 'gpt-4o-mini',         // ✅
  tts: 'tts-1',                // ✅
  voice: 'echo',               // ✅
}
```

**Verify fix**:
```bash
npm test -- modelValidation.test.ts
```

Should pass without errors.

**Deploy**:
- Landing page: `git push origin main` (auto-deploys)
- CRM: Manual deployment required

**Prevention**: CI/CD workflow now runs model validation on every change to `lib/openai/config.ts`

---

### OpenAI Auth Error

**Symptom**:
```
OpenAI API error 401: Invalid authentication credentials
```

**Root cause**: `OPENAI_API_KEY` is invalid, expired, or not set

**How to diagnose**:
1. Check environment variables in Cloudflare Pages dashboard
2. Test key directly:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

If returns 401, key is invalid.

**Fix**:
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key (starts with `sk-proj-`)
4. Update in Cloudflare Pages:
   - Dashboard → Pages → `kre8tion-app` (or `ai-smb-crm`)
   - Settings → Environment variables → Production
   - Edit `OPENAI_API_KEY` → Paste new key
   - Save

**Takes effect**: Immediately (edge runtime)

**No redeployment needed**

---

### Rate Limit Errors

**Symptom**:
```
OpenAI API error 429: Rate limit exceeded
```

**Two types of rate limits**:

#### 1. OpenAI API Rate Limit

**Cause**: Too many requests to OpenAI in short time

**Check usage**: https://platform.openai.com/usage

**Fix options**:
- **Wait**: Rate limits reset after 60 seconds
- **Upgrade plan**: Higher tier = higher limits
- **Optimize**: Reduce token usage, enable caching

---

#### 2. Application Rate Limit (Voice Agent)

**Cause**: >10 requests per minute per session (built-in protection)

**Symptom**:
```json
{
  "error": "Rate limit exceeded",
  "status": 429
}
```

**Fix**:
- Wait 60 seconds
- Use different `sessionId`
- Adjust limit in `lib/openai/config.ts`:

```typescript
export const RATE_LIMIT = {
  maxRequestsPerMinute: 10,  // Increase if needed
  windowMs: 60 * 1000,
};
```

---

## NCB (NoCodeBackend) Errors

### NCB 401 Unauthorized

**Symptom**:
```
NCB API Error (read/leads): 401 Unauthorized
```

**Root cause**: Wrong API key or auth method

**Landing Page** (uses OpenAPI):
- Check `NCB_SECRET_KEY` (NOT the `ncb_` MCP token)
- Go to NCB dashboard → Settings → API Keys
- Copy the **secret key** (long alphanumeric string)
- Update in Cloudflare Pages environment variables

**CRM** (uses Data Proxy):
- No secret key needed
- Auth via session cookies
- If 401, user not logged in or session expired

**Test**:
```bash
# Landing page (OpenAPI)
curl "https://openapi.nocodebackend.com/read/leads?Instance=36905_ai_smb_crm" \
  -H "Authorization: Bearer YOUR_SECRET_KEY"

# Should return {"status":"success","data":[...]}
```

---

### NCB 500 Internal Server Error

**Symptom**:
```
NCB API Error: 500 Internal Server Error
```

**Common causes**:
1. Invalid SQL syntax (rare with OpenAPI)
2. Database constraint violation (e.g., required field missing)
3. RLS policy denying access
4. NCB service outage

**Debug**:
1. Check NCB dashboard for service status
2. Review payload being sent (check logs)
3. Verify table schema matches data structure
4. Test same request in NCB API playground

**Fix**:
- If constraint error: Add missing required fields
- If RLS error: Adjust RLS policies in NCB dashboard
- If service outage: Wait for NCB team to resolve

---

## Feature Flag Issues

### Feature Not Activating

**Symptom**: Flag set to `true` but feature doesn't work

**Checklist**:
1. ✅ Spelling exact: `FF_VOICE_LEAD_EXTRACTION` (case-sensitive)
2. ✅ Value is string `"true"` (lowercase)
3. ✅ Set for **Production** environment (not Preview)
4. ✅ Dependent flags also enabled (see [Dependencies](#feature-dependencies))

**How to verify**:

Check logs for:
```
Voice Agent Feature Flags: { extraction: ✅, scoring: ❌, ... }
```

If shows ❌ when should be ✅:
- Flag not set correctly
- Wait 1-2 minutes for edge propagation
- Try new deployment to force refresh

---

### Feature Dependencies

**Must enable in order**:

```
LEAD_EXTRACTION (foundation)
    ↓
LEAD_SCORING (requires extraction)
    ↓
CRM_SYNC (requires scoring)
    ↓
ADMIN_ALERTS (requires sync)
```

**Example error**: `CRM_SYNC=true` but `LEAD_SCORING=false`

**Result**: Lead extracted but not scored → sync fails gracefully (no error but no sync)

**Fix**: Enable dependent flags in order

---

## CRM Sync Failures

### Lead Not Appearing in CRM

**Symptom**: Voice conversation completes, logs show extraction, but no lead in CRM

**Debug steps**:

1. **Check feature flags**:
```
FF_VOICE_LEAD_EXTRACTION=true
FF_VOICE_LEAD_SCORING=true
FF_VOICE_CRM_SYNC=true
```

2. **Check logs** for:
```
✅ Lead synced to CRM: ID 123
```

If NOT present:
- Feature flags not enabled
- NCB credentials invalid
- NCB API error (check for 401/500)

3. **Check NCB credentials**:
```bash
NCB_INSTANCE=36905_ai_smb_crm
NCB_OPENAPI_URL=https://openapi.nocodebackend.com
NCB_SECRET_KEY=<valid secret key>
```

4. **Test NCB connection**:
```bash
curl "https://openapi.nocodebackend.com/read/leads?Instance=36905_ai_smb_crm" \
  -H "Authorization: Bearer $NCB_SECRET_KEY"
```

Should return leads array.

5. **Check email extraction**:
- Lead sync only happens if `email` extracted
- Check logs: `🎯 Lead extracted: email@example.com`
- If no email mentioned in conversation → no sync

**Fix**: Ensure email provided in conversation

---

### Duplicate Lead Issues

**Symptom**: Same email creates multiple lead records

**Expected behavior**: Same email should UPDATE existing lead, not create duplicate

**Debug**:

1. Check `syncLeadToCRM` function (`lib/voiceAgent/leadManager.ts`):
```typescript
// Line 52-54: Should check for existing leads
const existingLeads = await ncbRequest<NCBRecord[]>('GET', `read/leads`, env, {
  email: leadData.email
});
```

2. Check NCB `leads` table:
- Is `email` field indexed?
- Is email search case-sensitive?

**Fix**:

Ensure deduplication logic:
```typescript
// Normalize email to lowercase
const existingLeads = await ncbRequest('GET', `read/leads`, env, {
  email: leadData.email.toLowerCase()
});
```

**Temporary fix**: Manually merge duplicates in CRM

**Long-term fix**: Add unique constraint on `email` in NCB schema

---

## Email Delivery Issues

### Admin Alerts Not Sending

**Symptom**: High-value lead detected but no admin email received

**Checklist**:

1. ✅ `FF_VOICE_ADMIN_ALERTS=true`
2. ✅ `FF_VOICE_CRM_SYNC=true` (dependency)
3. ✅ `ADMIN_EMAIL` set (e.g., `kc@kre8tion.com`)
4. ✅ `EMAILIT_API_KEY` set and valid
5. ✅ Lead score is `high` (80+)

**Debug logs**:

Should see:
```
📊 Lead score: 90/100 (high)
✅ Lead synced to CRM: ID 123
📧 Admin alert sent for high-value lead
```

If missing `📧 Admin alert sent`:
- Score not high enough (<80)
- Email env vars not set
- EmailIt API error

**Test EmailIt directly**:
```bash
curl https://api.emailit.com/v1/emails \
  -X POST \
  -H "Authorization: Bearer $EMAILIT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "AI KRE8TION Partners <bookings@kre8tion.com>",
    "to": "your-email@example.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

Should return `{"id":"...","status":"sent"}`

If 401:
- API key invalid
- Regenerate at https://emailit.com/settings

If domain error:
- `kre8tion.com` not verified
- Check SPF/DKIM/DMARC records

---

### Emails Going to Spam

**Symptom**: Admin alerts send but arrive in spam folder

**Causes**:
1. Domain not verified (SPF/DKIM missing)
2. Low sender reputation (new domain)
3. Content triggers spam filters

**Fix**:

1. **Verify domain in EmailIt**:
   - Login to https://emailit.com
   - Settings → Domains → `kre8tion.com`
   - Ensure ✅ marks on SPF, DKIM, DMARC

2. **Add DNS records** (if not present):

SPF:
```
Type: TXT
Name: @
Value: v=spf1 include:emailit.com ~all
```

DKIM:
```
Type: TXT
Name: emailit._domainkey
Value: <provided by EmailIt>
```

DMARC:
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:kc@kre8tion.com
```

3. **Improve content**:
   - Avoid ALL CAPS subject lines
   - Avoid spam trigger words ("FREE", "CLICK HERE")
   - Include physical address in footer
   - Add unsubscribe link

4. **Warm up sender domain**:
   - Start with low volume (<50 emails/day)
   - Gradually increase over 2 weeks
   - Monitor bounce/complaint rates

---

## Language Issues

### Spanish Mode Returns English

**Symptom**: User selects Spanish but agent responds in English

**Root cause**: Language instruction not prioritized in prompt

**Debug**:

Check message array order in `app/api/voice-agent/chat/route.ts`:

**Correct order** (line 68-80):
```typescript
const messages = [];

// 1. Language instruction FIRST (critical)
if (language === 'es') {
  messages.push({
    role: 'system',
    content: 'INSTRUCCIÓN OBLIGATORIA DE IDIOMA: Eres un asistente que SOLO responde en español...'
  });
}

// 2. Knowledge base SECOND
messages.push({ role: 'system', content: KNOWLEDGE_BASE });

// 3. Conversation history
messages.push(...conversationHistory);

// 4. Current question
messages.push({ role: 'user', content: sanitizedQuestion });
```

**If language instruction is AFTER knowledge base → English response**

**Fix**: Ensure language instruction is **first** message in array

**Also check**:
- `language` param sent from frontend: `{language: 'es'}`
- Logs show: `🌐 Language received: es`

---

### Mixed Language in Response

**Symptom**: Response mostly Spanish but includes English phrases

**Cause**: Knowledge base content leaking through (English source material)

**Fix**:

Strengthen language instruction:
```typescript
content: 'INSTRUCCIÓN OBLIGATORIA: Responde ÚNICAMENTE en español. Sin excepciones. Traduce todo el contenido de referencia antes de usarlo. Nunca uses palabras en inglés.'
```

**Alternative**: Translate knowledge base to Spanish (separate file)

---

## CRM Auth Issues

### CRM Agent Returns 401

**Symptom**:
```
Error 401: Unauthorized
```

**Root cause**: User not logged in or session expired

**Expected behavior**: CRM voice agent requires authentication

**Fix**:
1. Redirect user to login page
2. After login, return to voice agent
3. Session cookie should be set automatically

**Check session**:
- Cookie name: `better-auth.session_token`
- Present in request headers
- Not expired

**If session valid but still 401**:
- Better-auth config issue
- NCB Data Proxy not accepting cookie
- RLS policy denying access

**Debug**:
```bash
# Check if session endpoint works
curl https://app.nocodebackend.com/api/user-auth/session \
  -H "Cookie: better-auth.session_token=..."
```

Should return user object.

---

## Performance Issues

### Slow Response Times (>5s)

**Symptom**: Voice agent takes >5 seconds to respond

**Diagnosis**:

Check logs for:
```
⏱️ Response generated in 8000ms
```

**Common causes**:

1. **Wrong model tier**:
   - Using `gpt-4o` (reasoning) for simple queries
   - Check tier selection logic in `lib/agent/modelRouter.ts`

2. **Long conversation history**:
   - >20 messages in session → slower processing
   - Implement history truncation (keep last 10 messages)

3. **Network latency**:
   - Cloudflare edge → OpenAI → response
   - Check OpenAI status: https://status.openai.com

4. **Token limit too high**:
   - Requesting 1000+ tokens for simple query
   - Adjust `classifyQuestion` thresholds

**Fix for model tier**:

```typescript
// Prefer fast tier (gpt-4o-mini) for most queries
export function selectModelTier(question: string): ModelTier {
  if (question.length < 50 && !needsToolCall(question)) {
    return 'fast';  // ~500ms response
  }
  // ... rest of logic
}
```

**Fix for history**:

```typescript
// Limit conversation history to last 10 messages
const recentHistory = conversationHistory.slice(-10);
messages.push(...recentHistory);
```

---

### High OpenAI Costs

**Symptom**: Daily OpenAI bill higher than expected

**Diagnosis**:

1. Check usage: https://platform.openai.com/usage
2. Identify which model used most
3. Check token counts per request

**Common causes**:
- Too many `gpt-4o` (reasoning) calls
- Large token limits (>500 tokens)
- No response caching (common questions repeated)

**Fix**:

1. **Tighten reasoning tier criteria**:
```typescript
// Only use gpt-4o for true reasoning questions
if (question.match(/^why .* \?$/i) || question.includes('analyze')) {
  return 'reasoning';
}
// Default to standard (gpt-4o-mini)
return 'standard';
```

2. **Enable response caching**:
```typescript
// Check cache before calling OpenAI
const cached = await responseCache.get(questionHash);
if (cached) return cached;
```

3. **Reduce token limits**:
```typescript
// Simple questions: 150 tokens, not 200
if (classification.complexity === 'simple') {
  return { maxTokens: 150 };
}
```

4. **Monitor costs**:
- Set up alerts if daily cost >$X
- Review usage weekly
- Adjust thresholds as needed

---

## Deployment Issues

### Landing Page Build Fails

**Symptom**:
```
Build failed: TypeScript error
```

**Common causes**:
1. Type mismatch in new code
2. Missing imports
3. Invalid syntax

**Debug**:
```bash
npm run build
```

Shows exact error location.

**Fix**:
- Resolve TypeScript errors
- Run `npm test` locally before pushing
- Check CI/CD logs for details

---

### CRM Manual Deploy Fails

**Symptom**:
```
wrangler pages deploy failed
```

**Common causes**:
1. Not logged in to Cloudflare
2. Project name typo
3. Build output missing

**Fix**:

1. **Login**:
```bash
npx wrangler login
```

2. **Rebuild**:
```bash
npm run pages:build
```

3. **Deploy**:
```bash
npx wrangler pages deploy .vercel/output/static \
  --project-name=ai-smb-crm \
  --commit-dirty=true \
  --no-bundle
```

Ensure `--project-name` matches Cloudflare dashboard.

---

## Emergency Rollback Procedures

### Rollback Feature Flags (Instant)

**Fastest rollback** (no code deploy):

1. Cloudflare Dashboard → Pages → `kre8tion-app` → Settings → Environment variables
2. Set problematic flag to `false`:
   - `FF_VOICE_LEAD_EXTRACTION=false`
   - `FF_VOICE_CRM_SYNC=false`
   - etc.
3. Save

**Takes effect**: Immediately (~1 minute for edge propagation)

**No redeployment needed**

---

### Rollback Code (Git Revert)

**If model changes or code breaks**:

1. **Find last working commit**:
```bash
git log --oneline
```

2. **Revert to that commit**:
```bash
git revert <commit-hash>
```

3. **Push**:
```bash
git push origin main
```

**Landing page**: Auto-deploys from main (GitHub Actions)

**CRM**: Manual deployment required

---

### Nuclear Rollback (Safe Fallback Models)

**If all else fails**, use most stable OpenAI models:

**CRM** (`lib/openai/config.ts`):
```typescript
export const MODELS = {
  fast: 'gpt-3.5-turbo',      // Oldest, most stable
  standard: 'gpt-3.5-turbo',
  reasoning: 'gpt-4',         // Not gpt-4o
  transcription: 'whisper-1',
  tts: 'tts-1',
  voice: 'echo',
  voiceEs: 'nova',
}
```

**Trade-off**: Less capable but 100% stable

---

## Monitoring & Alerting

### Where to Check Logs

**Cloudflare Pages**:
- Dashboard → Pages → Project → Logs → Functions
- Real-time log stream
- Filter by severity (error, warn, info)

**OpenAI**:
- https://platform.openai.com/usage
- Token usage, model distribution, cost trends

**EmailIt**:
- https://emailit.com/dashboard
- Delivery rate, bounce rate, opens/clicks

**NCB**:
- https://app.nocodebackend.com
- Query logs, API usage, RLS audit

---

### Set Up Alerts

**Cloudflare Pages** (via Workers Analytics):
- Alert if error rate >5% over 5 min
- Alert if response time >5s (p95)

**OpenAI**:
- Email alert if daily cost >$50
- Email alert if rate limit hit

**EmailIt**:
- Alert if delivery rate <90%
- Alert if spam complaints >1%

---

## Getting Help

**Documentation**:
- [Implementation Guide](./VOICE_AGENT_IMPLEMENTATION.md)
- [Environment Setup](./VOICE_AGENT_ENV_SETUP.md)
- [Testing Procedures](./VOICE_AGENT_TESTING.md)
- [Roadmap](./VOICE_AGENT_ROADMAP.md)

**External Resources**:
- OpenAI Docs: https://platform.openai.com/docs
- NCB Docs: https://docs.nocodebackend.com
- EmailIt Docs: https://emailit.com/docs
- Cloudflare Pages: https://developers.cloudflare.com/pages

**Support Channels**:
- OpenAI: https://help.openai.com
- NCB: support@nocodebackend.com
- EmailIt: support@emailit.com
- Cloudflare: https://community.cloudflare.com

---

## Common Fixes Summary

| Problem | Fix Command | Time |
|---------|-------------|------|
| Invalid model error | Update `lib/openai/config.ts` | 5 min |
| OpenAI 401 | Regenerate API key | 2 min |
| NCB 401 | Update `NCB_SECRET_KEY` | 2 min |
| Feature not working | Set flag to `true` in CF dashboard | 1 min |
| Duplicate leads | Check deduplication logic | 15 min |
| No admin alerts | Enable flags + check email config | 5 min |
| Spanish returns English | Fix message array order | 5 min |
| Slow responses | Optimize model tier selection | 30 min |
| High costs | Reduce reasoning tier usage | 30 min |

---

**Last updated**: February 2026
**Maintained by**: AI KRE8TION Partners Development Team
