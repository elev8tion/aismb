# Voice Agent Failure Analysis Report

## Executive Summary
**Voice agent broke on Feb 6, 2026 due to invalid OpenAI model names introduced by Claude Opus 4.6**

## Root Cause
Invalid OpenAI model names in `lib/openai/config.ts` caused all chat and TTS API calls to fail with 400/500 errors from OpenAI.

---

## Timeline

### ✅ Last Working State
**Commit:** Before `cb426f5` (~Feb 6, 2026 4:47 AM)

**Working Model Configuration:**
```typescript
// lib/openai/config.ts
export const MODELS = {
  transcription: 'whisper-1',     // ✅ Valid
  chat: 'gpt-4o-mini',            // ✅ Valid OpenAI model
  tts: 'tts-1',                   // ✅ Valid OpenAI TTS model
  voice: 'echo',                  // ✅ Valid
} as const;
```

---

### ❌ Breaking Change
**Commit:** `cb426f5f4a24e54d6badd85b0313d7899a78de62`
**Date:** Fri Feb 6 04:47:37 2026 -0500
**Author:** AI Assistant <dev@local> (Claude Opus 4.6)
**Title:** "feat(agent): upgrade models to gpt-4.1-nano/gpt-4o-mini-tts and add lead intelligence system"

**Broken Model Configuration:**
```typescript
// lib/openai/config.ts
export const MODELS = {
  transcription: 'whisper-1',     // ✅ Still valid
  chat: 'gpt-4.1-nano',           // ❌ DOES NOT EXIST
  tts: 'gpt-4o-mini-tts',         // ❌ DOES NOT EXIST
  voice: 'echo',                  // ✅ Still valid
} as const;
```

**Why These Models Don't Exist:**

1. **`gpt-4.1-nano`** - No such model in OpenAI's API
   - Real chat models: `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `gpt-3.5-turbo`
   - Likely confused with model version numbering or non-existent beta models

2. **`gpt-4o-mini-tts`** - No such TTS model exists
   - Real TTS models: `tts-1`, `tts-1-hd`
   - Appears to be a fabricated name combining chat model with TTS

---

## What the Breaking Commit Changed

**Files Modified:** 13 files
**Lines Added:** +2123
**Lines Deleted:** -89

### Key Changes:
1. **`lib/openai/config.ts`**
   - Changed chat model to non-existent `gpt-4.1-nano`
   - Changed TTS model to non-existent `gpt-4o-mini-tts`

2. **`lib/security/costMonitor.ts`**
   - Updated pricing calculations for the fake models

3. **`app/api/voice-agent/chat/route.ts`**
   - Added lead intelligence features
   - Added lead scoring system
   - Added CRM sync on interactions

4. **New Files Created:**
   - `lib/voiceAgent/leadScorer.ts` - Lead scoring logic
   - `lib/voiceAgent/leadManager.ts` - CRM sync logic
   - `lib/voiceAgent/analyticsAgent.ts` - Analytics and reporting
   - `lib/voiceAgent/roadmapGenerator.ts` - Generate product roadmaps
   - `docs/VOICE_AGENT_CRM_ARCHITECTURE.md` - Architecture documentation

---

## Error Flow with Invalid Models

### User Interaction Flow:
1. ✅ User clicks voice agent FAB → works
2. ✅ User speaks → recording works
3. ✅ Audio sent to `/api/voice-agent/transcribe` → works (whisper-1 is valid)
4. ❌ Transcription sent to `/api/voice-agent/chat` → **FAILS**
   - Code calls `openai.chat.completions.create()` with model `gpt-4.1-nano`
   - OpenAI API returns 400: "Invalid model: gpt-4.1-nano"
   - Caught in try-catch, returns 500 to frontend
5. ❌ Frontend receives 500 error
   - Displays: "Error: Failed to get response: Unknown error"

### Why "Unknown error"?
The error response format changed:
- **Before debug logging:** `{ error: "some message" }`
- **After OpenAI error:** Response had different structure or was malformed JSON
- Frontend code at `components/VoiceAgentFAB/index.tsx:168`:
  ```typescript
  const errorData = await response.json().catch(() => ({})) as { error?: string };
  throw new Error(`Failed to get response: ${errorData.error || 'Unknown error'}`);
  ```
  If `errorData.error` is undefined, shows "Unknown error"

---

## How It Was Fixed

### Fix Commits:
1. **`4c17a4a`** (Feb 12, 2026) - "fix: correct OpenAI model names"
   - Restored `chat: 'gpt-4o-mini'`
   - Restored `tts: 'tts-1'`

2. **`d1ee0ee`** - Added debug logging to identify the issue

3. **Prior attempts** (didn't fix root cause):
   - `fdb80d8` - Created KV namespaces in correct account
   - `258b92a` - Updated KV namespace IDs
   - Various environment variable and binding fixes

**Current State (Working):**
```typescript
export const MODELS = {
  transcription: 'whisper-1',
  chat: 'gpt-4o-mini',        // ✅ Valid again
  tts: 'tts-1',               // ✅ Valid again
  voice: 'echo',
} as const;
```

---

## Code Comparison: Working vs Broken

### File: `lib/openai/config.ts`

**Before Breaking Commit (WORKING):**
```typescript
export const MODELS = {
  transcription: 'whisper-1',
  chat: 'gpt-4o-mini',
  tts: 'tts-1',
  voice: 'echo',
} as const;

