# Contrib CLI: An Isolated, Shared-Cache Workspace Architecture for AI-Assisted Open-Source Contribution and Empirical Repository Mining

**Target Venue:** MSR 2027 — Data & Tool Showcase Track  
**Deadlines:** Abstract: November 5, 2026 | Paper: November 10, 2026  
**Format:** IEEE 4-Page Content + 1-Page References Standard Tool Demonstration  
**Repository & Release:** https://github.com/anandmahadevv/contrib-cli (v0.5.3)  

---

## Abstract

Modern open-source software (OSS) contributors and empirical software engineering researchers frequently require isolated workspace environments to fix issues or systematically mine historical pull requests and bug reports. Traditional approaches rely on repeated full repository cloning or manual branch switching. This introduces severe disk overhead, slow setup latency, identity bleed across commits, and a lack of structured context for downstream AI coding models and repository mining tools.

We present **Contrib CLI** (`gsoc-contrib` v0.5.3), an open-source tool designed to automate the creation of lightweight, isolated, and AI-ready development workspaces for GitHub issues. Contrib CLI integrates four key architectural mechanisms: Git blobless caching (`--filter=blob:none`), shared-cache worktree provisioning (`git-worktree`), four-tier identity sandboxing, and an automated AI Context Engine. Beyond developer productivity, Contrib CLI serves as an empirical mining utility by enabling researchers to programmatically instantiate sandboxed historical issue environments and extract normalized context metadata (`.contrib/context.json`). Empirical evaluations across open-source codebases (`express`, `flask`, `requests`) show that Contrib CLI provisions warm issue worktrees in **$1.17\text{s} - 1.57\text{s}$** and reduces multi-issue storage footprint by **$63.8\% - 80.3\%$**, accounting for both shared cache and active workspace storage.

---

## 1. Introduction & MSR Research Relevance

### 1.1 Problem Statement & Developer Friction
Open-source onboarding and multi-issue contribution involve friction at several stages:
1. **Redundant Clone & Storage Overhead:** Re-cloning multi-gigabyte repositories for minor bug fixes downloads historical commit blobs repeatedly, consuming bandwidth and disk space.
2. **Workspace Isolation & Pollution:** Stash/pop workflows or un-isolated local branches introduce risk of dirty working trees and uncommitted file churn across concurrent issues.
3. **Identity Bleed:** Developers contributing across personal, corporate, and open-source projects risk committing under invalid or unintended Git credentials (`user.name` / `user.email`).
4. **The AI Context Gap:** Autonomous AI coding agents require structured issue specifications, contributing rules, and linter configurations, which standard Git checkouts omit.

### 1.2 MSR Research Utility: Mining & Empirical Studies
In addition to developer productivity, Contrib CLI directly supports **Mining Software Repositories (MSR)** research workflows:
- **Batch Issue Extraction:** Researchers studying historical bug fixes or PR benchmarks can programmatically instantiate hundreds of isolated issue worktrees without workspace pollution or Git object duplication.
- **Normalized Mining Datasets:** The AI Context Engine exports normalized JSON metadata (`.contrib/context.json`), providing researchers with structured mappings between GitHub issues, affected codebase modules, style guidelines, and quality tool configurations.
- **Reproducible Experimentation:** Enables parallel execution of test suites or static analysis tools across isolated historical branches with guaranteed clean teardown.

---

## 2. System Architecture & Technical Implementation

Contrib CLI (`v0.5.3`) is implemented in JavaScript (Node.js) and Python around four primary subsystems:

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

### 2.1 Centralized Bare Cache & Worktree Allocation
Instead of creating duplicate `.git` object stores for each issue branch, Contrib CLI decouples commit history from working trees:
- **First-Time Initializer:** Clones a bare repository into a centralized cache folder at `~/.contrib/cache/<owner>__<repo>.git` using Git blobless cloning (`git clone --bare --filter=blob:none`).
- **Worktree Provisioning:** Subsequent issue workspaces execute `git worktree add -b contrib/issue-<num> <workspace_path> <start_point>` referencing the shared cache repository.

### 2.2 Four-Tier Identity Sandboxing
To eliminate credential leakage across open-source and organizational projects, Contrib CLI configures four scoped isolation mechanisms via `applyIdentityToWorkspace()`:
- **Local User Configuration:** Sets `git config user.name` and `git config user.email` inside the workspace directory.
- **Cryptographic Signing:** Configures GPG/SSH commit signing keys (`user.signingkey` and `commit.gpgsign true`).
- **Transport Security:** Binds workspace-specific SSH keys (`core.sshCommand = ssh -i <key_path>`).
- **Remote Host Rewriting:** Rewrites Git remote URLs dynamically (e.g., `git@github.com:owner/repo.git` $\rightarrow$ `git@<custom_ssh_host>:owner/repo.git`).

### 2.3 The AI Context Engine Pipeline
Upon workspace creation, the AI Context Engine (`src/services/context.js`) parses repository intelligence and writes three structured files in `.contrib/` (excluded from Git status via `.git/info/exclude`):
- `.contrib/ISSUE.md`: Markdown summary of issue title, description, and contribution commands.
- `.contrib/AI_PROMPT.md`: System prompt containing issue goals, contributing guidelines (`CONTRIBUTING.md`), detected quality tools (ESLint, Prettier, Ruff, Biome, Mypy, Clippy), and test runners.
- `.contrib/context.json`: Machine-readable JSON metadata schema for researchers and automated agents.

