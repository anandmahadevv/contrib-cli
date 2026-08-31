# gsoc-contrib (`contrib`)

> A fast, lightweight contribution workspace manager for GitHub issues without repeatedly cloning entire repositories.

---

## Problem
When contributing to open-source repositories, developers typically clone multi-gigabyte git repositories just to fix a single bug or submit a small pull request. This wastes bandwidth, consumes disk space, and slows down development onboarding.

## Solution
`contrib` creates isolated, lightweight workspaces for specific GitHub issues using Git's blobless and sparse checkout capabilities. It resolves issue metadata, sets up a focused branch, and tracks all your ongoing contributions from a single CLI.

---

## Features
- **Issue-Driven Workspaces**: Initialize a workspace directly from any GitHub issue or PR URL.
- **Blobless & Shallow Git Cloning**: Minimizes downloaded data and disk usage.
- **Issue Analysis**: Scans issue descriptions for referenced files, modules, and labels.
- **Workspace Registry**: Inspect and manage all active contribution environments with `contrib status`.
- **Zero External Dependencies**: Fast execution with standard Python library modules.

---

## Installation

Install from PyPI:

```bash
pip install gsoc-contrib
```

Verify installation:

```bash
contrib --version
contrib --help
```

---

## Usage

### 1. Start a Contribution Workspace
Create a local workspace linked to an issue:

```bash
contrib start https://github.com/psf/requests/issues/6000
```

With a custom branch name:

```bash
contrib start https://github.com/psf/requests/issues/6000 -b fix-header-parsing
```

### 2. Analyze an Issue
Extract metadata and candidate files mentioned in the issue:

```bash
contrib analyze https://github.com/psf/requests/issues/6000
```

### 3. Check Workspace Status
List all active workspaces:

```bash
contrib status
```

---

## License

This project is licensed under the [MIT License](LICENSE).
