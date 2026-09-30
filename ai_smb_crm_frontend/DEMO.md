# Live Voice Demo

This demo keeps the agentic path live. It does not use canned responses:

```text
microphone -> OpenAI transcription -> CRM agent/tool call -> NCB record -> OpenAI speech
```

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `NCB_INSTANCE`, `NCB_AUTH_API_URL`, `NCB_DATA_API_URL`, `NCB_SECRET_KEY`, and `OPENAI_API_KEY`. Do **not** set `EMAILIT_API_KEY` for this demo. Product mail is REST in production (GitHub → Cloudflare). Auth mail is NCB SMTP. See `docs/EMAIL.md`.
3. Use a demo CRM account with seeded records. The agent uses the authenticated account's real CRM data.
4. Start the CRM:

```bash
npm run dev
```

The app runs at `http://localhost:3001`.

## Demo path

1. Sign in with the demo CRM account.
2. Open the voice operator.
3. Try: `Show me qualified leads`.
4. Try: `Move Acme Plumbing to proposal sent`.
5. Refresh the pipeline page and confirm the persisted change.
6. Try: `What bookings do I have this week?`.

The voice panel displays the transcription, spoken response, and the real tool names executed. Tool arguments and record IDs are not exposed in the UI.

## Live verification

The normal test suite skips external-service tests. Run the live CRM suites only when the CRM server and credentials are configured:

```bash
RUN_INTEGRATION=true npm exec vitest run __tests__/integration/crmAgent.system.test.ts
RUN_INTEGRATION=true npm exec vitest run __tests__/integration/voiceAgent.ux.test.ts
```

For a different server:

```bash
RUN_INTEGRATION=true API_BASE=https://demo.example.com npm exec vitest run __tests__/integration/voiceAgent.ux.test.ts
```

The voice UX test expects a real `/api/auth/sign-in`, `/api/agent/chat`, `/api/agent/transcribe`, and `/api/agent/speak` path. It verifies the live response shape and session behavior; it does not replace OpenAI or CRM calls with fixtures.
