"""
GitHub API integration and issue metadata resolution.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any, Dict, Optional

from contrib.security import validate_github_url
from contrib import __version__


def fetch_issue_metadata(url: str) -> Dict[str, Any]:
    """
    Fetch issue or pull request details via GitHub REST API.
    Falls back gracefully if no token or rate-limited.
    """
    parsed = validate_github_url(url)
    owner = parsed["owner"]
    repo = parsed["repo"]
    issue_num = parsed.get("issue") or parsed.get("pr")

    metadata: Dict[str, Any] = {
        "owner": owner,
        "repo": repo,
        "issue_number": issue_num,
        "url": url,
        "title": f"{owner}/{repo}" + (f" #{issue_num}" if issue_num else ""),
        "body": "",
        "labels": [],
        "clone_url": f"https://github.com/{owner}/{repo}.git",
    }

    if not issue_num:
        return metadata

    api_url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_num}"
    req = urllib.request.Request(api_url)
    req.add_header("User-Agent", f"contrib-cli/{__version__}")
    req.add_header("Accept", "application/vnd.github.v3+json")

    token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if token:
        req.add_header("Authorization", f"token {token}")

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                payload = json.loads(response.read().decode("utf-8"))
                metadata["title"] = payload.get("title", metadata["title"])
                metadata["body"] = payload.get("body", "") or ""
                metadata["labels"] = [
                    lbl.get("name") for lbl in payload.get("labels", []) if isinstance(lbl, dict)
                ]
                metadata["state"] = payload.get("state", "open")
    except Exception:
        pass

    return metadata
