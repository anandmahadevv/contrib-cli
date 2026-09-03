## What's New in v0.4.0 🏁
This major milestone introduces iron-clad corporate-grade capabilities, full offline support, an ultra-fast interactive Terminal User Interface (TUI), and unified cross-platform Matrix CI pipelines.

### 🔌 1. Smart Offline Engine (`--offline`)
Keep coding anywhere—even without a network connection.
* Local metadata caching bypasses network overhead to seamlessly fetch issue briefs from `~/.contrib/cache/api/`.
* Offline worktree generation spins up environments entirely off-grid directly from the shared bare repositories (`~/.contrib/cache/git/`).

### 🔑 2. Multi-Account Identity & SSH/GPG Profile Manager (`identity`)
Isolate open-source contributions completely from corporate/work credentials.
* **Granular Scoping:** Dynamically maps local Git parameters including `user.name`, `user.email`, `core.sshCommand`, and GPG signing credentials (`commit.gpgsign`, `user.signingkey`).
* **Profile Swapping:** Supports custom SSH config host rewrites (e.g., swapping standard targets to mapped personal handles like `git@github-personal`).
* **Commands:** `contrib identity add <name>`, `contrib identity use <name>`, or the inline execution flag: `--identity <name>`.

### 🎛️ 3. Zero-Dependency Interactive TUI Dashboard (`dashboard` / `dash`)
Experience sub-millisecond panel boots via a raw ANSI-driven Terminal UI utilizing native Node.js `readline` streams. No bulky layout packages, clean window styling, and seamless non-TTY safety hooks.
* Use `j`/`k` or arrows to browse active workspace registry states.
* **Single-Keystroke Macros:** `c` (VS Code), `n` (Neovim), `s` (Upstream Sync), `d` (Git Diff), `x` (Safe Deletion), and `Enter` (Default Editor).

### 🤖 4. Enterprise-Grade Matrix CI/CD (`ci.yml`)
Automated testing pipelines now secure every pull request and trunk update:
* Runs rigorous multi-version runtime validation across **Node.js (18, 20, 22)** and **Python 3.11**.
* Matrix configurations verify native performance properties concurrently on both Linux (`ubuntu-latest`) and Windows host architectures (`windows-latest`).
* Automatically runs verification metrics alongside automated `Snyk` security vulnerability audits.
