"""The aismb backend boundary.

This is the ONLY module that locates and invokes the real AI KRE8TION /
aismb software: Node.js, npm, npx, wrangler, and HTTP against the running
Next.js landing/CRM apps. The harness never reimplements booking, ROI, NCB,
or the voice agent.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin
from urllib.request import Request, urlopen

INSTALL_HINT = (
    "Install Node.js 20+ and npm. Then in /Users/kcdacre8tor/Developer/aismb:\n"
    "  npm install --legacy-peer-deps\n"
    "  npx wrangler dev          # landing HTTP API\n"
    "  # CRM: cd ai_smb_crm_frontend && npm run dev"
)

LANDING_PACKAGE_NAMES = {"ai-smb-partners"}
CRM_PACKAGE_NAMES = {"ai-smb-crm"}
DEFAULT_TIMEOUT = 20
HTTP_MAX_BYTES = 2_000_000


class BackendError(RuntimeError):
    pass


def _which(name: str) -> str | None:
    found = shutil.which(name)
    return found


def node_executable() -> str | None:
    return os.environ.get("AISMB_NODE") or _which("node")


def npm_executable() -> str | None:
    return os.environ.get("AISMB_NPM") or _which("npm")


def npx_executable() -> str | None:
    return os.environ.get("AISMB_NPX") or _which("npx")


def wrangler_executable() -> str | None:
    override = os.environ.get("AISMB_WRANGLER")
    if override:
        return override
    found = _which("wrangler")
    if found:
        return found
    npx = npx_executable()
    return f"{npx} wrangler" if npx else None


def backend_available() -> bool:
    node = node_executable()
    npm = npm_executable()
    return bool(node) and bool(npm)


def require_backend() -> None:
    if not backend_available():
        raise BackendError(
            "aismb engine not found (need node + npm on PATH). " + INSTALL_HINT
        )


def _run(
    command: list[str],
    cwd: str | Path | None = None,
    timeout: int = 60,
) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(
            command,
            cwd=str(cwd) if cwd else None,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except FileNotFoundError as exc:
        raise BackendError(
            f"executable not found: {command[0]}. " + INSTALL_HINT
        ) from exc
    except subprocess.TimeoutExpired as exc:
        raise BackendError(
            f"command timed out after {timeout}s: {' '.join(command)}"
        ) from exc


def _version(exe: str | None, extra: list[str] | None = None) -> str | None:
    if not exe:
        return None
    parts = exe.split()
    result = _run([*parts, *(extra or ["--version"])], timeout=15)
    if result.returncode != 0:
        return None
    return (result.stdout or result.stderr).strip().splitlines()[0] if (
        result.stdout or result.stderr
    ) else None


def inspect_source(source_root: str | Path) -> dict[str, Any]:
    """Read package.json via the real `npm pkg get` (not a Python re-parse)."""
    require_backend()
    root = Path(source_root).expanduser().resolve()
    package_json = root / "package.json"
    if not package_json.is_file():
        raise BackendError(
            f"aismb source not found at {root} (no package.json). "
            "Set source_root to the aismb checkout "
            "(/Users/kcdacre8tor/Developer/aismb)."
        )
    npm = npm_executable()
    assert npm is not None
    result = _run([npm, "pkg", "get", "name", "version", "scripts"], cwd=root, timeout=30)
    if result.returncode != 0:
        raise BackendError(
            f"npm pkg get failed in {root} (rc={result.returncode}): "
            f"{(result.stderr or result.stdout).strip()}"
        )
    raw = (result.stdout or "").strip()
    try:
        parsed = json.loads(raw) if raw else {}
    except ValueError as exc:
        raise BackendError(f"npm pkg get returned non-JSON: {raw[:200]!r}") from exc
    # `npm pkg get name version scripts` may return a dict or, for a single
    # field, a JSON string. Normalize to a dict.
    if isinstance(parsed, str):
        parsed = {"name": parsed}
    name = str(parsed.get("name") or "").strip().strip('"')
    crm_pkg = root / "ai_smb_crm_frontend" / "package.json"
    return {
        "source_root": str(root),
        "package_json": str(package_json),
        "name": name,
        "version": str(parsed.get("version") or "").strip().strip('"'),
        "scripts": parsed.get("scripts") if isinstance(parsed.get("scripts"), dict) else {},
        "looks_like_landing": name in LANDING_PACKAGE_NAMES or (root / "app" / "api" / "booking").is_dir(),
        "looks_like_crm": crm_pkg.is_file(),
        "raw": parsed,
    }


def npm_pkg_get(source_root: str | Path, *fields: str) -> Any:
    require_backend()
    root = Path(source_root).expanduser().resolve()
    npm = npm_executable()
    assert npm is not None
    args = [npm, "pkg", "get", *(fields or ["name", "version", "scripts"])]
    result = _run(args, cwd=root, timeout=30)
    if result.returncode != 0:
        raise BackendError(
            f"npm pkg get failed (rc={result.returncode}): "
            f"{(result.stderr or result.stdout).strip()}"
        )
    raw = (result.stdout or "").strip()
    try:
        return json.loads(raw) if raw else {}
    except ValueError as exc:
        raise BackendError(f"npm pkg get returned non-JSON: {raw[:200]!r}") from exc


def npm_run(
    source_root: str | Path,
    script: str,
    extra: list[str] | None = None,
    timeout: int = 300,
) -> dict[str, Any]:
    require_backend()
    root = Path(source_root).expanduser().resolve()
    npm = npm_executable()
    assert npm is not None
    command = [npm, "run", script, *(["--", *(extra or [])] if extra else [])]
    result = _run(command, cwd=root, timeout=timeout)
    if result.returncode != 0:
        raise BackendError(
            f"npm run {script} failed (rc={result.returncode}): "
            f"{(result.stderr or result.stdout).strip()[-800:]}"
        )
    return {
        "script": script,
        "cwd": str(root),
        "returncode": result.returncode,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def http_request(
    method: str,
    url: str,
    headers: dict[str, str] | None = None,
    body: Any = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> dict[str, Any]:
    """Issue one HTTP call against the real aismb app. Never synthesizes a body."""
    data: bytes | None = None
    req_headers = {"User-Agent": "cli-it-aismb/0.1.0", **(headers or {})}
    if body is not None:
        if isinstance(body, (bytes, bytearray)):
            data = bytes(body)
        elif isinstance(body, str):
            data = body.encode("utf-8")
        else:
            data = json.dumps(body).encode("utf-8")
            req_headers.setdefault("Content-Type", "application/json")
    request = Request(url, data=data, headers=req_headers, method=method.upper())
    try:
        with urlopen(request, timeout=timeout) as response:
            raw = response.read(HTTP_MAX_BYTES + 1)
            if len(raw) > HTTP_MAX_BYTES:
                raise BackendError(f"response from {url} exceeded {HTTP_MAX_BYTES} bytes")
            text = raw.decode("utf-8", errors="replace")
            parsed: Any
            try:
                parsed = json.loads(text) if text else None
            except ValueError:
                parsed = None
            return {
                "ok": 200 <= int(response.status) < 400,
                "status": int(response.status),
                "url": url,
                "method": method.upper(),
                "headers": {k.lower(): v for k, v in response.headers.items()},
                "body_text": text,
                "body_json": parsed,
                "bytes": len(raw),
            }
    except HTTPError as exc:
        raw = exc.read(HTTP_MAX_BYTES) if exc.fp else b""
        text = raw.decode("utf-8", errors="replace")
        parsed = None
        try:
            parsed = json.loads(text) if text else None
        except ValueError:
            parsed = None
        return {
            "ok": False,
            "status": int(exc.code),
            "url": url,
            "method": method.upper(),
            "headers": {k.lower(): v for k, v in (exc.headers.items() if exc.headers else [])},
            "body_text": text,
            "body_json": parsed,
            "bytes": len(raw),
            "error": str(exc.reason),
        }
    except URLError as exc:
        raise BackendError(
            f"aismb HTTP {method.upper()} {url} failed: {exc.reason}. "
            "Start the app (`npx wrangler dev` or `npm run dev`) or point "
            "landing_origin at a reachable host. " + INSTALL_HINT
        ) from exc
    except TimeoutError as exc:
        raise BackendError(
            f"aismb HTTP {method.upper()} {url} timed out after {timeout}s. "
            + INSTALL_HINT
        ) from exc


def build_url(origin: str, path: str, query: dict[str, Any] | None = None) -> str:
    base = origin.rstrip("/") + "/"
    joined = urljoin(base, path.lstrip("/"))
    if path.startswith("/"):
        joined = origin.rstrip("/") + path
    if query:
        filtered = {k: v for k, v in query.items() if v is not None and v != ""}
        if filtered:
            joined += ("&" if "?" in joined else "?") + urlencode(filtered, doseq=True)
    return joined


def app_health(origin: str, timeout: int = 8) -> dict[str, Any]:
    result = http_request("GET", origin.rstrip("/") + "/", timeout=timeout)
    return {
        "origin": origin.rstrip("/"),
        "reachable": result.get("ok") or result.get("status") in range(200, 500),
        "status": result.get("status"),
        "bytes": result.get("bytes"),
        "content_type": (result.get("headers") or {}).get("content-type"),
    }


def booking_availability(
    origin: str,
    date: str | None = None,
    timezone: str = "America/Los_Angeles",
    mode: str = "dates",
    timeout: int = DEFAULT_TIMEOUT,
) -> dict[str, Any]:
    query: dict[str, Any] = {"timezone": timezone, "mode": mode}
    if date:
        query["date"] = date
    url = build_url(origin, "/api/booking/availability", query)
    return http_request("GET", url, timeout=timeout)


def voice_chat(
    origin: str,
    question: str,
    session_id: str,
    language: str = "en",
    timeout: int = 60,
) -> dict[str, Any]:
    url = build_url(origin, "/api/voice-agent/chat")
    return http_request(
        "POST",
        url,
        body={"question": question, "sessionId": session_id, "language": language},
        timeout=timeout,
    )


def admin_bookings(
    origin: str,
    admin_api_key: str | None = None,
    status: str | None = None,
    limit: int = 100,
    timeout: int = DEFAULT_TIMEOUT,
) -> dict[str, Any]:
    query: dict[str, Any] = {"limit": str(limit)}
    if status:
        query["status"] = status
    url = build_url(origin, "/api/admin/bookings/list", query)
    headers: dict[str, str] = {}
    key = admin_api_key or os.environ.get("AISMB_ADMIN_API_KEY") or os.environ.get("ADMIN_API_KEY")
    if key:
        headers["Authorization"] = f"Bearer {key}"
    return http_request("GET", url, headers=headers, timeout=timeout)


def execute_saved_request(
    origin: str,
    item: dict[str, Any],
    admin_api_key: str | None = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> dict[str, Any]:
    url = build_url(origin, str(item.get("path") or "/"), item.get("query") or {})
    headers = dict(item.get("headers") or {})
    key = admin_api_key or os.environ.get("AISMB_ADMIN_API_KEY") or os.environ.get("ADMIN_API_KEY")
    path = str(item.get("path") or "")
    if key and path.startswith("/api/admin") and "authorization" not in {k.lower() for k in headers}:
        headers["Authorization"] = f"Bearer {key}"
    return http_request(
        str(item.get("method") or "GET"),
        url,
        headers=headers,
        body=item.get("body"),
        timeout=timeout,
    )


def write_output(path: str | Path, payload: Any) -> Path:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(payload, (bytes, bytearray)):
        path.write_bytes(bytes(payload))
    elif isinstance(payload, str):
        path.write_text(payload if payload.endswith("\n") else payload + "\n", encoding="utf-8")
    else:
        path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    if not path.is_file():
        raise BackendError(f"engine reported success but {path} does not exist")
    return path


def probe(source_root: str | Path | None = None) -> dict[str, Any]:
    """Structured backend health info for `--json` consumers."""
    node = node_executable()
    npm = npm_executable()
    npx = npx_executable()
    available = backend_available()
    info: dict[str, Any] = {
        "available": available,
        "node": node,
        "npm": npm,
        "npx": npx,
        "wrangler": wrangler_executable(),
        "node_version": _version(node) if node else None,
        "npm_version": _version(npm) if npm else None,
    }
    if source_root:
        try:
            info["source"] = inspect_source(source_root)
        except BackendError as exc:
            info["source_error"] = str(exc)
    if not available:
        info["install_hint"] = INSTALL_HINT
    return info
