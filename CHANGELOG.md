# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-09-02
### Added
- `contrib open [id]` command: open active workspaces directly in preferred editors (`--antigravity`, `--agy`, `--ide`, `--code`, `--cursor`, `--editor`) or open GitHub issues/PRs in default browser (`--web`).
- Added native support for **Antigravity IDE** (`--antigravity`, `--agy`, `--ide`) across `open`, `start`, and `contribute` commands with automatic detection.
- Support `--print` (`-p`) flag to emit clean workspace paths for shell navigation (`cd $(contrib open -p)`).
- Support `--issue` (`-i`) flag to directly open `.contrib/ISSUE.md` contextual task specifications in the editor.
- Added `-o, --open` and `-a, --antigravity` options to `start` and `contribute` commands to launch editors immediately after workspace creation.
- Added cross-platform opener utility in `src/utils/opener.js` supporting editor resolution and safe URL launching.
- Added comprehensive unit and integration test coverage for opener utilities and CLI workflows.

## [0.1.0] - 2026-08-31
### Added
- Initial release of `gsoc-contrib` CLI tool.
- Subcommands: `contrib start`, `contrib analyze`, and `contrib status`.
- Blobless git workspace management and issue metadata resolver.
