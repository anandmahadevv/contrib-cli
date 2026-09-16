---
title: 'Contrib CLI: An Isolated, Shared-Cache Workspace Architecture for AI-Assisted Open-Source Contribution'
tags:
  - Developer Tools
  - Git Worktrees
  - Open Source
  - Software Engineering
  - AI Context Engine
  - Software Isolation
authors:
  - name: Anand M
    orcid: 0009-0000-0000-0000
    affiliation: 1
affiliations:
  - name: Independent Developer / Open Source Maintainer
    index: 1
date: 17 September 2026
bibliography: paper.bib
---

# Summary

Modern open-source software (OSS) development requires developers to switch contexts frequently between bug reports, feature requests, and code reviews. Traditional workflows rely on repeated full repository cloning or manual branch switching. This leads to disk overhead, slow workspace setup, identity pollution across commits, and missing structured context for modern AI coding assistants.

`Contrib CLI` (`gsoc-contrib` v0.5.3) is an open-source tool that automates the creation of isolated, lightweight, and AI-ready development environments for GitHub issues. By combining Git blobless cloning (`--filter=blob:none`), shared-cache worktree management, per-workspace identity sandboxing, sparse checkouts, and an automated AI Context Engine, Contrib CLI eliminates setup friction and accelerates contribution workflows.

# Statement of Need

As software repositories grow in scale and history, setup friction impedes open-source participation [@spinellis2012git]. Key challenges include:

1. **Storage and Network Redundancy:** Re-cloning large repositories for small issue fixes wastes disk space and network bandwidth.
2. **Workspace Pollution:** Managing multiple working branches in a single directory leads to uncommitted file confusion or dirty working trees.
3. **Identity Bleed:** Developers working across personal and organizational projects risk committing under improper Git user credentials (`user.name` / `user.email`).
4. **AI Context Disconnect:** Autonomous AI coding agents require structured repository metadata, contributing guidelines, and test instructions, which are absent from standard Git checkouts.

Contrib CLI addresses these challenges by provisioning isolated worktrees attached to a centralized bare cache [@gitworktree] while assembling surgical AI prompt files (`.contrib/AI_PROMPT.md`).

# System Architecture & Technical Implementation

Contrib CLI (`v0.5.3`) is implemented in Node.js and Python, featuring four core subsystems:

```
                          +------------------------------+
                          |      GitHub Issue ID/URL     |
                          +------------------------------+
                                         |
                                         v
                          +------------------------------+
                          |   Contrib CLI Engine (`contrib`) |
                          +------------------------------+
                            /         |        \        \
                           /          |         \        \
                          v           v          v        v
                  +------------+ +--------+ +--------+ +------------+
                  |  Blobless  | | Shared | | Identity| | AI Context |
                  | Bare Cache | |Worktrees| | Sandbox| |   Engine   |
                  +------------+ +--------+ +--------+ +------------+
                          \           |          /        /
                           v          v         v        v
                        +------------------------------------+
                        | Isolated, Ready-to-Use Workspace   |
                        |   (.contrib/AI_PROMPT.md ready)    |
                        +------------------------------------+
```

## 1. Centralized Bare Cache & Worktree Provisioning
When interacting with a repository for the first time, Contrib CLI initializes a bare cache repository at `~/.contrib/cache/<owner>__<repo>.git` using Git blobless cloning (`git clone --bare --filter=blob:none`) [@gitpartialclone]. Subsequent issue environments execute `git worktree add -b contrib/issue-<num> <workspace_path> <start_point>` referencing the shared cache.

## 2. Scoped Identity Sandboxing
To enforce organizational compliance, Contrib CLI configures per-workspace identity controls via `applyIdentityToWorkspace()`:
- **Local User Profile:** Applies `git config user.name` and `git config user.email` inside the workspace directory.
- **Cryptographic Signing:** Configures GPG/SSH commit signing (`user.signingkey` and `commit.gpgsign true`).
- **Transport Security & Remote Rewriting:** Sets workspace-level SSH keys (`core.sshCommand = ssh -i <key_path>`) and rewrites remote URLs from `git@github.com:...` to host-aliased endpoints (`git@<custom_host>:...`).

