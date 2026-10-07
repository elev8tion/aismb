# AISMB.md — analysis & architecture record

Phase 1–2 record required by HARNESS.md. The harness wraps the real
AI KRE8TION / aismb software (Next.js 15 landing + CRM on Cloudflare Pages),
never a toy reimplementation of booking, ROI, NCB, or the voice agent.

## Path protocol (Phase 0)

| Role | Path |
|------|------|
| `TARGET_PROJECT` | `/Users/kcdacre8tor/Developer/aismb` |
| `HARNESS_PATH` | `/Users/kcdacre8tor/Developer/aismb/agent-harness` |
| `CLI_IT_REPO_ROOT` | `/Users/kcdacre8tor/cli-it` |

Validated before the first harness-local mkdir: lexical basename of the
harness is exactly `agent-harness`; `resolved(HARNESS_PATH) ==
resolved(TARGET_PROJECT) / "agent-harness"`; `CLI_IT_REPO_ROOT` is distinct;
the harness is not an escaping symlink. Nested `cli_it/aismb/` destinations
stay under the validated harness. Canonical skill + registry writes root at
`CLI_IT_REPO_ROOT`.

Source is a local checkout of `https://github.com/elev8tion/aismb.git`
(package name `ai-smb-partners`, CRM workspace `ai_smb_crm_frontend`).

---

## Phase 1 — Codebase analysis

### Backend engine

aismb is a **Next.js 15 App Router** monorepo deployed on **Cloudflare Pages**
(edge runtime). Work is done by:

1. **Node.js / npm / npx / wrangler** — install, test, `pages:build`,
   `wrangler dev`, `wrangler pages deploy`.
2. **HTTP APIs of the running app** — landing (`kre8tion.com` /
   `http://127.0.0.1:3000`) and CRM (`app.kre8tion.com` /
   `http://127.0.0.1:3001`).
3. **NocodeBackend (NCB) OpenAPI** — `https://openapi.nocodebackend.com`
   with `?Instance=36905_ai_smb_crm`. The *app* owns this client
   (`lib/ncb/client.ts`); the harness talks to the app, not to NCB directly.
4. **OpenAI** (Whisper STT, GPT chat, gpt-4o-mini-tts) and **Stripe** /
   **EmailIt REST** — invoked only by the running app.

There is no `bpy`-style in-process Python API. The harness locates Node/npm
and issues HTTP against the real Next.js routes. All of that lives in
`utils/aismb_backend.py`.

Local invocation (from `README.md` / `CLAUDE.md`):

```bash
npm install --legacy-peer-deps
npx wrangler dev          # landing (preferred)
npm run dev               # next dev (landing)
cd ai_smb_crm_frontend && npm run dev   # CRM on :3001
npm run test:run
npm run pages:build
```

### GUI → API map

Landing (kre8tion.com) — cited from `app/api/**/route.ts`:

| GUI action | Programmatic equivalent |
|------------|-------------------------|
| Open booking calendar / pick a day | `GET /api/booking/availability?date=YYYY-MM-DD&timezone=…&mode=slots\|dates` |
| Submit a meeting or assessment booking | `POST /api/booking/create` (Zod `createBookingRequestSchema`) |
| Pay $250 assessment | `POST /api/booking/checkout`, `GET /api/booking/stripe-session` |
| ROI calculator → email report | `POST /api/leads/roi` `{email, tier, locale, metrics}` |
| Voice FAB: talk | `POST /api/voice-agent/transcribe`, `/chat`, `/speak` |
| Admin bookings dashboard | `GET /api/admin/bookings/list` (Bearer `ADMIN_API_KEY` or `admin-token` cookie; `middleware.ts`) |
| Admin create booking | `POST /api/admin/bookings/create` |
| Auth / data proxy | `/api/auth/[...path]`, `/api/data/[...path]` |

CRM (app.kre8tion.com) — cited from `ai_smb_crm_frontend/`:

| GUI action | Programmatic equivalent |
|------------|-------------------------|
| Voice Operator FAB | `POST /api/agent/transcribe`, `/chat`, `/speak` (47 tools in `lib/agent/functions.ts`) |
| Leads / pipeline / bookings UI | authenticated ` /api/data/[...path]` NCB Data Proxy |
| Demo login | `POST /api/demo-login` |
| Contracts | `/api/contracts/{create,send,sign,countersign,status}` |
| Stripe invoices / subscriptions | `/api/integrations/stripe/…` |

The harness exposes the **read-mostly, agent-useful** landing routes
(`availability`, `voice chat`, `admin bookings list`) plus npm scripts.
Write bookings/ROI through the real HTTP API only when the operator
explicitly runs a saved request — never by reimplementing `createBooking.ts`
or `roiCalculator.ts`.

### Data model

