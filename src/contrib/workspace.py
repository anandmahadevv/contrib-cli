"""
Workspace management, Git worktree/blobless/sparse operations, and safety controls (Python).
"""

from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
import shutil
from typing import Any, Dict, List, Optional

from contrib.config import get_workspaces_dir, load_registry, save_registry
from contrib.github import fetch_issue_metadata
from contrib.security import run_git_command, sanitize_workspace_name, SecurityError


def is_git_dirty(cwd: Path) -> bool:
    """Check if repository at cwd has uncommitted or untracked changes."""
    if not cwd.exists() or not (cwd / ".git").exists():
        return False
    try:
        res = run_git_command(["status", "--porcelain"], cwd=cwd)
        return bool(res.stdout.strip())
    except Exception:
        return False


def write_workspace_context_files(
    ws_path: Path,
    meta: Dict[str, Any],
    target_branch: str,
    focus_areas: List[str],
) -> None:
    """Write .contrib/ISSUE.md and .contrib/context.json inside the workspace."""
    contrib_dir = ws_path / ".contrib"
    contrib_dir.mkdir(parents=True, exist_ok=True)

    owner = meta.get("owner", "")
    repo = meta.get("repo", "")
    issue_num = meta.get("issue_number")
    title = meta.get("title") or f"{owner}/{repo} #{issue_num}"

    issue_md_lines = [
        f"# Issue: {title}",
        "",
        f"- **Repository:** [{owner}/{repo}](https://github.com/{owner}/{repo})",
        f"- **Issue URL:** [{meta.get('url')}]({meta.get('url')})",
        f"- **Issue Number:** #{issue_num or 'N/A'}",
        f"- **State:** {meta.get('state', 'open')}",
        f"- **Labels:** {', '.join(meta.get('labels', [])) if meta.get('labels') else 'none'}",
        f"- **Working Branch:** `{target_branch}`",
        "",
        "---",
        "",
        "## Issue Description",
        "",
        meta.get("body") or "_No description provided._",
        "",
        "---",
        "",
        "## Candidate Files & Focus Areas",
        "",
    ]
    if focus_areas:
        for f in focus_areas:
            issue_md_lines.append(f"- `{f}`")
    else:
        issue_md_lines.append("_No specific candidate files detected in issue body._")

    issue_md_lines.extend(
        [
            "",
            "---",
            "",
            "## Quick Contribution Commands",
            "",
            "- **Check Git Status:** `git status`",
            "- **Inspect Workspace:** `contrib doctor`",
            "",
        ]
    )

    with open(contrib_dir / "ISSUE.md", "w", encoding="utf-8") as f:
        f.write("\n".join(issue_md_lines))

    context_json = {
        "workspace_id": sanitize_workspace_name(f"{meta['owner']}__{meta['repo']}__issue_{meta.get('issue_number', 'main')}"),
        "repository": f"{meta['owner']}/{meta['repo']}",
        "issue_number": meta.get("issue_number"),
        "issue_url": meta.get("url"),
        "title": meta.get("title"),
        "labels": meta.get("labels", []),
        "branch": target_branch,
        "focus_areas": focus_areas,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    with open(contrib_dir / "context.json", "w", encoding="utf-8") as f:
        json.dump(context_json, f, indent=2, ensure_ascii=False)


def create_workspace(
    issue_url: str,
    branch_name: Optional[str] = None,
    sparse: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Create a lightweight contribution workspace for a given GitHub issue URL.
    """
    meta = fetch_issue_metadata(issue_url)
    owner = meta["owner"]
    repo = meta["repo"]
    issue_num = meta["issue_number"] or "main"

    analysis = analyze_issue(issue_url)
    focus_areas = analysis.get("suggested_focus_areas", [])

    ws_id = sanitize_workspace_name(f"{owner}__{repo}__issue_{issue_num}")
    ws_path = get_workspaces_dir() / ws_id

    target_branch = branch_name or f"contrib/issue-{issue_num}"

    if not ws_path.exists():
        ws_path.mkdir(parents=True, exist_ok=True)
        # Initialize blobless shallow clone for rapid contribution
        run_git_command(
            [
                "clone",
                "--filter=blob:none",
                meta["clone_url"],
                str(ws_path),
            ]
        )
        # Checkout the branch
        run_git_command(["checkout", "-b", target_branch], cwd=ws_path)

        # Sparse checkout if requested
        if sparse:
            run_git_command(["sparse-checkout", "init", "--cone"], cwd=ws_path)
            run_git_command(["sparse-checkout", "set"] + sparse, cwd=ws_path)
    else:
        try:
            run_git_command(["checkout", target_branch], cwd=ws_path)
        except RuntimeError:
            run_git_command(["checkout", "-b", target_branch], cwd=ws_path)

    write_workspace_context_files(ws_path, meta, target_branch, focus_areas)

    record = {
        "id": ws_id,
        "url": issue_url,
        "owner": owner,
        "repo": repo,
        "issue_number": issue_num,
        "title": meta.get("title", ""),
        "branch": target_branch,
        "path": str(ws_path),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "active",
    }

    registry = load_registry()
    registry[ws_id] = record
    save_registry(registry)

    return record


def list_workspaces() -> List[Dict[str, Any]]:
    """Return all active workspaces."""
    registry = load_registry()
    return list(registry.values())


def get_workspace(id_or_target: str) -> Optional[Dict[str, Any]]:
    """Get a specific workspace by ID or repository target."""
    registry = load_registry()
    if id_or_target in registry:
        return registry[id_or_target]
    for ws in registry.values():
        if (
            ws.get("id") == id_or_target
            or ws.get("url") == id_or_target
            or f"{ws.get('owner')}/{ws.get('repo')}" == id_or_target
        ):
            return ws
    return None


def delete_workspace(id_or_target: str, force: bool = False) -> Dict[str, Any]:
    """Safely delete a workspace and remove it from the registry."""
    ws = get_workspace(id_or_target)
    if not ws:
        raise ValueError(f"Workspace not found for: '{id_or_target}'")

    ws_path = Path(ws["path"])
    workspaces_dir = get_workspaces_dir().resolve()

    if not ws_path.resolve().is_relative_to(workspaces_dir):
        raise SecurityError(f"Security error: Path '{ws_path}' is outside '{workspaces_dir}'")

    if not force and is_git_dirty(ws_path):
        raise RuntimeError(f"Workspace '{ws['id']}' contains uncommitted changes. Use force=True to delete.")

    if ws_path.exists():
        shutil.rmtree(ws_path, ignore_errors=True)

    registry = load_registry()
    if ws["id"] in registry:
        del registry[ws["id"]]
        save_registry(registry)

    return {"id": ws["id"], "path": str(ws_path), "deleted": True}


def analyze_issue(issue_url: str) -> Dict[str, Any]:
    """Analyze a GitHub issue and suggest relevant files/modules."""
    meta = fetch_issue_metadata(issue_url)
    text_corpus = (meta.get("title", "") + " " + meta.get("body", "")).lower()

    suggested_paths = []
    for token in text_corpus.split():
        if "/" in token or token.endswith((".py", ".js", ".ts", ".go", ".rs", ".md", ".json")):
            clean_token = token.strip("`'\",():")
            if clean_token and clean_token not in suggested_paths:
                suggested_paths.append(clean_token)

    return {
        "metadata": meta,
        "suggested_focus_areas": suggested_paths[:10],
    }
