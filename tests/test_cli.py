from __future__ import annotations

import pytest
from contrib import __version__
from contrib.cli import create_parser, main


def test_cli_version(capsys):
    parser = create_parser()
    with pytest.raises(SystemExit) as excinfo:
        parser.parse_args(["--version"])
    assert excinfo.value.code == 0
    captured = capsys.readouterr()
    assert __version__ in captured.out


def test_cli_help(capsys):
    parser = create_parser()
    with pytest.raises(SystemExit) as excinfo:
        parser.parse_args(["--help"])
    assert excinfo.value.code == 0
    captured = capsys.readouterr()
    assert "Lightweight GitHub contribution workspace manager" in captured.out
    assert "start" in captured.out
    assert "analyze" in captured.out
    assert "status" in captured.out


def test_cli_no_args(capsys):
    exit_code = main([])
    assert exit_code == 0
    captured = capsys.readouterr()
    assert "usage: contrib" in captured.out


def test_cli_invalid_command():
    with pytest.raises(SystemExit) as excinfo:
        main(["nonexistent-command"])
    assert excinfo.value.code == 2
