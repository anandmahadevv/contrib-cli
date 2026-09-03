# gsoc-contrib (`contrib`)

[![npm version](https://img.shields.io/npm/v/gsoc-contrib.svg)](https://www.npmjs.com/package/gsoc-contrib)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js CI](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

> A fast, lightweight contribution workspace manager for GitHub issues without repeatedly cloning entire multi-gigabyte repositories.

---

## The Problem

When contributing to open-source repositories (such as during Google Summer of Code, Hacktoberfest, or day-to-day open-source work), developers frequently clone massive git repositories just to fix a single bug or submit a small pull request. 

This leads to:
* **Wasted Bandwidth**: Downloading gigabytes of historical git blobs that are never touched.
* **Wasted Disk Space**: Storing duplicate monolithic repos for each separate issue.
* **Slow Onboarding**: Waiting minutes for `git clone` before writing a single line of code.

## The Solution

`gsoc-contrib` (`contrib`) creates instant, isolated, lightweight workspaces for specific GitHub issues or pull requests using Git's blobless (`--filter=blob:none`) and sparse capabilities. It resolves issue metadata, sets up a dedicated branch, analyzes relevant source files, and tracks all your ongoing contributions from a single CLI.

---

## Installation & Execution

### Run instantly with `npx` (No install required)

```bash
npx gsoc-contrib <command>
```

### Or install globally

```bash
npm install -g gsoc-contrib
```

Once installed globally, you can run either `contrib` or `gsoc-contrib`:

```bash
contrib --help
```

---

## Quick Start

### 1. Initialize and Verify Environment

```bash
npx gsoc-contrib init
```

### 2. Search for Contribution Opportunities

```bash
npx gsoc-contrib search "good first issue" --repo psf/requests
```

### 3. Analyze an Issue Before Cloning

```bash
npx gsoc-contrib analyze https://github.com/psf/requests/issues/6000
```

### 4. Start a Contribution Workspace

```bash
npx gsoc-contrib start https://github.com/psf/requests/issues/6000
```

Or using shorthand:

```bash
npx gsoc-contrib contribute psf/requests#6000 -b fix-header-parsing
```

### 5. Open in Any Editor or Browser

```bash
# Open in Antigravity IDE (aliases: --agy, --ide)
npx gsoc-contrib open --antigravity

# Open in terminal power-user editors
npx gsoc-contrib open --nvim        # Neovim
npx gsoc-contrib open --vim         # Vim
npx gsoc-contrib open --helix       # Helix (--hx)
npx gsoc-contrib open --zed         # Zed

# Open in JetBrains or desktop editors
npx gsoc-contrib open --code        # Visual Studio Code
npx gsoc-contrib open --cursor      # Cursor
npx gsoc-contrib open --idea        # IntelliJ IDEA
npx gsoc-contrib open --pycharm     # PyCharm
npx gsoc-contrib open --webstorm    # WebStorm
npx gsoc-contrib open --subl        # Sublime Text

# Or open the issue in your default browser
npx gsoc-contrib open --web

# Or jump directly into the workspace using the 'gcd' shell shortcut!
gcd psf__requests__issue_6000
```

### 6. Set Up Shell Integration (`gcd` shortcut)

```bash
# Automatically install 'gcd' shortcut and completions into ~/.zshrc, ~/.bashrc, or $PROFILE:
npx gsoc-contrib alias --install
```

### 7. Sync with Upstream & Push to Your Fork

```bash
# Fetch upstream default branch, rebase feature branch, and push to your personal fork:
npx gsoc-contrib sync --fork
```

### 8. Check Active Workspaces

```bash
npx gsoc-contrib status
```

### 9. Clean Up When Done

```bash
npx gsoc-contrib cleanup psf__requests__issue_6000
```

---

## CLI Commands

### `start <url>`
Create or open a lightweight contribution workspace for a GitHub issue or PR URL.

```bash
# Using full URL (blobless mode by default)
npx gsoc-contrib start https://github.com/psf/requests/issues/6000

# Sub-second workspace creation via shared Git worktree
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 --worktree

# Automatically configure upstream and personal fork remotes
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 --fork

# Sparse checkout only focused directories
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 --sparse src/requests

# Operate completely off-grid using local cached metadata and bare git clone
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 --offline

# Apply Git & SSH identity to workspace
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 --identity personal

# With custom branch name
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 -b fix-bug-123
```

### `contribute <target>`
Smart shorthand alias for starting a workspace. Supports full URLs, repository shorthands (`owner/repo#123`), and repo targets (`owner/repo`).

```bash
npx gsoc-contrib contribute facebook/react#24000 --worktree --fork
```

### `sync [id]`
Pull upstream changes, rebase your local feature branch against `upstream/main`, and optionally push updated commits to your personal fork.

```bash
# Rebase feature branch on upstream/main
npx gsoc-contrib sync

# Rebase from upstream and push to personal fork (origin) in one action
npx gsoc-contrib sync --fork
npx gsoc-contrib sync -p
```

### `open [options] [id]`
Open a contribution workspace directly in your preferred editor or launch the corresponding GitHub issue/PR in your browser.

```bash
# Auto-open active workspace in detected default editor
npx gsoc-contrib open

# Open in Antigravity IDE (aliases: --agy, --ide)
npx gsoc-contrib open psf/requests#6000 --antigravity

# Power-user editors
npx gsoc-contrib open psf/requests#6000 --nvim
npx gsoc-contrib open psf/requests#6000 --vim
npx gsoc-contrib open psf/requests#6000 --helix
npx gsoc-contrib open psf/requests#6000 --zed
npx gsoc-contrib open psf/requests#6000 --idea
npx gsoc-contrib open psf/requests#6000 --pycharm
npx gsoc-contrib open psf/requests#6000 --webstorm
npx gsoc-contrib open psf/requests#6000 --subl
npx gsoc-contrib open psf/requests#6000 --code
npx gsoc-contrib open psf/requests#6000 --cursor

# Open custom editor
npx gsoc-contrib open psf/requests#6000 --editor nano

# Open the issue specification (.contrib/ISSUE.md) directly
npx gsoc-contrib open psf/requests#6000 --issue

# Open the GitHub issue or PR in default browser
npx gsoc-contrib open psf/requests#6000 --web

# Print path only (for shell navigation/piping)
cd $(npx gsoc-contrib open psf/requests#6000 --print)
```

### `shell-init [shell]` & `alias`
Native shell integration for instant workspace jumping via `gcd` and tab auto-completion across Bash, Zsh, Fish, and PowerShell.

```bash
# Quick session evaluation:
eval "$(npx gsoc-contrib shell-init zsh)"          # Zsh
eval "$(npx gsoc-contrib shell-init bash)"         # Bash
npx gsoc-contrib shell-init fish | source          # Fish
npx gsoc-contrib shell-init pwsh | Out-String | iex # PowerShell

# Or install permanently into shell profile:
npx gsoc-contrib alias --install

# Jump directly into any workspace!
gcd <workspace-id>
```

### `dashboard` *(aliases: `dash`, `tui`)*
Launch the interactive full-screen TUI workspace dashboard. Zero third-party dependencies, instant load times, and single-keystroke navigation.

```bash
# Launch the interactive terminal UI
npx gsoc-contrib dashboard

# Or shorthand
npx gsoc-contrib dash
```

* **Keyboard Navigation**:
  * `↑ / k` or `↓ / j`: Move cursor up and down through active workspaces.
  * `Enter` or `o`: Open workspace in default editor.
  * `a`: Open in Antigravity IDE.
  * `c`: Open in Visual Studio Code.
  * `n`: Open in Neovim.
  * `s`: Sync with upstream and rebase feature branch.
  * `d`: View interactive git diff.
  * `x`: Clean up workspace safely.
  * `q` / `Esc`: Exit dashboard.

### `identity [action] [name]`
Manage multiple Git/SSH identities and switch them across contribution workspaces. Never accidentally commit with your corporate email again!

```bash
# 1. Add identities
npx gsoc-contrib identity add personal \
  --name "Anand M" \
  --email "anand@personal.me" \
  --ssh-host "github-personal"

npx gsoc-contrib identity add work \
  --name "Anand M (Enterprise)" \
  --email "anand@company.corp"

# 2. List configured identities
npx gsoc-contrib identity list

# 3. Apply an identity when creating a workspace
npx gsoc-contrib start facebook/react#24000 --identity personal

# 4. Switch identity in an existing workspace
npx gsoc-contrib identity use work

# 5. Remove an identity
npx gsoc-contrib identity remove work
```

### `stats`
View contribution metrics, active workspaces, and commits authored. Useful for GSoC/Hacktoberfest check-in reports.

```bash
# Terminal summary
npx gsoc-contrib stats

# Export Markdown table for reports
npx gsoc-contrib stats --markdown
```

### `submit [id]` *(alias: `pr`)*
Inspect your workspace's branch status, verify uncommitted changes, and prepare a GitHub Pull Request with auto-generated titles, issue linkage (`Fixes #123`), and compare URLs.

```bash
npx gsoc-contrib submit
```

### `status`
List all active workspaces, their corresponding repositories, active branches, local paths, clone modes, and disk usage.

```bash
npx gsoc-contrib status
```

### `cleanup [id]`
Safely delete a contribution workspace and remove it from the workspace registry. Protects uncommitted work unless `--force` is provided.

```bash
# Delete a specific workspace (prompts for confirmation)
npx gsoc-contrib cleanup psf__requests__issue_6000

# Delete without prompt
npx gsoc-contrib cleanup psf__requests__issue_6000 -y

# Force delete workspace even if uncommitted changes exist
npx gsoc-contrib cleanup psf__requests__issue_6000 -f

# Clean up all workspaces safely (skips dirty workspaces unless -f)
npx gsoc-contrib cleanup --all
```

### `init`
Inspect system prerequisites (Node.js runtime, Git version, storage paths, GitHub API authentication status, rate limits).

```bash
npx gsoc-contrib init
```

---

## Workspace Context Files (`.contrib/ISSUE.md` & `.contrib/AI_PROMPT.md`)

When a contribution workspace is initialized, `gsoc-contrib` automatically generates:
1. **`.contrib/ISSUE.md`**: Complete issue briefing with title, description, state, labels, candidate files, and test commands.
2. **`.contrib/AI_PROMPT.md` (v2 Context Engine)**: Surgical instructions for AI coding assistants (Antigravity, Cursor, Copilot, Claude Code) with:
   - Extracted testing and style guidelines from repository `CONTRIBUTING.md` or `DEVELOPMENT.md`.
   - Quality checks from detected linters & formatters (ESLint, Prettier, Biome, Ruff, Black, Mypy, Clippy, rustfmt, golangci-lint).
   - Pull Request checklist extracted from `.github/PULL_REQUEST_TEMPLATE.md`.
   - Explicit verification commands and surgical coding rules.
3. **`.contrib/context.json`**: Machine-readable metadata for IDE extensions, scripts, and automations.

The `.contrib/` folder is automatically excluded in `.git/info/exclude` so your git working tree stays clean!

---

### Storage Directory Structure

Workspaces, cache, and registry are organized under `~/.contrib`:
```text
~/.contrib/
├── registry.json     # Workspace registry tracking active sessions
├── identities.json   # Configured Git and SSH user profiles
├── cache/
│   ├── api/          # Offline & rate-limit cached GitHub API responses
│   └── git/          # Shared bare repositories for instant git worktrees
└── workspaces/       # Isolated contribution workspaces
    ├── psf__requests__issue_6000/
    │   ├── .contrib/ISSUE.md
    │   └── ...
    └── facebook__react__issue_24000/
```

---

## Architecture

1. **Blobless Git Clone (`--filter=blob:none`)**:
   Instead of downloading the entire commit history and all file contents, blobless cloning downloads only commit and tree objects. Git fetches specific file contents on-demand only when files are opened or edited.
2. **Local Workspace Registry**:
   Workspaces are tracked centrally in `~/.contrib/registry.json`. If you revisit an issue, `contrib` checks out the existing workspace instead of re-downloading.
3. **Strict Safety Sandboxing**:
   The `cleanup` command verifies that the target directory is strictly located inside the managed workspaces directory before deletion, preventing accidental or malicious file removal.
4. **Smart Offline Engine**:
   Caches GitHub API metadata and git bare repositories indefinitely, allowing developers to create workspaces, context files, and branches completely off-grid.
5. **Git Identity Isolation**:
   Isolates contributor names, emails, and SSH host configurations locally per workspace, avoiding corporate credential contamination.

---

## Development

```bash
# Clone the repository
git clone https://github.com/anandmahadevv/contrib-cli.git
cd contrib-cli

# Install dependencies
npm install

# Run test suite (Node.js native test runner)
npm test

# Run CLI locally
node ./bin/cli.js --help
```

---

## Publishing to npm

To publish a new version:

```bash
# 1. Verify tests and dry-run packaging
npm test
npm pack --dry-run

# 2. Login to npm
npm login

# 3. Publish public package
npm publish --access public
```

---

## License

This project is licensed under the [MIT License](LICENSE).
