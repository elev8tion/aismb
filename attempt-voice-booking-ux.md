# Attempt: Voice Booking Slot-Filling + Email Spell/Confirm

Date: 2026-02-14
Commit: 8058f80

## Summary
- Implemented a voice-first, industry-standard slot-filling flow for bookings.
- Email is collected via spelling + readback confirmation (no typed email popup).
- Voice agent now collects all required UI fields (name, email, company, industry, employee count) and asks for terms consent before booking.
- Booking tools updated to require `employeeCount`; optional `termsAgreed` recorded.

## What Changed
- Booking Agent Prompt updated with:
  - Availability-first rules (tooling) and no guessing.
  - Slot-filling requirements: name, spelled+confirmed email, company, industry, employee count, terms consent.
  - Short consent summary and fallback to page scroll for typing after repeated email miscaptures.
  - Summary confirmation before creating bookings.
  - File: `lib/voiceAgent/agents/prompts.ts:23`

- Voice Tools (schemas and handlers):
  - `create_consultation_booking` and `create_assessment_checkout` now require `employeeCount`.
  - Added optional `termsAgreed` (boolean).
  - Consultation bookings persist terms consent in `notes`.
  - Assessment checkout includes `terms_agreed` in Stripe session metadata.
  - Files: `lib/voiceAgent/tools.ts:89`, `lib/voiceAgent/tools.ts:112`, `lib/voiceAgent/tools.ts:299`, `lib/voiceAgent/tools.ts:376`, `lib/voiceAgent/tools.ts:164`

- Voice UI (FAB):
  - Disabled typed email input trigger; email is now handled through voice spelling + confirmation.
  - Other info prompts (name/company/industry/phone) can still show typed input if the agent asks.
  - File: `components/VoiceAgentFAB/index.tsx:120`

## Rationale
- Align voice capture with best practices: spelling out email, readback confirmation, explicit consent.
- Parity with UI-required fields to ensure bookings are complete and consistent.
- Keep booking confirmation atomic: only create after all required details and consent are gathered.

## Expected Flow (Voice)
1. Agent checks availability via tools and proposes actual open slots.
2. After the user picks a time, agent gathers:
   - Full name (>= 2 chars)
   - Email via spelling + readback confirmation; fallback to on-page typing after 2 unclear attempts
   - Company name (>= 2 chars)
   - Industry (>= 2 chars)
   - Employee count (non-empty)
   - Spoken consent to Terms & Refund Policy
3. Agent summarizes details (date, time, timezone, name, email, company, industry, employees) and asks to confirm.
4. Agent books consultation or generates assessment checkout link.
5. Pipeline runs (calendar links/emails/CRM) as before.

## Validation Checklist
- Voice asks to spell email and reads back for confirmation.
- No email text field pops open in the FAB.
- Agent requests company, industry, and employee count after time selection.
- Agent asks for terms consent; consultation bookings include `notes: "Terms agreed via voice consent"`.
- Assessment checkout metadata contains `terms_agreed`.
- Successful booking produces confirmation and email is sent.

## Potential Risks / Why It Might Not Work
- Frontend typed input detection is string-based; we disabled only the email trigger. If the model phrases requests unusually, name/company/industry input boxes may still appear (expected/benign).
- If the LLM ignores the new slot-filling guidance, it may skip consent or employee count. The tool schema requires `employeeCount`, but consent is advisory (optional); mitigation: add a strict post-check step if needed.
- Stripe/assessment flow: extra metadata is harmless, but if env keys are missing, assessment checkout will error (existing behavior).

## Rollback Instructions
To revert this attempt:

```
git revert 8058f80
git push origin main
```

Or hard reset to prior commit (was `7e817f4` before this attempt):

```
git reset --hard 7e817f4
git push -f origin main
```

## Files Touched
- `lib/voiceAgent/agents/prompts.ts`
- `lib/voiceAgent/tools.ts`
- `components/VoiceAgentFAB/index.tsx`

## Notes
- If you want typed capture for all fields off in voice mode, we can disable name/company/industry triggers similarly.
- If you want terms consent mandatory in DB, we can add a dedicated field and thread it through NCB + APIs.

