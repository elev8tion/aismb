"""aismb e2e tests — subprocess against the installed entry point with the
real node/npm engine. Skips cleanly when the backend is unavailable.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

from cli_it.aismb.core import project as _project
from cli_it.aismb.utils import aismb_backend

pytestmark = pytest.mark.skipif(
    not aismb_backend.backend_available(), reason="aismb engine not available (need node + npm)"
)

SOURCE_ROOT = Path(_project.DEFAULT_SOURCE_ROOT)
LANDING_ORIGIN = _project.DEFAULT_LANDING_ORIGIN


def _base_cmd() -> list[str]:
    exe = shutil.which("cli-it-aismb")
    if exe:
        return [exe]
    return [sys.executable, "-m", "cli_it.aismb"]


def run_cli(*args: str, input_text: str | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        [*_base_cmd(), *args], capture_output=True, text=True, input=input_text
    )


def _origin_up() -> bool:
    try:
        result = aismb_backend.app_health(LANDING_ORIGIN, timeout=2)
    except aismb_backend.BackendError:
        return False
    return bool(result.get("reachable"))


def test_help_and_version():
    assert run_cli("--help").returncode == 0
    version = run_cli("--version")
    assert version.returncode == 0 and "0.1.0" in version.stdout


def test_full_workflow_new_add_undo(tmp_path):
    project = tmp_path / "e2e.json"
    created = run_cli(
        "project",
        "new",
        "-n",
        "e2e",
        "-o",
        str(project),
        "--source-root",
        str(SOURCE_ROOT),
    )
    assert created.returncode == 0, created.stderr

    for name, path in (("one", "/api/booking/availability"), ("two", "/api/voice-agent/chat")):
        added = run_cli("request", "add", "-p", str(project), "-n", name, "--path", path)
        assert added.returncode == 0, added.stderr

    info = run_cli("--json", "project", "info", "-p", str(project))
    assert info.returncode == 0
    assert json.loads(info.stdout)["requests"] == 2

    assert run_cli("session", "undo", "-p", str(project)).returncode == 0
    listed = run_cli("--json", "request", "list", "-p", str(project))
    assert [i["name"] for i in json.loads(listed.stdout)["requests"]] == ["one"]


def test_export_renders_via_real_npm(tmp_path):
    if not (SOURCE_ROOT / "package.json").is_file():
        pytest.skip(f"aismb source not found at {SOURCE_ROOT}")
    project = tmp_path / "render.json"
    run_cli(
        "project",
        "new",
        "-n",
        "render",
        "-o",
        str(project),
        "--source-root",
        str(SOURCE_ROOT),
    )
    output = tmp_path / "out.json"
    result = run_cli("export", "run", "-p", str(project), "-o", str(output), "-r", "npm")
    assert result.returncode == 0, result.stderr + result.stdout
    assert output.is_file()
    doc = json.loads(output.read_text())
    blob = json.dumps(doc)
    assert "ai-smb-partners" in blob or "name" in blob


def test_preview_capture_writes_protocol_bundle(tmp_path):
    if not (SOURCE_ROOT / "package.json").is_file():
        pytest.skip(f"aismb source not found at {SOURCE_ROOT}")
    project = tmp_path / "prev.json"
    run_cli(
        "project",
        "new",
        "-n",
        "prev",
        "-o",
        str(project),
        "--source-root",
        str(SOURCE_ROOT),
    )
    previews_root = tmp_path / "previews"
    result = run_cli(
        "--json",
        "preview",
        "capture",
        "-p",
        str(project),
        "-r",
        "npm",
        "--root",
        str(previews_root),
    )
    assert result.returncode == 0, result.stderr + result.stdout
    bundle = json.loads(result.stdout)["bundle"]
    manifest = json.loads((previews_root / "aismb" / "npm" / "manifest.json").read_text())
    assert manifest["protocol"] == "preview-bundle/v1"
    assert manifest["status"] == "complete"
    assert manifest["fingerprint"].startswith("sha256:")
    summary = json.loads((previews_root / "aismb" / "npm" / "summary.json").read_text())
    assert any(a["path"] == "artifacts/npm-pkg.json" for a in summary["artifacts"])
    assert bundle.endswith("aismb/npm")

    latest = run_cli("--json", "preview", "latest", "-r", "npm", "--root", str(previews_root))
    assert latest.returncode == 0
    assert json.loads(latest.stdout)["bundle"] == bundle

    diff = run_cli("--json", "preview", "diff", bundle, bundle)
    assert diff.returncode == 0
    assert json.loads(diff.stdout)["diff"]["identical"] is True


def test_backend_probe_json():
    result = run_cli("--json", "backend")
    assert result.returncode == 0, result.stderr
    doc = json.loads(result.stdout)
    assert doc["available"] is True
    assert doc.get("node") and doc.get("npm")


def test_repl_smoke_banner_and_exit():
    result = run_cli(input_text="help\nexit\n")
    assert result.returncode == 0
    assert "CLI-It · aismb" in result.stdout
    assert "bye" in result.stdout


def test_http_booking_availability_or_skip(tmp_path):
    if not _origin_up():
        pytest.skip(f"landing origin {LANDING_ORIGIN} is not reachable")
    project = tmp_path / "http.json"
    run_cli(
        "project",
        "new",
        "-n",
        "http",
        "-o",
        str(project),
        "--source-root",
        str(SOURCE_ROOT),
        "--landing-origin",
        LANDING_ORIGIN,
    )
    result = run_cli("--json", "booking", "availability", "-p", str(project), "--mode", "dates")
    assert result.returncode == 0, result.stderr
    doc = json.loads(result.stdout)
    assert doc["http"]["status"] in range(200, 500)
