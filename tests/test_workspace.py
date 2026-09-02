from __future__ import annotations

from unittest.mock import patch
import pytest
from contrib.workspace import analyze_issue, create_workspace, delete_workspace, list_workspaces
from contrib.config import save_registry, get_workspaces_dir


@patch("contrib.workspace.run_git_command")
@patch("contrib.workspace.fetch_issue_metadata")
def test_create_workspace(mock_fetch, mock_git, tmp_path, monkeypatch):
    monkeypatch.setenv("CONTRIB_HOME", str(tmp_path / ".contrib"))

    mock_fetch.return_value = {
        "owner": "testorg",
        "repo": "testrepo",
        "issue_number": "42",
        "title": "Fix memory leak in parser",
        "clone_url": "https://github.com/testorg/testrepo.git",
    }

    ws = create_workspace("https://github.com/testorg/testrepo/issues/42")

    assert ws["owner"] == "testorg"
    assert ws["repo"] == "testrepo"
    assert ws["issue_number"] == "42"
    assert ws["branch"] == "contrib/issue-42"
    assert mock_git.call_count >= 2

    workspaces = list_workspaces()
    assert len(workspaces) == 1
    assert workspaces[0]["id"] == ws["id"]


@patch("contrib.workspace.fetch_issue_metadata")
def test_analyze_issue(mock_fetch):
    mock_fetch.return_value = {
        "owner": "testorg",
        "repo": "testrepo",
        "title": "Bug in src/parser.py",
        "body": "Check utils/helpers.py and tests/test_core.py for failures.",
        "labels": ["bug"],
        "state": "open",
    }

    result = analyze_issue("https://github.com/testorg/testrepo/issues/42")
    focus_areas = result["suggested_focus_areas"]

    assert any("parser.py" in area for area in focus_areas)
    assert any("helpers.py" in area for area in focus_areas)


def test_delete_workspace(tmp_path, monkeypatch):
    monkeypatch.setenv("CONTRIB_HOME", str(tmp_path / ".contrib"))
    ws_dir = get_workspaces_dir()
    target_ws = ws_dir / "testorg__testrepo__issue_1"
    target_ws.mkdir(parents=True, exist_ok=True)
    (target_ws / "sample.txt").write_text("hello", encoding="utf-8")

    save_registry({
        "testorg__testrepo__issue_1": {
            "id": "testorg__testrepo__issue_1",
            "owner": "testorg",
            "repo": "testrepo",
            "issue_number": "1",
            "path": str(target_ws),
        }
    })

    res = delete_workspace("testorg__testrepo__issue_1", force=True)
    assert res["deleted"] is True
    assert not target_ws.exists()



@patch("contrib.workspace.run_git_command")
@patch("contrib.workspace.fetch_issue_metadata")
def test_create_workspace(mock_fetch, mock_git, tmp_path, monkeypatch):
    monkeypatch.setenv("CONTRIB_HOME", str(tmp_path / ".contrib"))

    mock_fetch.return_value = {
        "owner": "testorg",
        "repo": "testrepo",
        "issue_number": "42",
        "title": "Fix memory leak in parser",
        "clone_url": "https://github.com/testorg/testrepo.git",
    }

    ws = create_workspace("https://github.com/testorg/testrepo/issues/42")

    assert ws["owner"] == "testorg"
    assert ws["repo"] == "testrepo"
    assert ws["issue_number"] == "42"
    assert ws["branch"] == "contrib/issue-42"
    assert mock_git.call_count >= 2

    workspaces = list_workspaces()
    assert len(workspaces) == 1
    assert workspaces[0]["id"] == ws["id"]


@patch("contrib.workspace.fetch_issue_metadata")
def test_analyze_issue(mock_fetch):
    mock_fetch.return_value = {
        "owner": "testorg",
        "repo": "testrepo",
        "title": "Bug in src/parser.py",
        "body": "Check utils/helpers.py and tests/test_core.py for failures.",
        "labels": ["bug"],
        "state": "open",
    }

    result = analyze_issue("https://github.com/testorg/testrepo/issues/42")
    focus_areas = result["suggested_focus_areas"]

    assert any("parser.py" in area for area in focus_areas)
    assert any("helpers.py" in area for area in focus_areas)
