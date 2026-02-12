# Voice Agent System Testing Guide

Comprehensive internal system tests with detailed tracing to observe complete flows and identify systemic issues.

---

## Overview

These tests are designed to:
1. **Trace complete user scenarios** from start to finish
2. **Continue on error** rather than failing fast
3. **Reveal all issues** across the entire system, not just the first failure
4. **Generate detailed reports** showing exactly where things go wrong
5. **Support iterative debugging** by running tests to completion

---

## Test Architecture

### Landing Page Tests (`voiceAgent.system.test.ts`)

**6 comprehensive scenarios**:
1. ✅ Simple English conversation (session management, response quality)
2. ✅ Spanish language mode (language switching, translation accuracy)
3. ✅ Lead extraction flow (feature flags, NCB sync, deduplication)
4. ✅ Rate limiting behavior (10 requests/min limit)
5. ✅ Input validation (missing fields, empty questions, very long questions, prompt injection)
6. ✅ Error recovery and resilience (invalid language, system recovery after error)

**Each scenario**:
- Traces every step (start → processing → success/error)
- Logs detailed data at each checkpoint
- Continues even when errors occur
- Captures timing, response data, and error details

### CRM Tests (`crmAgent.system.test.ts`)

**7 comprehensive scenarios**:
1. ✅ Authentication required (verifies 401/403 for unauthenticated requests)
2. ✅ Model tier routing validation (fast/standard/reasoning logic)
3. ✅ OpenAI model name validation (checks for invalid models)
4. ✅ CRM tools availability (verifies all 47 tools present)
5. ✅ NCB integration check (environment variables, client configuration)
6. ✅ Spanish mode support (voice models, language handling)
7. ✅ Cost optimization strategy (model costs, tier usage)

---

## Running the Tests

### Quick Start

**Landing Page:**
```bash
cd ai-smb-partners
./scripts/run-system-tests.sh
```

**CRM:**
```bash
cd ai_smb_crm_frontend
./scripts/run-system-tests.sh
```

### With Detailed Tracing

Enable step-by-step console output:

```bash
./scripts/run-system-tests.sh --trace
```

**Output example**:
```
🔵 [Simple English Conversation] Initialize {"sessionId":"test-1234-en"}
🔵 [Simple English Conversation] Send first message {"question":"What services..."}
✅ [Simple English Conversation] First message response {"status":200,"hasResponse":true,"duration":1523}
🔵 [Simple English Conversation] Send follow-up message {"question":"How much..."}
✅ [Simple English Conversation] Follow-up response {"status":200,"hasResponse":true,"duration":1387}
✅ [Simple English Conversation] Session memory verified
```

### Test Against Real APIs

**Default**: Tests run against `http://localhost:3000` (local dev server)

**Custom API base**:
```bash
API_BASE=https://kre8tion.com ./scripts/run-system-tests.sh
```

**With real OpenAI/NCB calls** (use with caution - costs money):
```bash
./scripts/run-system-tests.sh --trace --real-apis
```

### With Dev Server Already Running

Skip automatic server startup:
```bash
npm run dev  # In one terminal

# In another terminal:
./scripts/run-system-tests.sh --dev-running
```

---

## Understanding the Reports

### Console Output

After tests complete, you'll see a summary:

```
═══════════════════════════════════════════════════════════════════════════
VOICE AGENT SYSTEM TEST REPORT
═══════════════════════════════════════════════════════════════════════════
Total Scenarios: 6
Total Steps: 42
  ✅ Success: 38
  ❌ Errors: 2
  ⚠️  Warnings: 2
───────────────────────────────────────────────────────────────────────────

Simple English Conversation:
  Steps: 7
  Success: 7
  Errors: 0

Spanish Language Mode:
  Steps: 4
  Success: 3
  Errors: 1
  Error Details:
    - Language verification: Response contains English words

...
```

### JSON Report

**Location**: `test-reports/voice-agent-system-report.json`

**Structure**:
```json
{
  "report": {
    "totalScenarios": 6,
    "totalSteps": 42,
    "successSteps": 38,
    "errorSteps": 2,
    "warningSteps": 2,
    "byScenario": {
      "Simple English Conversation": {
        "totalSteps": 7,
        "success": 7,
        "errors": 0,
        "errorDetails": []
      },
      "Spanish Language Mode": {
        "totalSteps": 4,
        "success": 3,
        "errors": 1,
        "errorDetails": [
          {
            "step": "Language verification",
            "error": {"response": "The response..."}
          }
        ]
      }
    }
  },
  "traces": [
    {
      "timestamp": "2026-02-12T10:23:45.123Z",
      "scenario": "Simple English Conversation",
      "step": "Send first message",
      "status": "success",
      "data": {"status": 200, "duration": 1523}
    },
    ...
  ]
}
```

### Markdown Report

**Location**: `test-reports/voice-agent-system-report.md`

Human-readable report with:
- Summary statistics
- Scenario-by-scenario breakdown
- Step-by-step traces with data
- Recommendations based on results

**View**:
```bash
cat test-reports/voice-agent-system-report.md
open test-reports/voice-agent-system-report.md  # macOS
```

