# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2026-09-03
### Added
- **Smart Offline Engine (`contrib --offline`)**:
  - Seamless offline workspace creation: bypasses GitHub API network requests and reuses cached metadata from `~/.contrib/cache/api/` or generates graceful fallback schemas.
  - Offline worktree and clone generation spins up environments entirely off-grid directly from shared bare repositories (`~/.contrib/cache/git/`).
  - Actionable diagnostics when an un-cached repository is requested in offline mode.
- **Multi-Account Identity & SSH/GPG Profile Manager (`identity` & `--identity`)**:
  - Isolate open-source contributions completely from corporate/work credentials.
  - Dynamically configures local Git parameters including `user.name`, `user.email`, `core.sshCommand`, and GPG commit signing (`commit.gpgsign`, `user.signingkey`).
  - Supports custom SSH config host rewrites (e.g., swapping standard targets to mapped personal handles like `git@github-personal`).
  - Dedicated subcommands: `contrib identity add <name>`, `contrib identity list`, `contrib identity use <name>`, and `contrib identity remove <name>`.
  - Inline execution flag: `contrib start <target> --identity <name>`.
- **Zero-Dependency Interactive TUI Dashboard (`dashboard` / `dash` / `tui`)**:
  - Full-screen interactive terminal user interface built entirely with raw ANSI escape sequences and native Node.js `readline` streams.
  - Sub-millisecond panel boots with zero dependency bloat, keeping the distribution package under 170 kB.
  - Single-keystroke macros: `↑/k` (Up), `↓/j` (Down), `Enter/o` (Open default), `a` (Antigravity IDE), `c` (VS Code), `n` (Neovim), `s` (Upstream sync), `d` (Git diff), `x` (Safe deletion), and `q/Esc` (Quit).
  - Clean non-TTY fallback for CI and piped pipelines.
- **Enterprise-Grade Matrix CI/CD & Automated Security Scanning (`ci.yml`)**:
  - Automated GitHub Actions matrix testing pipeline running across Node.js (18, 20, 22) and Python 3.11 on both Ubuntu (`ubuntu-latest`) and Windows (`windows-latest`).
  - Integrated Snyk security vulnerability audits on push and pull requests with 0 detected vulnerabilities.

## [0.3.0] - 2026-09-03
### Added
- **Advanced Multi-Remote Fork Syncing (`contrib sync --fork` & `--push`)**:
  - Automatically detect user forks or configure via `--fork [user/repo]` on workspace creation.
  - Multi-remote git topology: `upstream` (original repo) for rebase/fetch and `origin` (personal fork) for pushing.
  - One-action sync: `contrib sync --fork` pulls latest upstream default branch, rebases the local feature branch, and pushes updated state to your personal fork (`origin`) with `--force-with-lease`.
- **Expanded Multi-IDE & Editor Support in `contrib open`**:
  - Added dedicated flags for terminal and desktop power-user editors:
    - Neovim: `-n, --nvim`
    - Vim: `--vim`
    - Helix: `--helix, --hx`
    - Zed: `-z, --zed`
    - IntelliJ IDEA: `--idea`
    - PyCharm: `--pycharm`
    - WebStorm: `--webstorm`
    - Sublime Text: `--subl, --sublime`
  - Integrated candidate resolution with binary detection across Windows, macOS, and Linux.
- **Rich AI-Context Injections (`.contrib/AI_PROMPT.md` v2 & `.contrib/context.json`)**:
  - Added `src/services/context.js` repository intelligence scanner.
  - Scans `CONTRIBUTING.md`, `DEVELOPMENT.md`, and `.github/CONTRIBUTING.md` to extract testing instructions, style guides, and PR requirements.
  - Discovers Pull Request templates (`.github/PULL_REQUEST_TEMPLATE.md`).
  - Scans project linters and formatters (ESLint, Prettier, Biome, TypeScript, Ruff, Black, Mypy, Clippy, rustfmt, golangci-lint).
  - Injects exact testing, linting commands, and repository constraints directly into `.contrib/AI_PROMPT.md` v2.
- **Direct Shell Integration (`gcd` & `contrib shell-init` / `contrib alias`)**:
  - Added `contrib shell-init [shell]` generating native wrapper functions for Bash, Zsh, Fish, and PowerShell.
  - Added `gcd [workspace-id]` shell shortcut for sub-second terminal jumping into active workspaces.
  - Added dynamic shell tab completion for workspace IDs via `contrib status --ids`.
  - Added `contrib alias [--install]` to automatically install shell hooks into user profile.

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