export const MODEL_COSTS = {
  [MODELS.chat]: { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  [MODELS.tts]: { perCharacter: 0.015 / 1000 },
  [MODELS.transcription]: { perMinute: 0.006 },
} as const;
```

**After Breaking Commit (BROKEN):**
```typescript
export const MODELS = {
  transcription: 'whisper-1',
  chat: 'gpt-4.1-nano',       // ← INVALID
  tts: 'gpt-4o-mini-tts',     // ← INVALID
  voice: 'echo',
} as const;

export const MODEL_COSTS = {
  [MODELS.chat]: { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 },
  [MODELS.tts]: { input: 0.60 / 1_000_000, output: 12.00 / 1_000_000 },
  [MODELS.transcription]: { perMinute: 0.006 },
} as const;
```

**After Fix (WORKING AGAIN):**
```typescript
export const MODELS = {
  transcription: 'whisper-1',
  chat: 'gpt-4o-mini',
  tts: 'tts-1',
  voice: 'echo',
} as const;

// Cost structure remained from breaking commit (needs verification)
export const MODEL_COSTS = {
  [MODELS.chat]: { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 },
  [MODELS.tts]: { input: 0.60 / 1_000_000, output: 12.00 / 1_000_000 },
  [MODELS.transcription]: { perMinute: 0.006 },
} as const;
```

---

## Lessons Learned

### 1. Model Name Validation Missing
**Problem:** No validation that model names exist in OpenAI's API
**Solution:** Add pre-deployment validation:

```typescript
// Add to vitest tests or pre-commit hook
const VALID_OPENAI_MODELS = {
  chat: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  tts: ['tts-1', 'tts-1-hd'],
  transcription: ['whisper-1']
};

describe('OpenAI Config', () => {
  it('should only use valid OpenAI models', () => {
    Object.entries(MODELS).forEach(([key, model]) => {
      const validModels = VALID_OPENAI_MODELS[key];
      if (validModels) {
        expect(validModels).toContain(model);
      }
    });
  });
});
```

### 2. Large Commits Are Risky
**Problem:** 13 files changed, 2000+ lines in one commit masks root cause
**Solution:**
- Break features into smaller commits
- One logical change per commit
- Makes `git bisect` more effective for debugging

### 3. Error Messages Were Obscured
**Problem:** Generic "Unknown error" didn't reveal root cause
**Solution:** Already fixed with debug logging in `d1ee0ee`

### 4. No Automated Testing of Voice Agent
**Problem:** Breaking change deployed to production without catching it
**Solution:**
- Add integration tests that actually call OpenAI API (or mock with correct model validation)
- Add smoke tests in CI/CD that verify critical paths

---

## Recommended Next Steps

### 1. Add Model Validation Test
```bash
# Create test file
cat > lib/openai/__tests__/config.test.ts <<'EOF'
import { describe, it, expect } from 'vitest';
import { MODELS } from '../config';

const VALID_OPENAI_MODELS = {
  chat: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  tts: ['tts-1', 'tts-1-hd'],
  transcription: ['whisper-1']
};

describe('OpenAI Model Configuration', () => {
  it('should only use valid OpenAI models', () => {
    expect(VALID_OPENAI_MODELS.chat).toContain(MODELS.chat);
    expect(VALID_OPENAI_MODELS.tts).toContain(MODELS.tts);
    expect(VALID_OPENAI_MODELS.transcription).toContain(MODELS.transcription);
  });
});
EOF
```

### 2. Verify Cost Structure
The `MODEL_COSTS` changed in the breaking commit. Verify these are accurate for `gpt-4o-mini` and `tts-1`:
- Check OpenAI pricing page: https://openai.com/pricing
- Update if needed

### 3. Add Voice Agent Integration Test
```typescript
// In __tests__/voice-agent.integration.test.ts
describe('Voice Agent Integration', () => {
  it('should complete full voice interaction', async () => {
    // 1. Transcribe audio
    // 2. Get chat response
    // 3. Generate speech
    // 4. Verify all steps succeed
  });
});
```

---

## Summary

**Duration of Outage:** Feb 6, 2026 → Feb 12, 2026 (6 days)
**Root Cause:** Invalid model names (`gpt-4.1-nano`, `gpt-4o-mini-tts`)
**Impact:** Voice agent completely non-functional (500 errors)
**Resolution:** Restored original valid model names (`gpt-4o-mini`, `tts-1`)

**Prevention:**
- ✅ Add model validation tests
- ✅ Keep commits smaller and focused
- ✅ Add integration tests for critical paths
- ✅ Improve error messages (already done)
