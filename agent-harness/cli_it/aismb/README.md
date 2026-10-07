# aismb harness

Stateful CLI-It harness for AI KRE8TION Partners (aismb): JSON project files with locked sessions, undo/redo journaling, and rendering through the real Next.js / npm / HTTP engine — never a toy reimplementation of booking, ROI, NCB, or the voice agent.

## Usage

```bash
cli-it-aismb
cli-it-aismb project new -n demo -o /tmp/aismb.json --source-root /Users/kcdacre8tor/Developer/aismb
cli-it-aismb request add -p /tmp/aismb.json -n availability --path /api/booking/availability --query '{"mode":"dates"}'
cli-it-aismb --json project info -p /tmp/aismb.json
cli-it-aismb session undo -p /tmp/aismb.json
cli-it-aismb export run -p /tmp/aismb.json -o /tmp/aismb-npm.json -r npm
cli-it-aismb preview capture -p /tmp/aismb.json -r npm
```

Agents: read `skills/SKILL.md` (or the repo-root copy at
`/Users/kcdacre8tor/cli-it/skills/cli-it-aismb/SKILL.md`).
