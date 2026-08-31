"""
Configuration and state persistence for contrib.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict


def get_contrib_home() -> Path:
    """Return the base directory for contrib data."""
    custom_home = os.getenv("CONTRIB_HOME")
    if custom_home:
        base = Path(custom_home).expanduser().resolve()
    else:
        base = Path.home() / ".contrib"
    base.mkdir(parents=True, exist_ok=True)
    return base


def get_workspaces_dir() -> Path:
    """Return the directory containing all active contribution workspaces."""
    ws_dir = get_contrib_home() / "workspaces"
    ws_dir.mkdir(parents=True, exist_ok=True)
    return ws_dir


def get_registry_file() -> Path:
    """Return the JSON file tracking active workspaces."""
    return get_contrib_home() / "registry.json"


def load_registry() -> Dict[str, Any]:
    """Load the workspace registry."""
    reg_file = get_registry_file()
    if not reg_file.exists():
        return {}
    try:
        with open(reg_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_registry(data: Dict[str, Any]) -> None:
    """Save the workspace registry safely."""
    reg_file = get_registry_file()
    temp_file = reg_file.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    temp_file.replace(reg_file)
