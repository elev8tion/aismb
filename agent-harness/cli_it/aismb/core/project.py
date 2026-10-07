"""aismb project data layer: harness-native JSON describing a live app target."""

from __future__ import annotations

import json
import time
from copy import deepcopy
from pathlib import Path
from typing import Any

PROJECT_FORMAT = "aismb/v1"
DEFAULT_SOURCE_ROOT = "/Users/kcdacre8tor/Developer/aismb"
DEFAULT_LANDING_ORIGIN = "http://127.0.0.1:3000"
DEFAULT_CRM_ORIGIN = "http://127.0.0.1:3001"
APPS = ("landing", "crm", "both")
HTTP_METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE", "HEAD")
SETTABLE_KEYS = {
    "name",
    "source_root",
    "app",
    "landing_origin",
    "crm_origin",
    "admin_api_key",
}


class ProjectError(RuntimeError):
    pass


class Project:
    def __init__(self, document: dict[str, Any]):
        self.document = document

    @property
    def name(self) -> str:
        return str(self.document.get("name") or "untitled")

    @property
    def source_root(self) -> Path:
        return Path(str(self.document.get("source_root") or DEFAULT_SOURCE_ROOT)).expanduser()

    @property
    def app(self) -> str:
        return str(self.document.get("app") or "landing")

    @property
    def landing_origin(self) -> str:
        return str(self.document.get("landing_origin") or DEFAULT_LANDING_ORIGIN).rstrip("/")

    @property
    def crm_origin(self) -> str:
        return str(self.document.get("crm_origin") or DEFAULT_CRM_ORIGIN).rstrip("/")

    @property
    def admin_api_key(self) -> str:
        return str(self.document.get("admin_api_key") or "")

    @property
    def requests(self) -> list[dict[str, Any]]:
        return list(self.document.get("requests") or [])

    def snapshot(self) -> dict[str, Any]:
        return deepcopy(self.document)

    def to_dict(self) -> dict[str, Any]:
        doc = deepcopy(self.document)
        doc["format"] = PROJECT_FORMAT
        return doc

    def next_request_id(self) -> int:
        return max((int(item.get("id", 0) or 0) for item in self.requests), default=0) + 1

    def origin_for(self, app: str | None = None) -> str:
        target = app or self.app
        if target == "crm":
            return self.crm_origin
        return self.landing_origin


def new_project(
    name: str,
    source_root: str | Path | None = None,
    app: str = "landing",
    landing_origin: str | None = None,
    crm_origin: str | None = None,
) -> Project:
    if app not in APPS:
        raise ProjectError(f"app must be one of {APPS}, got {app!r}")
    return Project(
        {
            "format": PROJECT_FORMAT,
            "name": name,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "source_root": str(Path(source_root or DEFAULT_SOURCE_ROOT).expanduser()),
            "app": app,
            "landing_origin": (landing_origin or DEFAULT_LANDING_ORIGIN).rstrip("/"),
            "crm_origin": (crm_origin or DEFAULT_CRM_ORIGIN).rstrip("/"),
            "admin_api_key": "",
            "requests": [],
            "metadata": {},
        }
    )


def validate_document(document: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(document, dict):
        raise ProjectError("project document must be a JSON object")
    if document.get("format") != PROJECT_FORMAT:
        raise ProjectError(
            f"not an aismb project (format={document.get('format')!r})"
        )
    if not str(document.get("name") or "").strip():
        raise ProjectError("project name is required")
    app = document.get("app") or "landing"
    if app not in APPS:
        raise ProjectError(f"app must be one of {APPS}, got {app!r}")
    document["app"] = app
    document.setdefault("source_root", DEFAULT_SOURCE_ROOT)
    document.setdefault("landing_origin", DEFAULT_LANDING_ORIGIN)
    document.setdefault("crm_origin", DEFAULT_CRM_ORIGIN)
    document.setdefault("admin_api_key", "")
    document.setdefault("requests", [])
    document.setdefault("metadata", {})
    if not isinstance(document["requests"], list):
        raise ProjectError("requests must be a list")
    return document


def load_project(path: str | Path) -> Project:
    path = Path(path)
    if not path.is_file():
        raise ProjectError(f"project file not found: {path}")
    try:
        document = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as exc:
        raise ProjectError(f"invalid project JSON in {path}: {exc}") from exc
    return Project(validate_document(document))


def save_project(project: Project, path: str | Path) -> Path:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    document = validate_document(project.to_dict())
    tmp = path.with_name(f".{path.name}.tmp")
    tmp.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)
    return path


def restore_document(path: str | Path, document: dict[str, Any]) -> Project:
    project = Project(validate_document(deepcopy(document)))
    save_project(project, path)
    return project


def project_info(project: Project, path: Path) -> dict[str, Any]:
    return {
        "path": str(Path(path).expanduser().resolve()),
        "format": PROJECT_FORMAT,
        "name": project.name,
        "created_at": project.document.get("created_at"),
        "source_root": str(project.source_root),
        "app": project.app,
        "landing_origin": project.landing_origin,
        "crm_origin": project.crm_origin,
        "admin_configured": bool(project.admin_api_key),
        "requests": len(project.requests),
        "metadata": project.document.get("metadata") or {},
    }


def set_field(project: Project, key: str, value: str) -> Project:
    if key not in SETTABLE_KEYS:
        raise ProjectError(
            f"unknown field {key!r}; settable: {', '.join(sorted(SETTABLE_KEYS))}"
        )
    if key == "app" and value not in APPS:
        raise ProjectError(f"app must be one of {APPS}, got {value!r}")
    if key in {"landing_origin", "crm_origin"}:
        value = value.rstrip("/")
    project.document[key] = value
    return project


def add_request(
    project: Project,
    name: str,
    method: str = "GET",
    app: str = "landing",
    path: str = "/",
    query: dict[str, Any] | None = None,
    body: Any = None,
    headers: dict[str, str] | None = None,
) -> dict[str, Any]:
    method = method.upper()
    if method not in HTTP_METHODS:
        raise ProjectError(f"method must be one of {HTTP_METHODS}, got {method!r}")
    if app not in ("landing", "crm"):
        raise ProjectError(f"request app must be 'landing' or 'crm', got {app!r}")
    if not path.startswith("/"):
        raise ProjectError(f"request path must start with '/', got {path!r}")
    item = {
        "id": project.next_request_id(),
        "name": name,
        "method": method,
        "app": app,
        "path": path,
        "query": dict(query or {}),
        "body": body,
        "headers": dict(headers or {}),
    }
    project.document.setdefault("requests", []).append(item)
    return item


def remove_request(project: Project, request_id: int) -> dict[str, Any]:
    items = project.requests
    target = next((item for item in items if int(item.get("id", 0) or 0) == request_id), None)
    if target is None:
        raise ProjectError(f"no request with id {request_id}")
    project.document["requests"] = [
        item for item in items if int(item.get("id", 0) or 0) != request_id
    ]
    return target


def get_request(project: Project, request_id: int) -> dict[str, Any]:
    for item in project.requests:
        if int(item.get("id", 0) or 0) == request_id:
            return item
    raise ProjectError(f"no request with id {request_id}")
