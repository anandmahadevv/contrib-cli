"""
Security and validation utilities for contrib.
"""

from __future__ import annotations

import os
from pathlib import Path
import re
import subprocess
from typing import List, Optional
from urllib.parse import urlparse

GITHUB_URL_PATTERN = re.compile(
    r"^https://github\.com/(?P<owner>[a-zA-Z0-9_\-\.]+)/(?P<repo>[a-zA-Z0-9_\-\.]+)(?:/issues/(?P<issue>\d+)|/pull/(?P<pr>\d+))?/?$"
)


class SecurityError(Exception):
    """Raised when an unsafe input or operation is detected."""


def validate_github_url(url: str) -> dict:
    """Validate and parse a GitHub URL safely."""
    if not url or not isinstance(url, str):
        raise SecurityError("A valid GitHub URL must be provided.")

    parsed = urlparse(url.strip())
    if parsed.scheme != "https" or parsed.netloc != "github.com":
        raise SecurityError(
            f"Invalid repository host: '{parsed.netloc}'. Only 'https://github.com' is supported."
        )

    match = GITHUB_URL_PATTERN.match(url.strip())
    if not match:
        raise SecurityError(
            f"Invalid GitHub URL format: '{url}'. Expected format: https://github.com/owner/repo/issues/123"
        )

    data = match.groupdict()
    data["repo"] = data["repo"].removesuffix(".git")
    return data


def sanitize_workspace_name(name: str) -> str:
    """Ensure a directory or workspace name cannot escape its root."""
    sanitized = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", name)
    if sanitized in ("", ".", ".."):
        raise SecurityError(f"Unsafe workspace name: '{name}'")
    return sanitized


def run_git_command(
    args: List[str],
    cwd: Optional[Path] = None,
    capture_output: bool = True,
    check: bool = True,
) -> subprocess.CompletedProcess:
    """
    Execute Git safely via argument list (shell=False) to prevent command injection.
    """
    cmd = ["git"] + args
    try:
        result = subprocess.run(
            cmd,
            cwd=str(cwd) if cwd else None,
            capture_output=capture_output,
            text=True,
            check=check,
            shell=False,
        )
        return result
    except FileNotFoundError:
        raise SecurityError("Git executable not found in PATH. Please install Git.")
    except subprocess.CalledProcessError as e:
        stderr = e.stderr.strip() if e.stderr else "Unknown error"
        raise RuntimeError(f"Git command failed: {' '.join(cmd)}\nError: {stderr}")
