/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Interactive TUI Workspace Dashboard ('dashboard').
 * Zero-dependency raw-mode terminal dashboard with single-keystroke navigation and operations.
 */

import readline from 'node:readline';
import { listWorkspaces } from '../services/workspace.js';
import { handleOpen } from './open.js';
import { handleSync } from './sync.js';
import { handleDiff } from './diff.js';
import { handleCleanup } from './cleanup.js';
import { handleStatus } from './status.js';

// ANSI color and style helpers
const ESC = '\x1b[';
const CLEAR = `${ESC}2J${ESC}3J${ESC}H`;
const HIDE_CURSOR = `${ESC}?25l`;
const SHOW_CURSOR = `${ESC}?25h`;
const BOLD = `${ESC}1m`;
const RESET = `${ESC}0m`;
const CYAN = `${ESC}36m`;
const GREEN = `${ESC}32m`;
const YELLOW = `${ESC}33m`;
const MAGENTA = `${ESC}35m`;
const DIM = `${ESC}2m`;
const INVERSE = `${ESC}7m`;

/**
 * Launch the interactive TUI workspace dashboard.
 * @returns {Promise<number>}
 */
export async function handleDashboard() {
  // If not a TTY (e.g. redirected or CI), fallback to standard status display
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return handleStatus();
  }

  let workspaces = listWorkspaces();
  if (workspaces.length === 0) {
    process.stdout.write('\nNo active contribution workspaces found.\n');
    process.stdout.write("Create one first using: npx gsoc-contrib start <issue-url>\n\n");
    return 0;
  }

  let selectedIndex = 0;
  let statusMessage = 'Ready. Use arrow keys to navigate.';
  let isExiting = false;

  // Render the full TUI screen
  function render() {
    workspaces = listWorkspaces();
    if (workspaces.length === 0) {
      cleanup();
      process.stdout.write('\nAll workspaces have been cleaned up.\n\n');
      return;
    }
    if (selectedIndex >= workspaces.length) {
      selectedIndex = Math.max(0, workspaces.length - 1);
    }

    const lines = [];
    lines.push(CLEAR + HIDE_CURSOR);
    lines.push(`${CYAN}${BOLD}╔════════════════════════════════════════════════════════════════════════════════════╗${RESET}`);
    lines.push(`${CYAN}${BOLD}║                     gsoc-contrib Workspace Dashboard (v0.3.0)                      ║${RESET}`);
    lines.push(`${CYAN}${BOLD}╚════════════════════════════════════════════════════════════════════════════════════╝${RESET}`);
    lines.push('');

    // Table Header
    lines.push(
      `  ${BOLD}${'WORKSPACE ID'.padEnd(30)} ${'REPO & ISSUE'.padEnd(24)} ${'BRANCH'.padEnd(16)} ${'SIZE'.padEnd(10)}${RESET}`
    );
    lines.push(`  ${DIM}──────────────────────────────────────────────────────────────────────────────────${RESET}`);

    // Workspace Rows
    workspaces.forEach((ws, idx) => {
      const isSelected = idx === selectedIndex;
      const cursor = isSelected ? `${GREEN}${BOLD}▶ ${RESET}` : '  ';
      const idStr = ws.id.length > 28 ? `${ws.id.slice(0, 25)}...` : ws.id;
      const repoIssue = `${ws.owner}/${ws.repo} #${ws.issue_number || 'main'}`;
      const repoStr = repoIssue.length > 22 ? `${repoIssue.slice(0, 19)}...` : repoIssue;
      const branchStr = ws.branch.length > 14 ? `${ws.branch.slice(0, 12)}..` : ws.branch;
      const sizeStr = ws.formattedSize || 'N/A';

      if (isSelected) {
        lines.push(
          `${cursor}${INVERSE}${BOLD}${idStr.padEnd(30)} ${repoStr.padEnd(24)} ${branchStr.padEnd(16)} ${sizeStr.padEnd(10)}${RESET}`
        );
      } else {
        lines.push(
          `${cursor}${idStr.padEnd(30)} ${repoStr.padEnd(24)} ${branchStr.padEnd(16)} ${DIM}${sizeStr.padEnd(10)}${RESET}`
        );
      }
    });

    lines.push(`  ${DIM}──────────────────────────────────────────────────────────────────────────────────${RESET}`);

    // Selected Workspace Details
    const sel = workspaces[selectedIndex];
    if (sel) {
      lines.push(`${BOLD}Selected:${RESET} ${CYAN}${sel.id}${RESET}`);
      lines.push(`  ${DIM}Path:${RESET}     ${sel.path}`);
      lines.push(`  ${DIM}Stack:${RESET}    ${sel.stack?.type || 'Generic'} (${sel.stack?.packageManager || 'unknown'})`);
      if (sel.identity) {
        lines.push(`  ${DIM}Identity:${RESET} ${YELLOW}${sel.identity}${RESET}`);
      }
      if (sel.fork) {
        lines.push(`  ${DIM}Fork:${RESET}     ${sel.fork.url}`);
      }
    }

    lines.push('');
    // Shortcuts Bar
    lines.push(`${DIM}Hotkeys:${RESET}`);
    lines.push(
      `  ${BOLD}[↑/k]${RESET} Up  ${BOLD}[↓/j]${RESET} Down  ${BOLD}[Enter/o]${RESET} Open  ${BOLD}[a]${RESET} Antigravity  ${BOLD}[c]${RESET} VS Code  ${BOLD}[n]${RESET} Neovim`
    );
    lines.push(
      `  ${BOLD}[s]${RESET} Sync  ${BOLD}[d]${RESET} Diff      ${BOLD}[x]${RESET} Delete Workspace  ${BOLD}[q/Esc]${RESET} Quit Dashboard`
    );

    // Status / Message footer
    lines.push('');
    lines.push(`  ${MAGENTA}• ${statusMessage}${RESET}`);

    process.stdout.write(lines.join('\n'));
  }

  function cleanup() {
    isExiting = true;
    try {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    } catch {}
    process.stdout.write(SHOW_CURSOR + '\n');
  }

  return new Promise((resolve) => {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    render();

    process.stdin.on('keypress', async (str, key) => {
      if (isExiting) return;

      // Exit shortcuts: q, Escape, Ctrl+C
      if (str === 'q' || str === 'Q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        cleanup();
        process.stdout.write('\nExited dashboard.\n');
        resolve(0);
        return;
      }

      // Navigation: Up / k
      if (key.name === 'up' || str === 'k') {
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : workspaces.length - 1;
        render();
        return;
      }

      // Navigation: Down / j
      if (key.name === 'down' || str === 'j') {
        selectedIndex = selectedIndex < workspaces.length - 1 ? selectedIndex + 1 : 0;
        render();
        return;
      }

      const sel = workspaces[selectedIndex];
      if (!sel) return;

      // Action: Open in default editor (Enter, o)
      if (key.name === 'return' || str === 'o') {
        statusMessage = `Opening '${sel.id}' in default editor...`;
        render();
        try {
          await handleOpen(sel.id, {});
          statusMessage = `Launched default editor for '${sel.id}'.`;
        } catch (err) {
          statusMessage = `Failed to open: ${err.message}`;
        }
        render();
        return;
      }

      // Action: Open in Antigravity IDE (a)
      if (str === 'a' || str === 'A') {
        statusMessage = `Opening '${sel.id}' in Antigravity IDE...`;
        render();
        try {
          await handleOpen(sel.id, { antigravity: true });
          statusMessage = `Launched Antigravity IDE for '${sel.id}'.`;
        } catch (err) {
          statusMessage = `Failed to open: ${err.message}`;
        }
        render();
        return;
      }

      // Action: Open in VS Code (c)
      if (str === 'c' || str === 'C') {
        statusMessage = `Opening '${sel.id}' in Visual Studio Code...`;
        render();
        try {
          await handleOpen(sel.id, { code: true });
          statusMessage = `Launched VS Code for '${sel.id}'.`;
        } catch (err) {
          statusMessage = `Failed to open: ${err.message}`;
        }
        render();
        return;
      }

      // Action: Open in Neovim (n)
      if (str === 'n' || str === 'N') {
        cleanup();
        try {
          await handleOpen(sel.id, { nvim: true });
        } catch {}
        resolve(0);
        return;
      }

      // Action: Sync with upstream (s)
      if (str === 's' || str === 'S') {
        statusMessage = `Syncing '${sel.id}' with upstream...`;
        render();
        try {
          const res = await handleSync(sel.id, { push: true });
          statusMessage = res === 0 ? `Successfully synced '${sel.id}'!` : `Sync failed for '${sel.id}'.`;
        } catch (err) {
          statusMessage = `Sync failed: ${err.message}`;
        }
        render();
        return;
      }

      // Action: Git Diff (d)
      if (str === 'd' || str === 'D') {
        cleanup();
        try {
          await handleDiff(sel.id, {});
        } catch {}
        resolve(0);
        return;
      }

      // Action: Cleanup workspace (x)
      if (str === 'x' || str === 'X') {
        statusMessage = `Cleaning up '${sel.id}'...`;
        render();
        try {
          await handleCleanup(sel.id, { yes: true });
          statusMessage = `Removed workspace '${sel.id}'.`;
        } catch (err) {
          statusMessage = `Cleanup failed: ${err.message}`;
        }
        render();
        return;
      }
    });
  });
}