- **App-native**: NCB tables (`leads`, `bookings`, `availability_settings`,
  `blocked_dates`, pipeline, contacts, companies, partnerships, …) plus
  Cloudflare KV (`VOICE_SESSIONS`, `RATE_LIMIT_KV`, `COST_MONITOR_KV`,
  `RESPONSE_CACHE_KV`). Not safely writable out-of-process; mutations go
  through the app or NCB OpenAPI with secrets.
- **Shared types**: `packages/shared-types` (`@kre8tion/shared-types`) —
  Zod schemas for bookings, leads, ROI payloads.
- **Harness-native** `aismb/v1` JSON: connection + request catalog the
  agent can journal. Safely writable out-of-process. Fields: `name`,
  `source_root`, `app` (`landing`\|`crm`\|`both`), `landing_origin`,
  `crm_origin`, `admin_api_key`, `requests[]` (`{id,name,method,app,path,query,body,headers}`),
  `metadata`.

### Existing CLIs

The repo ships npm scripts, not a first-party agent CLI:

| Script | What it wraps |
|--------|----------------|
| `npm run dev` / `npm run start` | Next.js |
| `npx wrangler dev` / `pages:build` | Cloudflare |
| `npm run test` / `test:run` | Vitest |
| `npm run test:admin-booking` | `scripts/test-admin-booking.js` |
| `scripts/run-system-tests.sh` | system tests |

The harness **wraps** `node`, `npm`, `npx`, `wrangler`, and the HTTP
surface. It does not duplicate Vitest, wrangler, or NCB.

### Undo system

The app has no document-level undo (HTTP + NCB + KV). The harness owns a
journal at `<project>.session.json` with exclusive locking
(`guides/session-locking.md`). Mutations of the harness project
(`project set`, `request add`/`remove`) record before/after snapshots.
Remote NCB writes are **not** inverted by undo (cannot unsend email or
un-charge Stripe); those go through `export`/`request` execution without
journal inversion.

---

## Phase 2 — CLI architecture

Entry point: `cli-it-aismb`. REPL when invoked with no subcommand
(`invoke_without_command=True` + ReplSkin). Root `--json` for machine output.

### Command groups

| Group | Commands | Notes |
|-------|----------|-------|
| `project` | `new`, `open`, `info`, `save`, `set` | `set` is journaled |
| `request` | `add`, `list`, `remove` | journaled catalog of HTTP calls |
| `session` | `status`, `undo`, `redo` | snapshot restore |
| `app` | `health` | real HTTP GET of the configured origin |
| `booking` | `availability` | real `GET /api/booking/availability` |
| `voice` | `chat` | real `POST /api/voice-agent/chat` |
| `admin` | `bookings` | real `GET /api/admin/bookings/list` |
| `npm` | `scripts`, `run` | real `npm pkg get` / `npm run` |
| `export` | `run` | execute a saved request **or** `npm`/`health` recipe; verify output file |
| `preview` | `recipes`, `capture`, `latest`, `diff` | preview-bundle/v1 producer |
| `preview live` / `live` | `start`, `push`, `status`, `stop` | trajectory sessions |
| root | `backend` | probe node/npm/wrangler/source |

### State model

- **Project file**: `aismb/v1` JSON (absolute paths in examples).
- **Session file**: sibling `<project>.session.json`, format
  `aismb-session/v1`, `undo[]`/`redo[]` of `{op, key, before, after}`.
- **Locking**: `os.open(O_RDWR|O_CREAT)` then exclusive `fcntl.flock` on
  the same handle; read, mutate, seek/truncate, write, `fsync`, unlock.
  Never call the backend while holding the lock.
- **Concurrency**: one mutating command at a time per project file.

### Dual output

Root `--json`. Every command goes through `_emit(ctx, data, human_lines)`.
Stable keys: `path`, `format`, `name`, `requests`, `session`, `backend`,
`status`, `bundle`, `output`, `bytes`, `undone`, `redone`.

Exit codes: `0` ok · `1` `ClickException` · `2` usage.

### REPL

No subcommand → ReplSkin banner (skill path), prompt `aismb> `, `help` /
`exit`. Agents should prefer one-shot subcommands.

### Preview recipes

Honesty rule: artifacts come from the real software. Missing backend →
fail with install hint, never fabricate.

| Recipe | Renderer | Artifacts |
|--------|----------|-----------|
| `probe` | `node --version` + `npm --version` + package.json via `npm pkg get` | `probe.json` |
| `npm` | `npm pkg get name version scripts` in `source_root` | `npm-pkg.json` |
| `health` | HTTP GET `landing_origin/` and `/api/booking/availability?mode=dates` | `origin.txt`, `availability.json` |

Live sessions: `preview live start|push|status|stop` (also aliased as
`live …` because the skill generator flattens nested groups).

### Install hint (backend missing)

```
Install Node.js 20+ and npm. Then in /Users/kcdacre8tor/Developer/aismb:
  npm install --legacy-peer-deps
  npx wrangler dev          # landing HTTP
  # CRM: cd ai_smb_crm_frontend && npm run dev
```
