from __future__ import annotations

import pytest
from contrib.security import (
    SecurityError,
    sanitize_workspace_name,
    validate_github_url,
)


def test_validate_github_url_valid_issue():
    res = validate_github_url("https://github.com/psf/requests/issues/1234")
    assert res["owner"] == "psf"
    assert res["repo"] == "requests"
    assert res["issue"] == "1234"


def test_validate_github_url_valid_pr():
    res = validate_github_url("https://github.com/torvalds/linux/pull/50")
    assert res["owner"] == "torvalds"
    assert res["repo"] == "linux"
    assert res["pr"] == "50"


def test_validate_github_url_invalid_host():
    with pytest.raises(SecurityError, match="Invalid repository host"):
        validate_github_url("https://malicious.com/psf/requests/issues/1")


def test_validate_github_url_invalid_protocol():
    with pytest.raises(SecurityError, match="Invalid repository host"):
        validate_github_url("http://github.com/psf/requests/issues/1")


def test_sanitize_workspace_name():
    assert sanitize_workspace_name("psf__requests__issue_1") == "psf__requests__issue_1"
    assert sanitize_workspace_name("my/bad\\name") == "my_bad_name"


def test_sanitize_workspace_name_traversal():
    with pytest.raises(SecurityError, match="Unsafe workspace name"):
        sanitize_workspace_name("..")
