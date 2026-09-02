"""
contrib - Lightweight GitHub contribution workspace manager.
"""

from __future__ import annotations

import sys

if sys.version_info >= (3, 8):
    from importlib.metadata import PackageNotFoundError, version
else:
    from importlib_metadata import PackageNotFoundError, version  # type: ignore

try:
    __version__ = version("gsoc-contrib")
except PackageNotFoundError:
    __version__ = "0.2.0"

__all__ = ["__version__"]
