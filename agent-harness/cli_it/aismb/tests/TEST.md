# aismb harness — test plan (Phase 4, written before test code)

## Scope

Two suites, per HARNESS.md:

- `test_core.py` — **unit**: data layer, session journal + locking, and the
  Click surface via `CliRunner`. Must pass with no Next.js server, no NCB,
  and no live HTTP. Node/npm may be present; unit tests must not require
  them except the optional backend-probe assertion that `available` is a
  bool.
- `test_full_e2e.py` — **e2e**: drives the installed `cli-it-aismb` entry
  point (fallback `python -m cli_it.aismb`) as a subprocess with the real
  node/npm engine; skips cleanly if node or npm is unavailable. HTTP recipes
  (`health`, booking, voice, admin) skip when the landing origin is down.

## Command inventory

| Group | Command | Unit | e2e |
|-------|---------|------|-----|
| project | new, open, info, save, set | yes | new + info |
| request | add, list, remove | yes | add ×2 + undo |
| session | status, undo, redo | yes | undo |
| app | health | no (HTTP) | skip if origin down |
| booking | availability | no (HTTP) | skip if origin down |
| voice | chat | no (HTTP) | skip if origin down |
| admin | bookings | no (HTTP) | skip if origin down |
| npm | scripts, run | no (engine) | scripts via npm pkg get |
| export | run | no (engine) | recipe=npm writes a file |
| preview | recipes, capture, latest, diff | recipes via CliRunner | capture npm bundle |
| preview live / live | start, push, status, stop | CliRunner | optional |
| root | backend, --json, --help, --version | backend json | help/version/REPL |

## Unit cases (test_core.py)

| Area | Case | Expected |
|------|------|----------|
| project | new/save/load round-trip | fields preserved; format `aismb/v1` |
| project | load missing / malformed / wrong-format file | `ProjectError` |
| project | `set_field` known key / unknown key / bad app | updates or `ProjectError` |
| project | `add_request` / `remove_request` / `get_request` | ids increment; missing id errors |
| project | request path must start with `/` | `ProjectError` |
| session | record → status | undo depth 1, redo 0; lock file valid JSON |
| session | undo/redo stack movement | pop_undo → redo grows; pop_redo → back |
| session | undo empty journal | returns None |
| session | concurrent writers (threads) | all actions journaled, file valid |
| cli | `project new` refuses overwrite | exit 1 |
| cli | `project new/info/open/save/set` | exit 0, JSON parses with `--json` |
| cli | `request add/list/remove` | journaled, auto-saved |
| cli | `session undo/redo` end-to-end via CliRunner | project file reflects change |
| cli | unknown request id remove | exit 1, readable message |
| cli | usage error (missing required opt) | exit 2 |
| cli | `preview recipes` | lists probe, npm, health |
| cli | `backend --json` | `available` is bool |
| cli | live start/push/status/stop | trajectory seq increments |

## e2e cases (test_full_e2e.py)

| Case | Expected |
|------|----------|
| entry point `--help` and `--version` | exit 0 |
| full workflow: new → request add ×2 → info --json → undo → request list | counts correct at each step |
| `export run -r npm` | output file exists, contains package name from real `npm pkg get` |
| `preview capture -r npm` | bundle with manifest.json/summary.json/artifacts; protocol `preview-bundle/v1` |
| `preview diff` identical capture | `identical: true` |
| REPL smoke: pipe `help\nexit\n` | banner printed, exit 0 |
| `backend --json` | `available` true when node+npm present |
| HTTP `booking availability` | skip unless landing origin answers |

## Edge cases

| Case | Expected |
|------|----------|
| missing project file | exit 1, "project file not found" |
| malformed JSON project | exit 1 |
| locked session torn JSON | session resets to default format, does not crash |
| export with missing backend | e2e skipped (`pytest.mark.skipif`) |
| preview capture unknown recipe | exit 1 |
| health recipe with origin down | exit 1, install hint naming wrangler/npm |

## Exit-code contract

0 success · 1 command failure (ClickException) · 2 usage error.

---

## Results (Phase 6 — appended after runs)

### 2026-10-01 — initial implementation

- Environment: macOS (arm64), CPython 3.14 in `/Users/kcdacre8tor/Developer/aismb/agent-harness/.venv`, node v24.7.0 + npm 11.5.1 on PATH. Landing HTTP origin `http://127.0.0.1:3000` was **not** running.
- `pytest /Users/kcdacre8tor/Developer/aismb/agent-harness` → **23 passed, 1 skipped in ~1s**
  - `test_core.py`: 17 unit (project, session lock, CliRunner, live trajectory, backend probe JSON).
  - `test_full_e2e.py`: 6 e2e via installed `cli-it-aismb` entry point (help/version, journal workflow, `export run -r npm` through real `npm pkg get`, `preview capture -r npm` preview-bundle/v1, backend probe, REPL smoke).
  - 1 skip: `test_http_booking_availability_or_skip` — landing origin not reachable. Honest skip, not a silent pass.
- No harness-code fix required during bring-up. `pip install -e` + `cli-it-aismb --help` / `--json backend` / REPL (`help`/`exit`) verified.
