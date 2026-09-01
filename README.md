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

### 5. Check Active Workspaces

```bash
npx gsoc-contrib status
```

### 6. Clean Up When Done

```bash
npx gsoc-contrib cleanup psf__requests__issue_6000
```

---

## CLI Commands

### `start <url>`
Create or open a lightweight contribution workspace for a GitHub issue or PR URL.

```bash
# Using full URL
npx gsoc-contrib start https://github.com/psf/requests/issues/6000

# With custom branch name
npx gsoc-contrib start https://github.com/psf/requests/issues/6000 -b fix-bug-123
```

### `contribute <target>`
Smart shorthand alias for starting a workspace. Supports full URLs, repository shorthands (`owner/repo#123`), and repo targets (`owner/repo`).

```bash
npx gsoc-contrib contribute facebook/react#24000
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

### `status`
List all active workspaces, their corresponding repositories, active branches, local paths, and disk usage.

```bash
npx gsoc-contrib status
```

### `cleanup [id]`
Safely delete a contribution workspace and remove it from the workspace registry.

```bash
# Delete a specific workspace (prompts for confirmation)
npx gsoc-contrib cleanup psf__requests__issue_6000

# Delete without prompt
npx gsoc-contrib cleanup psf__requests__issue_6000 -y

# Clean up all workspaces
npx gsoc-contrib cleanup --all
```

### `init`
Inspect system prerequisites (Node.js runtime, Git version, storage paths, GitHub API authentication status, rate limits).

```bash
npx gsoc-contrib init
```

---

## Requirements

* **Node.js**: `v18.0.0` or higher
* **Git**: `v2.25.0` or higher installed and accessible in `PATH`
* **GitHub CLI** (`gh`) *(Optional)*: If installed and logged in (`gh auth login`), `contrib` automatically detects and uses your authentication token.

---

## Authentication

`gsoc-contrib` works out-of-the-box without authentication for public GitHub repositories (using GitHub's public API rate limits of 60 requests/hour).

To increase your rate limit to 5,000 requests/hour or access private repositories, provide a GitHub personal access token using any of the following methods:

1. **Environment Variable**:
   ```bash
   export GITHUB_TOKEN="ghp_yourPersonalAccessToken"
   # or
   export GH_TOKEN="ghp_yourPersonalAccessToken"
   ```
2. **GitHub CLI (`gh`)**:
   ```bash
   gh auth login
   ```
   `gsoc-contrib` automatically discovers tokens from `gh` without any manual configuration.

> **Security Note**: `gsoc-contrib` never logs, prints, or stores your GitHub tokens.

---

## Configuration & Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `CONTRIB_HOME` | Custom base directory for workspaces and workspace registry | `~/.contrib` |
| `GITHUB_TOKEN` | GitHub Personal Access Token for API requests | *(none)* |
| `GH_TOKEN` | Alternative GitHub token environment variable | *(none)* |
| `NO_COLOR` | Disable terminal color output | *(none)* |

### Storage Directory Structure

Workspaces and registry are organized under `~/.contrib`:
```text
~/.contrib/
├── registry.json     # Workspace registry tracking active sessions
└── workspaces/       # Isolated blobless git workspaces
    ├── psf__requests__issue_6000/
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
