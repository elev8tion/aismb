"""aismb unit tests — no Next.js / HTTP / NCB needed (pure data + Click layer)."""

import json
import threading

import pytest
from click.testing import CliRunner

from cli_it.aismb.core import project as _project
from cli_it.aismb.core import session as _session
from cli_it.aismb.aismb_cli import cli


# --- project data layer ------------------------------------------------------


def test_project_round_trip(tmp_path):
    proj = _project.new_project("roundtrip", source_root=tmp_path)
    item = _project.add_request(proj, name="availability", path="/api/booking/availability")
    path = _project.save_project(proj, tmp_path / "p.json")
    loaded = _project.load_project(path)
    assert loaded.name == "roundtrip"
    assert loaded.requests[0]["name"] == "availability"
    assert loaded.requests[0]["id"] == item["id"]
    assert json.loads(path.read_text())["format"] == "aismb/v1"


def test_project_load_errors(tmp_path):
    with pytest.raises(_project.ProjectError):
        _project.load_project(tmp_path / "missing.json")
    bad = tmp_path / "bad.json"
    bad.write_text("{not json")
    with pytest.raises(_project.ProjectError):
        _project.load_project(bad)
    wrong = tmp_path / "wrong.json"
    wrong.write_text(json.dumps({"format": "other/v9", "name": "x"}))
    with pytest.raises(_project.ProjectError):
        _project.load_project(wrong)


def test_set_field_and_requests():
    proj = _project.new_project("fields")
    _project.set_field(proj, "landing_origin", "http://127.0.0.1:9999/")
    assert proj.landing_origin == "http://127.0.0.1:9999"
    with pytest.raises(_project.ProjectError):
        _project.set_field(proj, "nope", "x")
    with pytest.raises(_project.ProjectError):
        _project.set_field(proj, "app", "mobile")
    with pytest.raises(_project.ProjectError):
        _project.add_request(proj, name="bad", path="api/booking")
    added = _project.add_request(proj, name="ok", path="/api/booking/availability", query={"mode": "dates"})
    assert added["id"] == 1
    assert _project.get_request(proj, 1)["name"] == "ok"
    removed = _project.remove_request(proj, 1)
    assert removed["name"] == "ok"
    with pytest.raises(_project.ProjectError):
        _project.get_request(proj, 1)


def test_next_request_id():
    proj = _project.new_project("ids")
    assert proj.next_request_id() == 1
    proj.document["requests"] = [{"id": 7, "name": "x", "method": "GET", "app": "landing", "path": "/"}]
    assert proj.next_request_id() == 8


# --- session journal + locking ----------------------------------------------


def test_record_and_status(tmp_path):
    project_path = tmp_path / "p.json"
    _session.record_action(project_path, {"op": "project.set", "key": "name"})
    status = _session.session_status(project_path)
    assert status["undo_depth"] == 1 and status["redo_depth"] == 0
    session_file = _session.session_path_for(project_path)
    assert json.loads(session_file.read_text())["format"] == "aismb-session/v1"


def test_undo_redo_stack_movement(tmp_path):
    project_path = tmp_path / "p.json"
    first = {"op": "project.set", "key": "a"}
    second = {"op": "project.set", "key": "b"}
    _session.record_action(project_path, first)
    _session.record_action(project_path, second)

    assert _session.pop_undo(project_path) == second
    status = _session.session_status(project_path)
    assert status["undo_depth"] == 1 and status["redo_depth"] == 1

    assert _session.pop_redo(project_path) == second
    assert _session.session_status(project_path)["redo_depth"] == 0

    _session.pop_undo(project_path)
    _session.record_action(project_path, {"op": "project.set", "key": "c"})
    assert _session.session_status(project_path)["redo_depth"] == 0


def test_pop_empty_returns_none(tmp_path):
    project_path = tmp_path / "p.json"
    assert _session.pop_undo(project_path) is None
    assert _session.pop_redo(project_path) is None


def test_torn_session_resets(tmp_path):
    project_path = tmp_path / "p.json"
    path = _session.session_path_for(project_path)
    path.write_text("{not json", encoding="utf-8")
    state = _session.load_session(project_path)
    assert state["format"] == "aismb-session/v1"
    assert state["undo"] == []


