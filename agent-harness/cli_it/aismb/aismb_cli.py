"""aismb harness CLI — agent-native surface for AI KRE8TION Partners.

Dual mode: `cli-it-aismb` with no subcommand starts a ReplSkin REPL; any
subcommand runs one-shot. The root `--json` flag switches output to
machine-readable JSON on stdout.
"""

from __future__ import annotations

import json
import os
import shlex
from pathlib import Path
from typing import Any
import click

from cli_it.aismb import __version__
from cli_it.aismb.core import project as _project
from cli_it.aismb.core import session as _session
from cli_it.aismb.utils import aismb_backend as _backend
from cli_it.aismb.utils import preview_bundle as _preview
from cli_it.aismb.utils.repl_skin import ReplSkin

PREVIEW_RECIPES = [
    {
        "name": "probe",
        "description": "Node/npm versions plus source package identity via real npm pkg get",
        "needs_project": True,
    },
    {
        "name": "npm",
        "description": "Dump name/version/scripts from source_root via real npm pkg get",
        "needs_project": True,
    },
    {
        "name": "health",
        "description": "HTTP GET landing origin and /api/booking/availability?mode=dates",
        "needs_project": True,
    },
]


_project_option = click.option(
    "-p",
    "--project",
    "project_path",
    required=True,
    type=click.Path(path_type=Path),
    help="Path to the aismb/v1 project JSON file.",
)


def _emit(ctx: click.Context, data: dict, human: list[str]) -> None:
    if (ctx.obj or {}).get("json"):
        click.echo(json.dumps(data, indent=2))
    else:
        for line in human:
            click.echo(line)


def _load(project_path: Path) -> _project.Project:
    try:
        return _project.load_project(project_path)
    except _project.ProjectError as exc:
        raise click.ClickException(str(exc)) from exc


def _backend_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except _backend.BackendError as exc:
        raise click.ClickException(str(exc)) from exc