---

## Test Scenarios in Detail

### Scenario 1: Simple English Conversation

**What it tests**:
- Basic chat functionality
- Session management (conversation history)
- Response quality
- Multiple turns in conversation
- Memory persistence

**Traces**:
1. Initialize with session ID
2. Send first message → verify response
3. Send follow-up message → verify response
4. Verify session memory working

**Success criteria**:
- Both messages receive 200 OK responses
- Responses contain relevant content
- Follow-up acknowledges previous context

**Common failures**:
- 500 error → OpenAI API key invalid
- 400 error → Invalid model name
- Empty response → Model misconfiguration
- No context in follow-up → Session storage broken

---

### Scenario 2: Spanish Language Mode

**What it tests**:
- Language switching
- Spanish prompt compliance
- Response language verification

**Traces**:
1. Initialize Spanish session
2. Send Spanish question
3. Receive response
4. Verify response is actually in Spanish (keyword check)

**Success criteria**:
- Response contains Spanish keywords
- Response does NOT contain English keywords
- Language instruction applied correctly

**Common failures**:
- Response in English → Language instruction not first in messages array
- Mixed language → Weak language instruction
- No response → Spanish model not configured

---

### Scenario 3: Lead Extraction Flow

**What it tests**:
- Feature flag system
- Lead extraction (email, industry, pain points)
- Lead scoring logic
- CRM sync (NCB integration)
- Deduplication by email

**Traces**:
1. Initialize session with test email
2. Send message with lead information
3. Receive response (lead extraction happens server-side)
4. Log expected extraction results for manual verification

**Success criteria**:
- Response received successfully
- Server logs show lead extraction (check Cloudflare logs)
- If CRM sync enabled: Lead appears in CRM

**Common failures**:
- Feature flags not enabled → No extraction
- NCB credentials invalid → Sync fails
- Email regex broken → Email not extracted
- Duplicate leads → Deduplication logic broken

**Manual verification required**:
- Check Cloudflare Pages logs for: `🎯 Lead extracted: email@example.com`
- Check CRM leads table for test email
- Verify lead score calculated correctly

---

### Scenario 4: Rate Limiting

**What it tests**:
- Rate limit enforcement (10 requests/min per session)
- 429 error handling
- Burst protection

**Traces**:
1. Initialize session
2. Send 12 rapid requests
3. Count successes vs rate limited (429)

**Success criteria**:
- First 10 requests succeed (200 OK)
- Requests 11-12 fail with 429
- Rate limit active and protecting API

**Common failures**:
- All 12 succeed → Rate limiting not configured
- All 12 fail → Rate limit too strict or other error
- Inconsistent results → Race condition in limiter

---

### Scenario 5: Input Validation

**What it tests**:
- Missing required fields (sessionId, question)
- Empty question handling
- Very long question handling (>1000 chars)
- Prompt injection detection

**Traces**:
1. Test missing sessionId → expect 400
2. Test empty question → expect 400
3. Test very long question (1500 chars) → expect 400 or process
4. Test prompt injection attempt → expect logged warning

**Success criteria**:
- Missing sessionId: 400 error
- Empty question: 400 error or processed with warning
- Long question: Handled gracefully (400 or truncated)
- Prompt injection: Logged but processed

**Common failures**:
- No validation → Crashes on missing fields
- Too strict validation → Rejects valid input
- No injection detection → Security risk

---

### Scenario 6: Error Recovery

**What it tests**:
- Invalid language code handling
- System recovery after error
- Resilience to malformed requests

**Traces**:
1. Send invalid language code → check handling
2. Send problematic request (empty question)
3. Send valid request → verify system recovered

**Success criteria**:
- Invalid language: Defaults to English or rejects gracefully
- After error: Next valid request succeeds
- System remains stable

**Common failures**:
- Crash on invalid language → No default handling
- State corruption → Valid request fails after error
- Memory leak → Session not cleaned up

---

## Interpreting Results

### ✅ All Tests Pass

**Meaning**: Voice agent is functioning correctly across all tested scenarios.

**Next steps**:
1. Deploy to production with confidence
2. Enable feature flags gradually
3. Monitor real user interactions

---

### ❌ Some Tests Fail

**Approach**:
1. **Read the report** - Start with `test-reports/voice-agent-system-report.md`
2. **Identify pattern** - Are errors concentrated in one scenario or spread across many?
3. **Check error details** - Look at `errorDetails` in JSON report for exact failure points
4. **Review traces** - Examine step-by-step trace to see where flow broke
5. **Fix systematically** - Address errors one scenario at a time, re-test after each fix

**Common patterns**:

| Error Pattern | Likely Cause | Fix |
|---------------|--------------|-----|
| All API calls fail | Dev server not running | Start `npm run dev` first |
| 400 errors from OpenAI | Invalid model names | Check `lib/openai/config.ts` |
| 401 errors from NCB | Wrong credentials | Check `NCB_SECRET_KEY` env var |
| Spanish returns English | Language instruction order | Move language prompt to first position |
| Lead not in CRM | Feature flags disabled | Enable `FF_VOICE_CRM_SYNC=true` |
| Rate limit not working | Limit not configured | Check rate limit middleware |

