"""aismb session state: undo/redo journal with exclusive file locking.

Lock pattern follows cli-it-plugin/guides/session-locking.md: open the
session with O_RDWR|O_CREAT (never truncate-then-lock), take an exclusive
lock on that handle, read, mutate, seek/truncate, write, fsync, release.
Portable across POSIX (fcntl) and Windows (msvcrt).
"""

from __future__ import annotations

import json
import os
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Callable

SESSION_FORMAT = "aismb-session/v1"

try:
    import fcntl

    def _lock(handle) -> None:
        fcntl.flock(handle, fcntl.LOCK_EX)

    def _unlock(handle) -> None:
        fcntl.flock(handle, fcntl.LOCK_UN)

except ImportError:  # pragma: no cover - Windows compatibility
    import msvcrt

    def _lock(handle) -> None:
        handle.seek(0)
        msvcrt.locking(handle.fileno(), msvcrt.LK_LOCK, 1)

    def _unlock(handle) -> None:
        handle.seek(0)
        msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)


def session_path_for(project_path: str | Path) -> Path:
    project_path = Path(project_path).expanduser().resolve()
    return project_path.with_name(project_path.name + ".session.json")


def _default_session(project_path: Path) -> dict:
    return {
        "format": SESSION_FORMAT,
        "project": str(project_path.expanduser().resolve()),
        "undo": [],
        "redo": [],
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }


@contextmanager
def _locked_handle(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    # O_CREAT alone is atomic and never clobbers an existing journal.
    fd = os.open(path, os.O_RDWR | os.O_CREAT, 0o644)
    with os.fdopen(fd, "r+", encoding="utf-8") as handle:
        _lock(handle)
        try:
            yield handle
        finally:
            _unlock(handle)


def update_session(project_path: str | Path, mutate: Callable[[dict], dict]) -> dict:
    """Atomically read-modify-write the session under an exclusive lock."""
    project = Path(project_path).expanduser().resolve()
    path = session_path_for(project)
    with _locked_handle(path) as handle:
        raw = handle.read()
        try:
            state = json.loads(raw) if raw.strip() else _default_session(project)
        except (ValueError, TypeError):
            state = _default_session(project)
        if not isinstance(state, dict) or state.get("format") != SESSION_FORMAT:
            state = _default_session(project)
        state = mutate(state)
        state["format"] = SESSION_FORMAT
        state["project"] = str(project)
        state["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        handle.seek(0)
        handle.truncate()
        handle.write(json.dumps(state, indent=2) + "\n")
        handle.flush()
        os.fsync(handle.fileno())
    return state


def load_session(project_path: str | Path) -> dict:
    path = session_path_for(project_path)
    if not path.is_file():
        return _default_session(Path(project_path).expanduser().resolve())
    try:
        raw = path.read_text(encoding="utf-8")
        state = json.loads(raw) if raw.strip() else None
    except ValueError:
        state = None
    if not isinstance(state, dict) or state.get("format") != SESSION_FORMAT:
        return _default_session(Path(project_path).expanduser().resolve())
    return state


def record_action(project_path: str | Path, action: dict) -> dict:
    """Journal a new mutation: push onto undo, clear redo."""

    def mutate(state: dict) -> dict:
        state.setdefault("undo", []).append(action)
        state["redo"] = []
        return state

    return update_session(project_path, mutate)


def pop_undo(project_path: str | Path) -> dict | None:
    """Move the newest undo entry to the redo stack and return it."""
    popped: dict = {}

    def mutate(state: dict) -> dict:
        if state.get("undo"):
            action = state["undo"].pop()
            state.setdefault("redo", []).append(action)
            popped["action"] = action
        return state

    update_session(project_path, mutate)
    return popped.get("action")


def pop_redo(project_path: str | Path) -> dict | None:
    """Move the newest redo entry back to the undo stack and return it."""
    popped: dict = {}

    def mutate(state: dict) -> dict:
        if state.get("redo"):
            action = state["redo"].pop()
            state.setdefault("undo", []).append(action)
            popped["action"] = action
        return state

    update_session(project_path, mutate)
    return popped.get("action")


def session_status(project_path: str | Path) -> dict:
    state = load_session(project_path)
    return {
        "project": state.get("project"),
        "session_file": str(session_path_for(project_path)),
        "undo_depth": len(state.get("undo", [])),
        "redo_depth": len(state.get("redo", [])),
        "updated_at": state.get("updated_at"),
    }
