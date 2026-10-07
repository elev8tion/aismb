---
name: cli-it-aismb
description: "Stateful CLI-It harness for AI KRE8TION Partners (aismb): JSON project files with locked sessions, undo/redo journaling, and rendering through the real Next.js / npm / HTTP engine — never a toy reimplementation of booking, ROI, NCB, or the voice agent."
version: 0.1.0
license: Apache-2.0
---

# Aismb — agent harness CLI

`cli-it-aismb` is a CLI-It harness: a stateful command-line interface that
drives the real Aismb software. Running it with no subcommand
starts an interactive REPL; every command also works non-interactively.

## Installation

```bash
pip install -e /Users/kcdacre8tor/Developer/aismb/agent-harness
cli-it-aismb --help
```

## Command groups

| Group | Command | Description |
|-------|---------|-------------|
| `project` | `new` | Create a new aismb/v1 project file. |
| `project` | `open` | Validate a project and ensure its session exists. |
| `project` | `info` | Show project details. |
| `project` | `save` | Re-save a project canonically (validates + normalizes formatting). |
| `project` | `set` | Set one project field (auto-saves, journaled). |
| `request` | `add` | Add a saved HTTP request to the project (auto-saves, journaled). |
| `request` | `list` | List saved HTTP requests. |
| `request` | `remove` | Remove a saved request by id (auto-saves, journaled). |
| `session` | `status` | Show undo/redo depths and session file location. |
| `session` | `undo` | Undo the most recent journaled mutation. |
| `session` | `redo` | Redo the most recently undone mutation. |
| `app` | `health` | GET the configured origin and report reachability. |
| `booking` | `availability` | GET /api/booking/availability from the real landing app. |
| `voice` | `chat` | POST /api/voice-agent/chat on the real landing app. |
| `admin` | `bookings` | GET /api/admin/bookings/list from the real landing app. |
| `npm` | `scripts` | List package.json scripts via real `npm pkg get scripts`. |
| `npm` | `run` | Run an npm script in source_root through the real npm CLI. |
| `export` | `run` | Export via the real engine; verifies the output file exists before success. |
| `root` | `backend` | Probe node/npm/wrangler and the aismb source tree. |
| `preview` | `recipes` | List available preview recipes. |
| `preview` | `capture` | Render a recipe with the real aismb engine into a preview bundle. |
| `preview` | `latest` | Print the newest bundle path for a recipe. |
| `preview` | `diff` | Compare the summaries of two captured bundles. |
| `live` | `start` | Start a live trajectory session. |
| `live` | `push` | Append one event to a live trajectory session. |
| `live` | `status` | Summarize a live trajectory session. |
| `live` | `stop` | Mark a live trajectory session finished. |

## Examples

**Show all commands**

```bash
cli-it-aismb --help
```

**Create a new aismb/v1 project file.**

```bash
cli-it-aismb project new
```

**Add a saved HTTP request to the project (auto-saves, journaled).**

```bash
cli-it-aismb request add
```

**Show undo/redo depths and session file location.**

```bash
cli-it-aismb session status
```

**GET the configured origin and report reachability.**

```bash
cli-it-aismb app health
```

**GET /api/booking/availability from the real landing app.**

```bash
cli-it-aismb booking availability
```

**POST /api/voice-agent/chat on the real landing app.**

```bash
cli-it-aismb voice chat
```

**GET /api/admin/bookings/list from the real landing app.**

```bash
cli-it-aismb admin bookings
```

**List package.json scripts via real `npm pkg get scripts`.**

```bash
cli-it-aismb npm scripts
```

**Export via the real engine; verifies the output file exists before success.**

```bash
cli-it-aismb export run
```

**Probe node/npm/wrangler and the aismb source tree.**

```bash
cli-it-aismb backend
```

**List available preview recipes.**

```bash
cli-it-aismb preview recipes
```

**Start a live trajectory session.**

```bash
cli-it-aismb live start
```

**Machine-readable output**

```bash
cli-it-aismb --json <group> <command>
```

## Agent guidance

- Pass `--json` on the root command for machine-readable output, then parse
  stdout as JSON.
- Always use **absolute paths** for project and output files.
- Check the process return code after every invocation; non-zero means the
  command failed and stderr explains why.
- Verify that expected output files exist after mutating or exporting.
- The REPL is for humans; agents should prefer one-shot subcommands.
- Session state is protected by an exclusive file lock — run one mutating
  command at a time per project.