---

### ⚠️ Warnings Present

**Meaning**: Tests passed but with caveats or uncertain results.

**Examples**:
- "Cannot definitively verify language" → Response unclear, manual check needed
- "May allow empty questions" → Validation might be lenient, monitor in production
- "Lead extraction occurs server-side" → Cannot verify without checking logs

**Action**: Review warnings, decide if acceptable or if improvements needed.

---

## Debugging Failed Tests

### Step 1: Enable Tracing

```bash
./scripts/run-system-tests.sh --trace
```

Watch console output to see exactly where the failure occurs.

### Step 2: Check Server Logs

**Local dev**:
```bash
# Server logs in terminal running npm run dev
```

**Production (Cloudflare Pages)**:
- Dashboard → Pages → `kre8tion-app` → Logs → Functions

### Step 3: Isolate the Scenario

Run only the failing test:

```bash
npm test -- --testNamePattern="Scenario 2: Spanish language mode"
```

### Step 4: Add Custom Traces

Edit the test file to add more detailed logging:

```typescript
trace(scenario, 'Custom checkpoint', 'start', {
  customData: yourVariable,
  detailedInfo: moreDetails,
});
```

### Step 5: Test Against Production

```bash
API_BASE=https://kre8tion.com ./scripts/run-system-tests.sh --trace
```

Compare local vs production results to isolate environment issues.

---

## Continuous Testing Strategy

### During Development

**After every code change**:
```bash
npm test -- modelValidation.test.ts  # Quick validation (5 seconds)
```

**Before committing**:
```bash
./scripts/run-system-tests.sh  # Full system test (2-5 minutes)
```

### Before Deployment

**Pre-deployment checklist**:
1. ✅ Run system tests locally
2. ✅ All tests pass or warnings acceptable
3. ✅ Review report for new issues
4. ✅ If production API test needed: `API_BASE=https://kre8tion.com ./scripts/run-system-tests.sh`

### After Deployment

**Post-deployment verification**:
1. Run tests against production URL
2. Compare results to pre-deployment
3. Check for regressions

**Schedule**:
- Run daily in CI/CD (GitHub Actions)
- Run manually after feature flag changes
- Run before major releases

---

## Creating Custom Test Scenarios

### Template

```typescript
test('Scenario X: Your test name', async () => {
  const scenario = 'Your Test Scenario';
  const sessionId = `test-${Date.now()}-custom`;

  trace(scenario, 'Initialize', 'start', { sessionId });

  try {
    // Step 1: Setup
    trace(scenario, 'Your first step', 'start', { data: 'value' });

    // Your test logic here
    const response = await fetch(...);

    if (response.ok) {
      trace(scenario, 'Your first step', 'success', { status: response.status });
    } else {
      trace(scenario, 'Your first step', 'error', null, { status: response.status });
    }

    // Step 2: Verification
    trace(scenario, 'Verification step', 'start');

    // Verify results
    if (someCondition) {
      trace(scenario, 'Verification step', 'success');
    } else {
      trace(scenario, 'Verification step', 'warning', { note: 'Partial success' });
    }

  } catch (error) {
    trace(scenario, 'Unexpected error', 'error', null, error);
  }
});
```

### Best Practices

1. **Always trace** - Every significant step should be traced
2. **Continue on error** - Don't throw, trace the error and continue
3. **Use descriptive steps** - "Send first message" not "Step 1"
4. **Include data** - Trace relevant data for debugging
5. **Use status correctly**:
   - `start` - Beginning of a step
   - `success` - Step completed successfully
   - `error` - Step failed
   - `warning` - Step completed with caveats

---

## Troubleshooting the Tests Themselves

### Tests Won't Run

**Error**: `Cannot find module`

**Fix**:
```bash
npm install
```

**Error**: `Dev server failed to start`

**Fix**:
- Check port 3000 not already in use: `lsof -i :3000`
- Kill existing process: `kill -9 <PID>`
- Or run with server already started: `./scripts/run-system-tests.sh --dev-running`

### Tests Timeout

**Error**: Jest timeout after 30s

**Fix**: Increase timeout in test file:
```typescript
test('Long scenario', async () => {
  // ...
}, 60000);  // 60 second timeout
```

### Reports Not Generated

**Error**: Report file not found

**Fix**: Check `test-reports/` directory exists:
```bash
mkdir -p test-reports
```

---

## Next Steps

After running system tests:

1. **Review reports** - Understand what passed/failed
2. **Fix issues systematically** - One scenario at a time
3. **Re-test** - Verify fixes work
4. **Document patterns** - Update this guide with new findings
5. **Expand tests** - Add scenarios for new features

---

## See Also

- [Testing Procedures](./VOICE_AGENT_TESTING.md) - Manual test cases
- [Troubleshooting Guide](./VOICE_AGENT_TROUBLESHOOTING.md) - Common issues
- [Implementation Guide](./VOICE_AGENT_IMPLEMENTATION.md) - Architecture

---

**Last updated**: February 12, 2026