def test_concurrent_journal_writes_stay_consistent(tmp_path):
    project_path = tmp_path / "p.json"

    def worker(n):
        _session.record_action(project_path, {"op": "request.add", "key": n})

    threads = [threading.Thread(target=worker, args=(n,)) for n in range(12)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    state = _session.load_session(project_path)
    assert len(state["undo"]) == 12


# --- Click surface -----------------------------------------------------------


@pytest.fixture
def runner():
    return CliRunner()


def _new_project(runner, tmp_path, name="demo"):
    path = tmp_path / f"{name}.json"
    result = runner.invoke(
        cli,
        [
            "project",
            "new",
            "-n",
            name,
            "-o",
            str(path),
            "--source-root",
            str(tmp_path),
        ],
    )
    assert result.exit_code == 0, result.output
    return path


def test_cli_project_new_info_json(runner, tmp_path):
    path = _new_project(runner, tmp_path)
    info = runner.invoke(cli, ["--json", "project", "info", "-p", str(path)])
    assert info.exit_code == 0
    doc = json.loads(info.output)
    assert doc["name"] == "demo" and doc["requests"] == 0
    assert doc["format"] == "aismb/v1"

    again = runner.invoke(cli, ["project", "new", "-n", "x", "-o", str(path)])
    assert again.exit_code == 1  # refuses overwrite


def test_cli_open_save_and_set(runner, tmp_path):
    path = _new_project(runner, tmp_path)
    opened = runner.invoke(cli, ["--json", "project", "open", "-p", str(path)])
    assert opened.exit_code == 0
    assert json.loads(opened.output)["session"]["undo_depth"] == 0
    saved = runner.invoke(cli, ["project", "save", "-p", str(path)])
    assert saved.exit_code == 0
    setted = runner.invoke(
        cli, ["--json", "project", "set", "-p", str(path), "-k", "app", "-v", "crm"]
    )
    assert setted.exit_code == 0, setted.output
    assert json.loads(setted.output)["set"]["app"] == "crm"


def test_cli_request_mutations_and_undo_redo(runner, tmp_path):
    path = _new_project(runner, tmp_path)
    for name, req_path in (("availability", "/api/booking/availability"), ("chat", "/api/voice-agent/chat")):
        added = runner.invoke(
            cli,
            ["request", "add", "-p", str(path), "-n", name, "--path", req_path],
        )
        assert added.exit_code == 0, added.output

    listed = runner.invoke(cli, ["--json", "request", "list", "-p", str(path)])
    items = json.loads(listed.output)["requests"]
    assert [i["name"] for i in items] == ["availability", "chat"]

    undone = runner.invoke(cli, ["--json", "session", "undo", "-p", str(path)])
    assert undone.exit_code == 0
    assert json.loads(undone.output)["project"]["requests"] == 1

    redone = runner.invoke(cli, ["--json", "session", "redo", "-p", str(path)])
    assert json.loads(redone.output)["project"]["requests"] == 2

    removed = runner.invoke(cli, ["request", "remove", "-p", str(path), "-i", "1"])
    assert removed.exit_code == 0
    status = runner.invoke(cli, ["--json", "session", "status", "-p", str(path)])
    assert json.loads(status.output)["undo_depth"] == 3


def test_cli_error_paths(runner, tmp_path):
    path = _new_project(runner, tmp_path)
    missing_item = runner.invoke(cli, ["request", "remove", "-p", str(path), "-i", "99"])
    assert missing_item.exit_code == 1 and "no request" in missing_item.output

    empty_undo = runner.invoke(cli, ["session", "undo", "-p", str(tmp_path / "p2.json")])
    assert empty_undo.exit_code == 1

    usage = runner.invoke(cli, ["request", "add", "-p", str(path)])  # missing -n/--path
    assert usage.exit_code == 2

    missing_project = runner.invoke(cli, ["project", "info", "-p", str(tmp_path / "nope.json")])
    assert missing_project.exit_code == 1
    assert "not found" in missing_project.output


def test_cli_backend_probe_json(runner):
    result = runner.invoke(cli, ["--json", "backend"])
    assert result.exit_code == 0, result.output
    doc = json.loads(result.output)
    assert isinstance(doc["available"], bool)


def test_cli_preview_recipes(runner):
    result = runner.invoke(cli, ["--json", "preview", "recipes"])
    assert result.exit_code == 0
    names = [r["name"] for r in json.loads(result.output)["recipes"]]
    assert names == ["probe", "npm", "health"]


def test_cli_live_trajectory(runner, tmp_path):
    live = tmp_path / "live"
    started = runner.invoke(cli, ["--json", "preview", "live", "start", "--dir", str(live)])
    assert started.exit_code == 0, started.output
    pushed = runner.invoke(
        cli,
        ["--json", "preview", "live", "push", "--dir", str(live), "--message", "hello"],
    )
    assert pushed.exit_code == 0
    assert json.loads(pushed.output)["seq"] == 0
    aliased = runner.invoke(
        cli,
        ["--json", "live", "push", "--dir", str(live), "--message", "via-alias"],
    )
    assert aliased.exit_code == 0
    status = runner.invoke(cli, ["--json", "preview", "live", "status", "--dir", str(live)])
    assert json.loads(status.output)["trajectory"]["events"] == 2
    stopped = runner.invoke(cli, ["--json", "preview", "live", "stop", "--dir", str(live)])
    assert stopped.exit_code == 0
    assert json.loads(stopped.output)["status"] == "stopped"


def test_cli_preview_unknown_recipe(runner, tmp_path):
    path = _new_project(runner, tmp_path)
    result = runner.invoke(
        cli, ["preview", "capture", "-p", str(path), "-r", "not-a-recipe"]
    )
    assert result.exit_code == 2 or (result.exit_code == 1 and "unknown recipe" in result.output)
