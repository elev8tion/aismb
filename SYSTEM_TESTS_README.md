# System Tests - Quick Reference

## What Are These Tests?

Comprehensive integration tests that:
- ✅ **Trace complete user flows** from start to finish
- ✅ **Continue on error** to reveal ALL issues, not just the first
- ✅ **Generate detailed reports** showing exactly where things break
- ✅ **Support iterative debugging** by running scenarios to completion

## Quick Start

### Landing Page Voice Agent

```bash
cd ai-smb-partners

# Basic run
./scripts/run-system-tests.sh

# With detailed tracing
./scripts/run-system-tests.sh --trace

# Against production
API_BASE=https://kre8tion.com ./scripts/run-system-tests.sh --trace
```

### CRM Voice Agent

```bash
cd ai_smb_crm_frontend

# Basic run
./scripts/run-system-tests.sh

# With detailed tracing
./scripts/run-system-tests.sh --trace
```

## What Gets Tested

### Landing Page (6 Scenarios)
1. ✅ Simple English conversation
2. ✅ Spanish language mode
3. ✅ Lead extraction flow (feature flags)
4. ✅ Rate limiting (10/min)
5. ✅ Input validation
6. ✅ Error recovery

### CRM (7 Scenarios)
1. ✅ Authentication required
2. ✅ Model tier routing (fast/standard/reasoning)
3. ✅ OpenAI model validation
4. ✅ CRM tools availability (47 tools)
5. ✅ NCB integration
6. ✅ Spanish mode support
7. ✅ Cost optimization

## Understanding Results

### ✅ All Tests Pass
**Meaning**: System working correctly
**Action**: Deploy with confidence

### ❌ Some Tests Fail
**Meaning**: Issues detected
**Action**:
1. Check `test-reports/voice-agent-system-report.md`
2. Review error details
3. Fix issues one at a time
4. Re-run tests

### ⚠️ Warnings Present
**Meaning**: Tests passed with caveats
**Action**: Review warnings, decide if acceptable

## Reports

After tests run, check:

**Markdown (human-readable)**:
```bash
cat test-reports/voice-agent-system-report.md
```

**JSON (detailed)**:
```bash
cat test-reports/voice-agent-system-report.json | jq
```

## Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| Dev server failed to start | Port 3000 in use | `lsof -i :3000` then kill process |
| All API calls fail (500) | OpenAI key invalid | Check `OPENAI_API_KEY` |
| All API calls fail (400) | Invalid models | Run `npm test -- modelValidation.test.ts` |
| Spanish returns English | Language instruction order | Check messages array in route |
| Lead not synced | Flags disabled | Enable `FF_VOICE_CRM_SYNC=true` |

## Detailed Documentation

See [docs/SYSTEM_TESTING_GUIDE.md](docs/SYSTEM_TESTING_GUIDE.md) for:
- Scenario-by-scenario breakdown
- Debugging failed tests
- Creating custom scenarios
- Continuous testing strategy

---

**Pro tip**: Run with `--trace` to see step-by-step execution in real-time!
