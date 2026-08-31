"""
Workspace management and Git sparse operations.
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from contrib.config import get_workspaces_dir, load_registry, save_registry
from contrib.github import fetch_issue_metadata
from contrib.security import run_git_command, sanitize_workspace_name


def create_workspace(issue_url: str, branch_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a lightweight contribution workspace for a given GitHub issue URL.
    """
    meta = fetch_issue_metadata(issue_url)
    owner = meta["owner"]
    repo = meta["repo"]
    issue_num = meta["issue_number"] or "main"

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
    else:
        try:
            run_git_command(["checkout", target_branch], cwd=ws_path)
        except RuntimeError:
            run_git_command(["checkout", "-b", target_branch], cwd=ws_path)

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
