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

### 5. Open in Editor or Browser

```bash
# Open in Antigravity IDE
npx gsoc-contrib open --antigravity

# Open in VS Code
npx gsoc-contrib open --code

# Or open the issue in your default browser
npx gsoc-contrib open --web

# Or navigate directly via shell evaluation
cd $(npx gsoc-contrib open -p)
```

### 6. Check Active Workspaces

```bash
npx gsoc-contrib status
```

### 7. Clean Up When Done

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

# Sparse checkout only focused directories
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 --sparse src/requests

# With custom branch name
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 -b fix-bug-123
```

### `contribute <target>`
Smart shorthand alias for starting a workspace. Supports full URLs, repository shorthands (`owner/repo#123`), and repo targets (`owner/repo`).

```bash
npx gsoc-contrib contribute facebook/react#24000 --worktree
```

### `analyze <url>`
Fetch issue metadata and scan the issue body for referenced source files, modules, and labels.

```bash
npx gsoc-contrib analyze https://github.com/psf/requests/issues/6000
```

### `search [query]`
Search GitHub for open issues to contribute to.

```bash
# Search good first issues in a repository
npx gsoc-contrib search "good first issue" --repo psf/requests

# Search with label filter
npx gsoc-contrib search --label "help wanted" --limit 5
```

### `browse [query]`
Interactively search and select candidate GitHub issues with a number picker to launch workspaces instantly.

```bash
npx gsoc-contrib browse --repo psf/requests
```

### `doctor [id]` *(alias: `info`)*
Run health diagnostics on your environment (Node, Git, GitHub Auth, Rate Limits, Storage, Cache) or inspect a specific workspace for uncommitted changes, stack detection, and remotes.

```bash
npx gsoc-contrib doctor
```

### `sync [id]`
Fetch upstream changes and automatically rebase your active issue branch against `upstream/main` to resolve drift.

```bash
npx gsoc-contrib sync
```

### `diff [id]`
Inspect the git diff of code changes on your issue branch against the base branch.

```bash
# View diff summary
npx gsoc-contrib diff

# Export formatted Markdown diff for PR description
npx gsoc-contrib diff --markdown
```

### `setup [id]`
Automatically detect the workspace runtime and install dependencies (`npm install`, `uv sync`, `poetry install`, `cargo fetch`, etc.).

```bash
npx gsoc-contrib setup
```

### `open [options] [id]`
Open a contribution workspace directly in your preferred editor or launch the corresponding GitHub issue/PR in your browser.

```bash
# Auto-open active or single workspace in detected editor (Antigravity IDE, VS Code, Cursor, $EDITOR)
npx gsoc-contrib open

# Open in Antigravity IDE (aliases: --agy, --ide)
npx gsoc-contrib open psf/requests#6000 --antigravity
npx gsoc-contrib open psf/requests#6000 --agy

# Open in Visual Studio Code
npx gsoc-contrib open psf/requests#6000 --code

# Open in Cursor
npx gsoc-contrib open psf/requests#6000 --cursor

# Open in custom editor (e.g. nvim, vim, subl, idea)
npx gsoc-contrib open psf/requests#6000 --editor nvim

# Open the issue specification (.contrib/ISSUE.md) directly
npx gsoc-contrib open psf/requests#6000 --issue

# Open the GitHub issue or PR in default browser
npx gsoc-contrib open psf/requests#6000 --web

# Print path only (for shell navigation/piping)
cd $(npx gsoc-contrib open psf/requests#6000 --print)
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
2. **`.contrib/AI_PROMPT.md`**: Tailored role-based prompt for AI coding assistants (Antigravity, Cursor, Copilot, Claude Code) with problem description, candidate files, and verification commands.
3. **`.contrib/context.json`**: Machine-readable metadata for IDE extensions and scripts.

The `.contrib/` folder is automatically excluded in `.git/info/exclude` so your git working tree stays clean!

---

### Storage Directory Structure

Workspaces, cache, and registry are organized under `~/.contrib`:
```text
~/.contrib/
├── registry.json     # Workspace registry tracking active sessions
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