## 3. The AI Context Engine Pipeline
Upon workspace creation, the AI Context Engine (`src/services/context.js`) scans the codebase and outputs three artifacts in `.contrib/` (excluded via `.git/info/exclude`):
- `.contrib/ISSUE.md`: Markdown summary of issue title, description, and quick contribution commands.
- `.contrib/AI_PROMPT.md`: System prompt containing issue goals, contributing guidelines (`CONTRIBUTING.md`), detected quality tools (ESLint, Prettier, Ruff, Biome, Mypy, Clippy), and test runners.
- `.contrib/context.json`: Machine-readable metadata schema.

# Experimental Evaluation & Results

We evaluated Contrib CLI v0.5.3 across three open-source codebases (`express`, `flask`, `requests`) across $N=3$ experimental trials using an automated benchmark suite (`benchmark.js`).

## Measured Performance Metrics

| Repository | Category | Cold Full Clone ($T_{\text{full}}$) | Contrib Cold Cache ($T_{\text{cache}}$) | Contrib Warm Worktree ($T_{\text{worktree}}$) | $N=3$ Full Clones Disk | Contrib $N=3$ Total Disk | Storage Savings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`express`** | Small | $4.07\text{s} \pm 0.26\text{s}$ | $2.57\text{s} \pm 0.19\text{s}$ | **$1,172.56\text{ms} \pm 104.73\text{ms}$** | $34.52\text{ MB}$ | **$6.79\text{ MB}$** | **$80.3\%$** |
| **`flask`** | Medium | $4.73\text{s} \pm 0.28\text{s}$ | $2.57\text{s} \pm 0.14\text{s}$ | **$1,568.67\text{ms} \pm 449.07\text{ms}$** | $43.94\text{ MB}$ | **$10.67\text{ MB}$** | **$75.7\%$** |
| **`requests`** | Medium | $4.89\text{s} \pm 0.51\text{s}$ | $2.54\text{s} \pm 0.11\text{s}$ | **$1,286.89\text{ms} \pm 112.77\text{ms}$** | $54.93\text{ MB}$ | **$19.89\text{ MB}$** | **$63.8\%$** |

## Results Analysis
1. **Cold Initialization ($T_{\text{cache}}$ vs $T_{\text{full}}$):** Initializing a blobless bare cache reduced cold setup latency by 36.8%–48.0% compared to standard full clones.
2. **Warm Workspace Spin-up ($T_{\text{worktree}}$):** Provisioning additional issue worktrees attached to an existing cache completed in an average of $1.17\text{s}$ to $1.57\text{s}$.
3. **Storage Accounting Transparency:** Contrib's total disk footprint ($6.79\text{ MB} - 19.89\text{ MB}$) **explicitly includes both the central bare cache and all $N=3$ active worktrees combined**, demonstrating storage savings of **63.8% to 80.3%**.

## Benchmark Environment & Reproducibility Specifications
- **Operating System:** Windows 11 Pro (x64)
- **Git Binary Version:** `git version 2.54.0.windows.1`
- **Node.js Runtime:** `Node.js v24.16.0`
- **Benchmark Driver:** [`benchmark.js`](file:///C:/Users/anand/contrib-cli/benchmark.js)
- **Raw Experimental Data:** [`benchmark_results.csv`](file:///C:/Users/anand/contrib-cli/benchmark_results.csv)

# Limitations & Future Work

- **Monorepo Submodule Boundaries:** Deeply nested submodules may require additional explicit fetch passes.
- **Future Roadmap:** Expansion of the AI Context Engine to support local vector indexers and containerized execution environments (e.g., Devcontainers).

# Software Availability & Licensing

Contrib CLI is open-source software under the **MIT License**.
- **Repository:** [github.com/anandmahadevv/contrib-cli](https://github.com/anandmahadevv/contrib-cli)
- **npm Package:** `gsoc-contrib` (`npm install -g gsoc-contrib`)
- **PyPI Package:** `gsoc-contrib` (`pip install gsoc-contrib`)

# References
