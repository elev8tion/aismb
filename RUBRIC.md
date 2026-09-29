# Acceptance rubric — Production QA: landing page, CRM, DNS, auth, voice, and deployment

## Objective

Programmatically prove that the deployed landing page, CRM, authentication, DNS, deployment pipelines, and live voice/agent workflows meet the current delivery contract.

## Scope

### In scope
- Repository integrity, vnodes freshness, and local build/test/lint/type checks.
- GitHub Actions deployment status for landing and CRM.
- Cloudflare DNS resolution and Pages custom-domain behavior.
- Landing and CRM HTTP health, redirects, protected-route behavior, and auth-provider behavior.
- Live CRM sign-in, agent chat, CRM agent system tests, and voice UX integration tests.
- Evidence capture, residual-risk reporting, and reproducible commands.

### Out of scope
- DNS changes beyond the two landing hostnames already configured.
- Manual microphone hardware testing; endpoint and live integration coverage are run programmatically.
- Third-party provider internals, email inbox delivery, Stripe live charges, and calendar invite delivery.
- Performance/load testing beyond bounded smoke requests.

## Constraints and assumptions

- Production targets: `https://kre8tion.com`, `https://www.kre8tion.com`, `https://app.kre8tion.com`.
- Landing Pages project: `kre8tion-app`; CRM Pages project: `ai-smb-crm`.
- Live integration credentials are supplied through environment variables and never written to evidence.
- No source-code mutation is permitted during QA except QA evidence/rubric artifacts; repairs require a new recorded cycle.
- Repair limit: 2 cycles.
- Phase gate: every phase must score 100/100.

## QA matrix

| ID | Acceptance check | Command/observation | Evidence |
|---|---|---|---|
| QA-01 | Git tree clean and branch synchronized | `git status --short --branch` | `environment.txt` |
| QA-02 | vnodes index current | `vnodes index && vnodes check` | `vnodes.txt` |
| QA-03 | Root static checks pass | `npm run lint`, `npm run build`, `npm run test:run` | `root-checks.txt` |
| QA-04 | CRM static checks pass | `npm run lint`, `tsc --noEmit`, focused tests | `crm-checks.txt` |
| QA-05 | Latest landing deployment succeeds | `gh run list` | `github-runs.txt` |
| QA-06 | Latest CRM deployment succeeds | `gh run list` | `github-runs.txt` |
| QA-07 | DNS resolves apex, www, and app | `dig +short` for A/CNAME | `dns.txt` |
| QA-08 | Landing apex serves HTTP 200 | `curl -L https://kre8tion.com` | `http-health.txt` |
| QA-09 | Landing www serves HTTP 200 | `curl -L https://www.kre8tion.com` | `http-health.txt` |
| QA-10 | CRM serves HTTP 200 | `curl -L https://app.kre8tion.com` | `http-health.txt` |
| QA-11 | Auth providers endpoint returns configured providers | `curl /api/auth-providers` | `http-health.txt` |
| QA-12 | Invalid credentials are rejected | `POST /api/auth/sign-in/email` expects 401 | `http-health.txt` |
| QA-13 | Unauthenticated protected data is rejected | `GET /api/data/read/leads` expects 401 | `http-health.txt` |
| QA-14 | Live CRM sign-in succeeds | production integration test | `voice-live.txt` |
| QA-15 | Live agent/CRM system suite passes | `crmAgent.system.test.ts` | `crm-live.txt` |
| QA-16 | Live voice UX suite passes | `voiceAgent.ux.test.ts` | `voice-live.txt` |
| QA-17 | No committed hardcoded live test password remains | `rg` security scan | `security.txt` |
| QA-18 | Final evidence is reproducible and limitations disclosed | rubric deep verification | `RUBRIC-REPORT.md` |

## Phase scorecard

| Phase | Check | Weight | Verification | Required evidence | Status |
|---|---|---:|---|---|---|
| 1. Scope and preflight | Scope and inputs frozen | 25 | Review this file and frozen hash | `file:RUBRIC.md` | pending |
| 1. Scope and preflight | Environment recorded | 25 | Capture versions, target URLs, branch, and run IDs | `file:.rubric-gate/evidence/environment.txt` | pending |
| 1. Scope and preflight | Safety boundaries recorded | 25 | Confirm secrets are not written to evidence | `file:.rubric-gate/evidence/security.txt` | pending |
| 1. Scope and preflight | Execution plan bounded | 25 | QA matrix and repair limit reviewed | `file:RUBRIC.md` | pending |
| 2. Execution | Required evidence produced | 50 | Run all QA matrix commands | `file:.rubric-gate/evidence/` | pending |
| 2. Execution | Scope preserved | 50 | Confirm only QA artifacts changed | `file:.rubric-gate/evidence/environment.txt` | pending |
| 3. Verification | Functional checks pass | 50 | Review QA-05 through QA-16 | `file:.rubric-gate/evidence/` | pending |
| 3. Verification | Quality/security checks pass | 50 | Review QA-01 through QA-04 and QA-17 | `file:.rubric-gate/evidence/` | pending |
| 4. Repair and retest | Failures mapped to causes | 25 | Record any failed check and cause | `file:.rubric-gate/evidence/repair-log.txt` | pending |
| 4. Repair and retest | Prior source snapshotted | 25 | Confirm no source repair was needed or record snapshot | `file:.rubric-gate/evidence/repair-log.txt` | pending |
| 4. Repair and retest | Affected checks freshly rerun | 25 | Fresh successful reruns after any failure | `file:.rubric-gate/evidence/` | pending |
| 4. Repair and retest | No known material defect remains | 25 | Review residual risks | `file:.rubric-gate/evidence/repair-log.txt` | pending |
| 5. Final proof | All prior gates pass | 25 | `rubric_gate.py verify --deep` | `file:RUBRIC-REPORT.md` | pending |
| 5. Final proof | Hash/math checks pass | 25 | Rubric validator | `file:.rubric-gate/events.jsonl` | pending |
| 5. Final proof | Reproduction commands work | 25 | Re-run command summary | `file:.rubric-gate/evidence/` | pending |
| 5. Final proof | Limitations disclosed | 25 | Report review | `file:RUBRIC-REPORT.md` | pending |

## Repair log

| # | Phase | Cycle | Reason | Outcome |
|---|---|---:|---|---|
| — | — | — | No source repair permitted during this QA run | pending |

## Revisions

| Revision | Reason | Changed criteria | Approved by |
|---|---|---|---|
| 1 | Initial production QA contract | Created QA matrix and evidence requirements | User request |