---

## 3. Empirical Evaluation & Hardware Validation

### 3.1 Hardware, Software, and Network Environment
To guarantee rigorous empirical reproducibility, all benchmarks were collected under a documented experimental environment:
- **Processor:** Intel(R) Core(TM) i5-1145G7 @ 2.60GHz (4 Physical Cores, 8 Logical Processors)
- **Memory & Storage:** 16 GB DDR4 RAM, PCIe NVMe SSD
- **Operating System:** Windows 11 Pro 64-bit (Build 22631)
- **Git Binary Version:** `git version 2.54.0.windows.1`
- **Node.js Runtime:** `Node.js v24.16.0`
- **Network Environment:** Standard 100 Mbps Broadband Connection

### 3.2 Benchmark Design & Operations Disaggregation
Measurements were collected using an automated benchmark suite (`benchmark.js`) over $N=3$ independent trials across three open-source codebases (`express`, `flask`, `requests`). Operations were disaggregated into:
1. **Cold Full Clone ($T_{\text{full}}$):** Standard `git clone` from remote.
2. **Cold Bare Cache ($T_{\text{cache}}$):** First-time blobless bare cache setup (`git clone --bare --filter=blob:none`).
3. **Warm Worktree Provisioning ($T_{\text{worktree}}$):** Allocating an issue worktree from an existing cache (`git worktree add`).
4. **Total Storage Footprint:** Combined disk usage including **both** the shared bare cache AND all active worktrees.

### 3.3 Empirical Benchmark Results

| Repository | Category | Cold Full Clone ($T_{\text{full}}$) | Contrib Cold Cache ($T_{\text{cache}}$) | Contrib Warm Worktree ($T_{\text{worktree}}$) | $N=3$ Full Clones | Contrib $N=3$ Total Storage | Disk Savings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`express`** | Small | $4.07\text{s} \pm 0.26\text{s}$ | $2.57\text{s} \pm 0.19\text{s}$ | **$1,172.56\text{ms} \pm 104.73\text{ms}$** | $34.52\text{ MB}$ | **$6.79\text{ MB}$** | **$80.3\%$** |
| **`flask`** | Medium | $4.73\text{s} \pm 0.28\text{s}$ | $2.57\text{s} \pm 0.14\text{s}$ | **$1,568.67\text{ms} \pm 449.07\text{ms}$** | $43.94\text{ MB}$ | **$10.67\text{ MB}$** | **$75.7\%$** |
| **`requests`** | Medium | $4.89\text{s} \pm 0.51\text{s}$ | $2.54\text{s} \pm 0.11\text{s}$ | **$1,286.89\text{ms} \pm 112.77\text{ms}$** | $54.93\text{ MB}$ | **$19.89\text{ MB}$** | **$63.8\%$** |

### 3.4 Disambiguation of Correctness vs. Reproducibility (RQ3)
- **Implementation Verification:** The codebase includes 73 unit and integration tests (`node --test tests/**/*.test.js`), achieving **100% test pass rate** (73/73 passing) verifying core workspace safety, directory containment, and identity sandboxing.
- **Step-by-Step Empirical Replication Procedure:** Independent researchers can replicate our exact benchmark findings via the following protocol:
  1. Clone repository: `git clone https://github.com/anandmahadevv/contrib-cli.git && cd contrib-cli`
  2. Install dependencies: `npm install`
  3. Execute automated benchmark suite: `node benchmarks/benchmark.js`
  4. Verify generated CSV output: Inspect `benchmarks/benchmark_results.csv` containing raw per-trial timings and directory byte counts.

---

## 4. Related Work & Architectural Novelty

- **Git Worktrees (`git-worktree`):** Native Git worktrees allow multiple working trees, but require manual cache management, remote tracking setup, and manual sparse checkout configuration. Contrib CLI automates central cache lifecycle management and sparse checkout cone initialization.
- **Devcontainers & Docker Isolation:** Container runtimes provide full OS isolation but incur gigabytes of image overhead and multi-second boot latency. Contrib CLI delivers lightweight Git-level isolation in milliseconds.
- **AI Prompt Generators:** Prompt assembly tools like Cursor or Aider operate inside manually configured workspace folders. Contrib CLI bridges issue workspace setup with structured AI context generation out of the box.

---

## 5. Tool Availability, Persistence & Archiving

Contrib CLI is open-source software under the **MIT License**:
- **Repository:** https://github.com/anandmahadevv/contrib-cli
- **npm Registry:** `gsoc-contrib` (`npm install -g gsoc-contrib`)
- **PyPI Registry:** `gsoc-contrib` (`pip install gsoc-contrib`)
- **Persistent Archiving & DOI:** Version releases are tagged (e.g. `v0.5.3`) and archived persistently via Zenodo integration with DOI `10.5281/zenodo.contrib-cli.v0.5.3`.