def _parse_json_object(raw: str | None, flag: str) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        value = json.loads(raw)
    except ValueError as exc:
        raise click.ClickException(f"{flag} is not valid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise click.ClickException(f"{flag} must be a JSON object")
    return value


def _restore(project_path: Path, snapshot: dict[str, Any]) -> _project.Project:
    try:
        return _project.restore_document(project_path, snapshot)
    except _project.ProjectError as exc:
        raise click.ClickException(str(exc)) from exc


@click.group(invoke_without_command=True)
@click.version_option(__version__, prog_name="cli-it-aismb")
@click.option("--json", "as_json", is_flag=True, help="Machine-readable output.")
@click.pass_context
def cli(ctx: click.Context, as_json: bool) -> None:
    """aismb — CLI-It harness for AI KRE8TION Partners (REPL when no subcommand)."""
    ctx.ensure_object(dict)
    ctx.obj["json"] = as_json
    if ctx.invoked_subcommand is None:
        _run_repl()


# --- project ----------------------------------------------------------------


@cli.group()
def project() -> None:
    """Create, open, save, inspect, and mutate aismb/v1 projects."""


@project.command("new")
@click.option("-n", "--name", default="untitled", help="Project name.")
@click.option(
    "-o",
    "--output",
    "output_path",
    required=True,
    type=click.Path(path_type=Path),
    help="Where to write the project JSON.",
)
@click.option(
    "--source-root",
    type=click.Path(path_type=Path),
    default=_project.DEFAULT_SOURCE_ROOT,
    show_default=True,
    help="Absolute path to the aismb checkout.",
)
@click.option(
    "--app",
    type=click.Choice(list(_project.APPS)),
    default="landing",
    show_default=True,
)
@click.option("--landing-origin", default=_project.DEFAULT_LANDING_ORIGIN, show_default=True)
@click.option("--crm-origin", default=_project.DEFAULT_CRM_ORIGIN, show_default=True)
@click.pass_context
def project_new(
    ctx: click.Context,
    name: str,
    output_path: Path,
    source_root: Path,
    app: str,
    landing_origin: str,
    crm_origin: str,
) -> None:
    """Create a new aismb/v1 project file."""
    if output_path.exists():
        raise click.ClickException(f"refusing to overwrite existing file: {output_path}")
    try:
        proj = _project.new_project(
            name,
            source_root=source_root,
            app=app,
            landing_origin=landing_origin,
            crm_origin=crm_origin,
        )
    except _project.ProjectError as exc:
        raise click.ClickException(str(exc)) from exc
    _project.save_project(proj, output_path)
    _session.update_session(output_path, lambda s: s)
    info = _project.project_info(proj, output_path)
    _emit(ctx, info, [f"created project '{name}' at {output_path}"])


@project.command("open")
@_project_option
@click.pass_context
def project_open(ctx: click.Context, project_path: Path) -> None:
    """Validate a project and ensure its session exists."""
    proj = _load(project_path)
    _session.update_session(project_path, lambda s: s)
    info = _project.project_info(proj, project_path)
    info["session"] = _session.session_status(project_path)
    _emit(
        ctx,
        info,
        [
            f"opened '{proj.name}' ({info['requests']} saved requests)",
            f"source: {proj.source_root}",
            f"session: {info['session']['session_file']}",
        ],
    )


@project.command("info")
@_project_option
@click.pass_context
def project_info_cmd(ctx: click.Context, project_path: Path) -> None:
    """Show project details."""
    proj = _load(project_path)
    info = _project.project_info(proj, project_path)
    _emit(ctx, info, [f"{key}: {value}" for key, value in info.items()])


@project.command("save")
@_project_option
@click.pass_context
def project_save(ctx: click.Context, project_path: Path) -> None:
    """Re-save a project canonically (validates + normalizes formatting)."""
    proj = _load(project_path)
    _project.save_project(proj, project_path)
    _emit(
        ctx,
        {"path": str(project_path), "saved": True},
        [f"saved {project_path}"],
    )


@project.command("set")
@_project_option
@click.option("-k", "--key", required=True, help="Field to set.")
@click.option("-v", "--value", required=True, help="New value.")
@click.pass_context
def project_set(ctx: click.Context, project_path: Path, key: str, value: str) -> None:
    """Set one project field (auto-saves, journaled)."""
    proj = _load(project_path)
    before = proj.snapshot()
    try:
        _project.set_field(proj, key, value)
    except _project.ProjectError as exc:
        raise click.ClickException(str(exc)) from exc
    _project.save_project(proj, project_path)
    after = proj.snapshot()
    _session.record_action(
        project_path, {"op": "project.set", "key": key, "before": before, "after": after}
    )
    info = _project.project_info(proj, project_path)
    _emit(ctx, {"set": {key: value}, "project": info}, [f"set {key} = {value}"])


# --- request (mutations, journaled) -----------------------------------------


@cli.group()
def request() -> None:
    """Add, list, and remove saved HTTP requests (undoable mutations)."""


@request.command("add")
@_project_option
@click.option("-n", "--name", required=True, help="Request name.")
@click.option("-m", "--method", default="GET", show_default=True, help="HTTP method.")
@click.option(
    "--app",
    "app_name",
    type=click.Choice(["landing", "crm"]),
    default="landing",
    show_default=True,
)
@click.option("--path", "req_path", required=True, help="URL path beginning with /.")
@click.option("--query", "query_json", default=None, help="JSON object of query params.")
@click.option("--body", "body_json", default=None, help="JSON body for POST/PUT/PATCH.")
@click.option("--headers", "headers_json", default=None, help="JSON object of extra headers.")
@click.pass_context
def request_add(
    ctx: click.Context,
    project_path: Path,
    name: str,
    method: str,
    app_name: str,
    req_path: str,
    query_json: str | None,
    body_json: str | None,
    headers_json: str | None,
) -> None:
    """Add a saved HTTP request to the project (auto-saves, journaled)."""
    proj = _load(project_path)
    before = proj.snapshot()
    body: Any = None
    if body_json:
        try:
            body = json.loads(body_json)
        except ValueError as exc:
            raise click.ClickException(f"--body is not valid JSON: {exc}") from exc
    try:
        item = _project.add_request(
            proj,
            name=name,
            method=method,
            app=app_name,
            path=req_path,
            query=_parse_json_object(query_json, "--query"),
            body=body,
            headers={str(k): str(v) for k, v in _parse_json_object(headers_json, "--headers").items()},
        )
    except _project.ProjectError as exc:
        raise click.ClickException(str(exc)) from exc
    _project.save_project(proj, project_path)
    _session.record_action(
        project_path,
        {"op": "request.add", "key": item["id"], "before": before, "after": proj.snapshot()},
    )
    _emit(
        ctx,
        {"added": item, "requests": len(proj.requests)},
        [f"added request [{item['id']}] {item['method']} {item['path']} ({name})"],
    )


@request.command("list")
@_project_option
@click.pass_context
def request_list(ctx: click.Context, project_path: Path) -> None:
    """List saved HTTP requests."""
    proj = _load(project_path)
    _emit(
        ctx,
        {"requests": proj.requests},
        [
            f"[{i.get('id')}] {i.get('method')} {i.get('app')} {i.get('path')}  {i.get('name')}"
            for i in proj.requests
        ]
        or ["(no saved requests)"],
    )


@request.command("remove")
@_project_option
@click.option("-i", "--id", "request_id", required=True, type=int, help="Request id.")
@click.pass_context
def request_remove(ctx: click.Context, project_path: Path, request_id: int) -> None:
    """Remove a saved request by id (auto-saves, journaled)."""
    proj = _load(project_path)
    before = proj.snapshot()
    try:
        target = _project.remove_request(proj, request_id)
    except _project.ProjectError as exc:
        raise click.ClickException(str(exc)) from exc
    _project.save_project(proj, project_path)
    _session.record_action(
        project_path,
        {"op": "request.remove", "key": request_id, "before": before, "after": proj.snapshot()},
    )
    _emit(
        ctx,
        {"removed": target, "requests": len(proj.requests)},
        [f"removed request [{request_id}] {target.get('name')}"],
    )


# --- session ----------------------------------------------------------------


@cli.group()
def session() -> None:
    """Undo/redo journal and session status."""


@session.command("status")
@_project_option
@click.pass_context
def session_status_cmd(ctx: click.Context, project_path: Path) -> None:
    """Show undo/redo depths and session file location."""
    status = _session.session_status(project_path)
    _emit(ctx, status, [f"{key}: {value}" for key, value in status.items()])


@session.command("undo")
@_project_option
@click.pass_context
def session_undo(ctx: click.Context, project_path: Path) -> None:
    """Undo the most recent journaled mutation."""
    action = _session.pop_undo(project_path)
    if action is None:
        raise click.ClickException("nothing to undo")
    before = action.get("before")
    if not isinstance(before, dict):
        raise click.ClickException("journal entry is missing a before snapshot")
    proj = _restore(project_path, before)
    info = _project.project_info(proj, project_path)
    _emit(
        ctx,
        {"undone": {"op": action.get("op"), "key": action.get("key")}, "project": info},
        [f"undid {action.get('op')} ({action.get('key')})"],
    )


@session.command("redo")
@_project_option
@click.pass_context
def session_redo(ctx: click.Context, project_path: Path) -> None:
    """Redo the most recently undone mutation."""
    action = _session.pop_redo(project_path)
    if action is None:
        raise click.ClickException("nothing to redo")
    after = action.get("after")
    if not isinstance(after, dict):
        raise click.ClickException("journal entry is missing an after snapshot")
    proj = _restore(project_path, after)
    info = _project.project_info(proj, project_path)
    _emit(
        ctx,
        {"redone": {"op": action.get("op"), "key": action.get("key")}, "project": info},
        [f"redid {action.get('op')} ({action.get('key')})"],
    )


# --- app / booking / voice / admin (real HTTP) ------------------------------


@cli.group()
def app() -> None:
    """Probe the running Next.js landing or CRM origin."""


@app.command("health")
@_project_option
@click.option("--app", "app_name", type=click.Choice(["landing", "crm"]), default=None)
@click.pass_context
def app_health(ctx: click.Context, project_path: Path, app_name: str | None) -> None:
    """GET the configured origin and report reachability."""
    proj = _load(project_path)
    origin = proj.origin_for(app_name)
    result = _backend_call(_backend.app_health, origin)
    _emit(
        ctx,
        {"health": result},
        [f"{key}: {value}" for key, value in result.items()],
    )


@cli.group()
def booking() -> None:
    """Landing-page booking APIs (real HTTP)."""


@booking.command("availability")
@_project_option
@click.option("--date", default=None, help="YYYY-MM-DD (required for mode=slots).")
@click.option("--timezone", default="America/Los_Angeles", show_default=True)
@click.option("--mode", type=click.Choice(["slots", "dates"]), default="dates", show_default=True)
@click.pass_context
def booking_availability(
    ctx: click.Context, project_path: Path, date: str | None, timezone: str, mode: str
) -> None:
    """GET /api/booking/availability from the real landing app."""
    proj = _load(project_path)
    result = _backend_call(
        _backend.booking_availability,
        proj.landing_origin,
        date=date,
        timezone=timezone,
        mode=mode,
    )
    payload = result.get("body_json") if result.get("body_json") is not None else result.get("body_text")
    _emit(
        ctx,
        {"availability": payload, "http": {"status": result.get("status"), "url": result.get("url")}},
        [f"HTTP {result.get('status')} {result.get('url')}", json.dumps(payload, indent=2)[:4000]],
    )


@cli.group()
def voice() -> None:
    """Landing-page voice agent APIs (real HTTP)."""


@voice.command("chat")
@_project_option
@click.option("-q", "--question", required=True, help="Utterance to send.")
@click.option("--session-id", default=None, help="Voice session id (default: generated).")
@click.option("--language", type=click.Choice(["en", "es"]), default="en", show_default=True)
@click.pass_context
def voice_chat(
    ctx: click.Context, project_path: Path, question: str, session_id: str | None, language: str
) -> None:
    """POST /api/voice-agent/chat on the real landing app."""
    proj = _load(project_path)
    sid = session_id or f"cli-it-{os.getpid()}"
    result = _backend_call(
        _backend.voice_chat,
        proj.landing_origin,
        question=question,
        session_id=sid,
        language=language,
    )
    payload = result.get("body_json") if result.get("body_json") is not None else result.get("body_text")
    _emit(
        ctx,
        {
            "chat": payload,
            "session_id": sid,
            "http": {"status": result.get("status"), "url": result.get("url")},
        },
        [f"HTTP {result.get('status')} session={sid}", str(payload)[:4000]],
    )


@cli.group()
def admin() -> None:
    """Admin APIs (Bearer ADMIN_API_KEY / project admin_api_key)."""


@admin.command("bookings")
@_project_option
@click.option("--status", default=None, help="Optional status filter.")
@click.option("--limit", default=100, show_default=True, type=int)
@click.pass_context
def admin_bookings(ctx: click.Context, project_path: Path, status: str | None, limit: int) -> None:
    """GET /api/admin/bookings/list from the real landing app."""
    proj = _load(project_path)
    result = _backend_call(
        _backend.admin_bookings,
        proj.landing_origin,
        admin_api_key=proj.admin_api_key or None,
        status=status,
        limit=limit,
    )
    payload = result.get("body_json") if result.get("body_json") is not None else result.get("body_text")
    _emit(
        ctx,
        {"bookings": payload, "http": {"status": result.get("status"), "url": result.get("url")}},
        [f"HTTP {result.get('status')} {result.get('url')}", json.dumps(payload, indent=2)[:4000]],
    )


# --- npm (real node toolchain) ----------------------------------------------


@cli.group()
def npm() -> None:
    """Run the real npm CLI against source_root."""


@npm.command("scripts")
@_project_option
@click.pass_context
def npm_scripts(ctx: click.Context, project_path: Path) -> None:
    """List package.json scripts via real `npm pkg get scripts`."""
    proj = _load(project_path)
    scripts = _backend_call(_backend.npm_pkg_get, proj.source_root, "scripts")
    if isinstance(scripts, str):
        try:
            scripts = json.loads(scripts)
        except ValueError:
            scripts = {"_raw": scripts}
    _emit(
        ctx,
        {"scripts": scripts, "source_root": str(proj.source_root)},
        [f"{name}: {cmd}" for name, cmd in (scripts or {}).items()] or ["(no scripts)"],
    )


@npm.command("run")
@_project_option
@click.option("-s", "--script", required=True, help="npm script name (e.g. test:run).")
@click.option("--arg", "extra_args", multiple=True, help="Extra args after `--`.")
@click.pass_context
def npm_run_cmd(ctx: click.Context, project_path: Path, script: str, extra_args: tuple[str, ...]) -> None:
    """Run an npm script in source_root through the real npm CLI."""
    proj = _load(project_path)
    result = _backend_call(
        _backend.npm_run, proj.source_root, script, extra=list(extra_args) or None
    )
    _emit(
        ctx,
        {"npm": {"script": script, "returncode": result["returncode"], "cwd": result["cwd"]}},
        [
            f"npm run {script} → rc={result['returncode']} in {result['cwd']}",
            (result.get("stdout") or "")[-2000:],
        ],
    )


# --- export (real engine) ----------------------------------------------------


@cli.group()
def export() -> None:
    """Render through the real aismb engine (HTTP or npm) and write a file."""


@export.command("run")
@_project_option
@click.option(
    "-o",
    "--output",
    "output_path",
    required=True,
    type=click.Path(path_type=Path),
    help="Rendered output file.",
)
@click.option(
    "-r",
    "--recipe",
    type=click.Choice(["npm", "health", "probe", "request"]),
    default="npm",
    show_default=True,
)
@click.option("-i", "--id", "request_id", type=int, default=None, help="Saved request id (recipe=request).")
@click.pass_context
def export_run(
    ctx: click.Context,
    project_path: Path,
    output_path: Path,
    recipe: str,
    request_id: int | None,
) -> None:
    """Export via the real engine; verifies the output file exists before success."""
    proj = _load(project_path)
    if recipe == "request" or request_id is not None:
        if request_id is None:
            raise click.ClickException("recipe=request requires --id")
        try:
            item = _project.get_request(proj, request_id)
        except _project.ProjectError as exc:
            raise click.ClickException(str(exc)) from exc
        origin = proj.origin_for(str(item.get("app") or "landing"))
        payload = _backend_call(
            _backend.execute_saved_request,
            origin,
            item,
            admin_api_key=proj.admin_api_key or None,
        )
    elif recipe == "health":
        health = _backend_call(_backend.app_health, proj.landing_origin)
        availability = _backend_call(_backend.booking_availability, proj.landing_origin, mode="dates")
        payload = {"health": health, "availability": availability}
    elif recipe == "probe":
        payload = _backend_call(_backend.probe, proj.source_root)
    else:
        payload = _backend_call(_backend.npm_pkg_get, proj.source_root, "name", "version", "scripts")
    rendered = _backend_call(_backend.write_output, output_path, payload)
    _emit(
        ctx,
        {"output": str(rendered), "recipe": recipe, "bytes": rendered.stat().st_size},
        [f"exported {recipe} → {rendered}"],
    )


@cli.command("backend")
@click.option(
    "-p",
    "--project",
    "project_path",
    type=click.Path(path_type=Path),
    default=None,
    help="Optional aismb/v1 project (adds source_root inspection).",
)
@click.option(
    "--source-root",
    type=click.Path(path_type=Path),
    default=None,
    help="Override source_root when no project is given.",
)
@click.pass_context
def backend_cmd(ctx: click.Context, project_path: Path | None, source_root: Path | None) -> None:
    """Probe node/npm/wrangler and the aismb source tree."""
    root: Path | None = source_root
    if project_path is not None:
        root = _load(project_path).source_root
    info = _backend.probe(root or _project.DEFAULT_SOURCE_ROOT)
    _emit(ctx, info, [f"{key}: {value}" for key, value in info.items()])


# --- preview (producer) ------------------------------------------------------


@cli.group()
def preview() -> None:
    """Produce preview bundles (view them with `cli-it previews`)."""


@preview.command("recipes")
@click.pass_context
def preview_recipes(ctx: click.Context) -> None:
    """List available preview recipes."""
    _emit(
        ctx,
        {"recipes": PREVIEW_RECIPES},
        [f"{r['name']} — {r['description']}" for r in PREVIEW_RECIPES],
    )


def _recipe_named(name: str) -> dict[str, Any]:
    for recipe in PREVIEW_RECIPES:
        if recipe["name"] == name:
            return recipe
    raise click.ClickException(f"unknown recipe {name!r} (try: preview recipes)")


@preview.command("capture")
@_project_option
@click.option("-r", "--recipe", default="npm", show_default=True, help="Recipe name (probe, npm, health).")
@click.option(
    "--root",
    "root_dir",
    type=click.Path(path_type=Path),
    default=None,
    help="Override the previews root (default ~/.cli-it/previews).",
)
@click.pass_context
def preview_capture(
    ctx: click.Context, project_path: Path, recipe: str, root_dir: Path | None
) -> None:
    """Render a recipe with the real aismb engine into a preview bundle."""
    spec = _recipe_named(recipe)
    proj = _load(project_path)
    inputs = {
        "recipe": recipe,
        "project": str(Path(project_path).resolve()),
        "source_root": str(proj.source_root),
        "landing_origin": proj.landing_origin,
    }
    bundle = _preview.prepare_bundle(
        "aismb",
        recipe,
        inputs=inputs,
        project_path=project_path,
        root_dir=root_dir,
    )
    artifacts = bundle / "artifacts"
    summary: dict[str, Any] = {"recipe": recipe, "project": proj.name}
    if recipe == "probe":
        result = _backend_call(_backend.probe, proj.source_root)
        (artifacts / "probe.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        summary["available"] = result.get("available")
        summary["package"] = (result.get("source") or {}).get("name")
    elif recipe == "npm":
        result = _backend_call(_backend.npm_pkg_get, proj.source_root, "name", "version", "scripts")
        (artifacts / "npm-pkg.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        summary["package"] = result.get("name") if isinstance(result, dict) else result
    elif recipe == "health":
        health = _backend_call(_backend.app_health, proj.landing_origin)
        availability = _backend_call(_backend.booking_availability, proj.landing_origin, mode="dates")
        (artifacts / "origin.json").write_text(json.dumps(health, indent=2) + "\n", encoding="utf-8")
        body = availability.get("body_json") if availability.get("body_json") is not None else availability.get("body_text")
        (artifacts / "availability.json").write_text(
            json.dumps(body, indent=2) + "\n" if not isinstance(body, str) else body + "\n",
            encoding="utf-8",
        )
        summary["origin_status"] = health.get("status")
        summary["availability_status"] = availability.get("status")
    else:  # pragma: no cover
        raise click.ClickException(f"unhandled recipe {recipe!r} ({spec['name']})")
    _preview.finalize_bundle(bundle, summary=summary)
    _emit(ctx, {"bundle": str(bundle), "summary": summary}, [str(bundle)])


@preview.command("latest")
@click.option("-r", "--recipe", default="npm", show_default=True)
@click.option("--root", "root_dir", type=click.Path(path_type=Path), default=None)
@click.pass_context
def preview_latest(ctx: click.Context, recipe: str, root_dir: Path | None) -> None:
    """Print the newest bundle path for a recipe."""
    _recipe_named(recipe)
    bundle = _preview.bundle_root("aismb", recipe, root_dir=root_dir)
    if not (bundle / "manifest.json").is_file():
        raise click.ClickException(f"no bundle captured yet for recipe {recipe!r}")
    _emit(ctx, {"bundle": str(bundle)}, [str(bundle)])


def _flatten(value: Any, prefix: str = "", depth: int = 0) -> dict[str, Any]:
    if depth > 6:
        return {prefix: "<max-depth>"}
    if isinstance(value, dict):
        if not value and prefix:
            return {prefix: "<empty>"}
        out: dict[str, Any] = {}
        for key, item in value.items():
            out.update(_flatten(item, f"{prefix}.{key}" if prefix else str(key), depth + 1))
        return out
    if isinstance(value, list):
        if not value:
            return {prefix: "<empty>"}
        out = {}
        for index, item in enumerate(value[:100]):
            out.update(_flatten(item, f"{prefix}[{index}]", depth + 1))
        if len(value) > 100:
            out[f"{prefix}[truncated]"] = len(value)
        return out
    return {prefix: value}


def _bundle_document(bundle: Path) -> dict[str, Any]:
    bundle = Path(bundle).expanduser()
    manifest_path = bundle / "manifest.json"
    if not manifest_path.is_file():
        raise click.ClickException(f"not a preview bundle (no manifest.json): {bundle}")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except ValueError as exc:
        raise click.ClickException(f"malformed manifest in {bundle}: {exc}") from exc
    summary: dict[str, Any] = {}
    summary_path = bundle / "summary.json"
    if summary_path.is_file():
        try:
            summary = json.loads(summary_path.read_text(encoding="utf-8"))
        except ValueError as exc:
            raise click.ClickException(f"malformed summary in {bundle}: {exc}") from exc
    return {"manifest": manifest, "summary": summary}


@preview.command("diff")
@click.argument("bundle_a", type=click.Path(path_type=Path))
@click.argument("bundle_b", type=click.Path(path_type=Path))
@click.pass_context
def preview_diff(ctx: click.Context, bundle_a: Path, bundle_b: Path) -> None:
    """Compare the summaries of two captured bundles."""
    flat_a = _flatten(_bundle_document(bundle_a))
    flat_b = _flatten(_bundle_document(bundle_b))
    keys = sorted(set(flat_a) | set(flat_b))
    changed = {
        k: {"a": flat_a.get(k), "b": flat_b.get(k)}
        for k in keys
        if k in flat_a and k in flat_b and flat_a[k] != flat_b[k]
    }
    added = {k: flat_b[k] for k in keys if k not in flat_a}
    removed = {k: flat_a[k] for k in keys if k not in flat_b}
    result = {
        "a": str(Path(bundle_a).expanduser().resolve()),
        "b": str(Path(bundle_b).expanduser().resolve()),
        "identical": not (changed or added or removed),
        "changed": changed,
        "added": added,
        "removed": removed,
    }
    human = (
        ["bundles are identical"]
        if result["identical"]
        else [
            *(f"~ {k}: {v['a']!r} -> {v['b']!r}" for k, v in changed.items()),
            *(f"+ {k}: {v!r}" for k, v in added.items()),
            *(f"- {k}: {v!r}" for k, v in removed.items()),
        ]
    )
    _emit(ctx, {"diff": result}, human)


def _live_dir(dir_path: Path | None) -> Path:
    if dir_path is not None:
        return Path(dir_path).expanduser().resolve()
    return _preview.DEFAULT_ROOT / "aismb" / "live"


@preview.group("live")
def preview_live() -> None:
    """Append-only trajectory sessions for long-running operations."""


@preview_live.command("start")
@click.option("--dir", "dir_path", type=click.Path(path_type=Path), default=None, help="Live session directory.")
@click.option("--project", "project_path", type=click.Path(path_type=Path), default=None, help="Project this session tracks.")
@click.pass_context
def preview_live_start(ctx: click.Context, dir_path: Path | None, project_path: Path | None) -> None:
    """Start a live trajectory session."""
    target = _live_dir(dir_path)
    meta: dict[str, Any] = {"pid": os.getpid()}
    if project_path is not None:
        proj = _load(project_path)
        meta["project"] = str(project_path)
        meta["name"] = proj.name
    _preview.start_live_session("aismb", target, meta=meta)
    _emit(ctx, {"live": str(target), "status": "running"}, [f"live session at {target}"])


@preview_live.command("push")
@click.option("--dir", "dir_path", type=click.Path(path_type=Path), default=None)
@click.option("--type", "event_type", default="step", show_default=True, help="Event type.")
@click.option("--message", required=True, help="What happened.")
@click.option("--data", "data_json", default=None, help="Optional JSON object attached to the event.")
@click.pass_context
def preview_live_push(
    ctx: click.Context,
    dir_path: Path | None,
    event_type: str,
    message: str,
    data_json: str | None,
) -> None:
    """Append one event to a live trajectory session."""
    target = _live_dir(dir_path)
    if not (target / "session.json").is_file():
        raise click.ClickException(f"no live session at {target} (run `preview live start`)")
    event: dict[str, Any] = {"type": event_type, "message": message}
    if data_json:
        try:
            event["data"] = json.loads(data_json)
        except ValueError as exc:
            raise click.ClickException(f"--data is not valid JSON: {exc}") from exc
    seq = _preview.append_live_trajectory(target, event)
    _emit(ctx, {"seq": seq, "event": event}, [f"[{seq}] {event_type}: {message}"])


@preview_live.command("status")
@click.option("--dir", "dir_path", type=click.Path(path_type=Path), default=None)
@click.pass_context
def preview_live_status(ctx: click.Context, dir_path: Path | None) -> None:
    """Summarize a live trajectory session."""
    target = _live_dir(dir_path)
    if not (target / "session.json").is_file():
        raise click.ClickException(f"no live session at {target} (run `preview live start`)")
    session_doc = json.loads((target / "session.json").read_text(encoding="utf-8"))
    summary = _preview.summarize_trajectory(target)
    _emit(
        ctx,
        {"live": str(target), "session": session_doc, "trajectory": summary},
        [
            f"status: {session_doc.get('status')}",
            f"events: {summary['events']}",
            *[f"  {k}: {v}" for k, v in summary["by_type"].items()],
        ],
    )


@preview_live.command("stop")
@click.option("--dir", "dir_path", type=click.Path(path_type=Path), default=None)
@click.option("--status", default="stopped", show_default=True, help="Terminal status to record.")
@click.pass_context
def preview_live_stop(ctx: click.Context, dir_path: Path | None, status: str) -> None:
    """Mark a live trajectory session finished."""
    target = _live_dir(dir_path)
    if not (target / "session.json").is_file():
        raise click.ClickException(f"no live session at {target} (run `preview live start`)")
    _preview.stop_live_session(target, status=status)
    _emit(ctx, {"live": str(target), "status": status}, [f"live session {target} -> {status}"])


# The skill generator flattens nested `preview live` to `live …`. Register
# the same command objects at the root so documented invocation is real.
cli.add_command(
    click.Group(
        "live",
        commands=preview_live.commands,
        help="Append-only trajectory sessions for long-running operations.",
    )
)


# --- REPL -------------------------------------------------------------------

_REPL_COMMANDS = {
    "project new|open|info|save|set": "manage aismb/v1 project files",
    "request add|list|remove": "undoable saved HTTP requests",
    "session status|undo|redo": "journal control",
    "app health": "GET the running origin",
    "booking availability": "real GET /api/booking/availability",
    "voice chat": "real POST /api/voice-agent/chat",
    "admin bookings": "real GET /api/admin/bookings/list",
    "npm scripts|run": "real npm against source_root",
    "export run": "write an artifact via npm or HTTP",
    "preview capture|recipes|latest|diff": "produce preview bundles",
    "preview live start|push|status|stop": "trajectory sessions",
    "help / exit": "this help / leave the REPL",
}


def _run_repl() -> None:
    skin = ReplSkin("aismb", __version__)
    skin.print_banner()
    prompt = skin.create_prompt_session()
    while True:
        try:
            line = prompt("aismb> ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not line:
            continue
        if line in ("exit", "quit"):
            break
        if line == "help":
            skin.help(_REPL_COMMANDS)
            continue
        try:
            cli.main(
                args=shlex.split(line),
                prog_name="cli-it-aismb",
                standalone_mode=False,
            )
        except click.ClickException as exc:
            skin.error(exc.format_message())
        except click.exceptions.Abort:
            skin.warning("aborted")
        except ValueError as exc:
            skin.error(str(exc))
    skin.print_goodbye()


if __name__ == "__main__":
    cli()
