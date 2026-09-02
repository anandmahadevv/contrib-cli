/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'stats' command (summarize contribution activity and metrics).
 */

import fs from 'node:fs';
import { logger } from '../utils/logger.js';
import { listWorkspaces } from '../services/workspace.js';
import { runGitCommand } from '../utils/git.js';

/**
 * Display contribution metrics across workspaces.
 * @param {{ markdown?: boolean, json?: boolean }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleStats(options = {}) {
  const workspaces = listWorkspaces();

  const stats = {
    totalWorkspaces: workspaces.length,
    activeWorkspaces: 0,
    totalCommits: 0,
    items: [],
  };

  for (const ws of workspaces) {
    let commitCount = 0;
    let shortstat = '';

    if (fs.existsSync(ws.path)) {
      stats.activeWorkspaces++;
      try {
        const logRes = await runGitCommand(['log', '--oneline'], { cwd: ws.path });
        if (logRes.stdout) {
          commitCount = logRes.stdout.split('\n').filter(Boolean).length;
          stats.totalCommits += commitCount;
        }
      } catch {
        // ignore
      }

      try {
        const diffRes = await runGitCommand(['diff', '--shortstat', 'HEAD~1'], { cwd: ws.path });
        shortstat = diffRes.stdout;
      } catch {
        // ignore
      }
    }

    stats.items.push({
      id: ws.id,
      repo: `${ws.owner}/${ws.repo}`,
      issue_number: ws.issue_number,
      title: ws.title,
      branch: ws.branch,
      path: ws.path,
      mode: ws.mode || 'blobless',
      commits: commitCount,
      shortstat,
      size: ws.formattedSize,
    });
  }

  if (options.json) {
    logger.plain(JSON.stringify(stats, null, 2));
    return 0;
  }

  if (options.markdown) {
    logger.plain('# Contribution Summary Report\n');
    logger.plain(`- **Total Workspaces:** ${stats.totalWorkspaces}`);
    logger.plain(`- **Active On Disk:** ${stats.activeWorkspaces}\n`);
    logger.plain('| Workspace | Repository | Issue | Branch | Size | Commits |');
    logger.plain('| :--- | :--- | :--- | :--- | :--- | :--- |');
    for (const item of stats.items) {
      logger.plain(
        `| \`${item.id}\` | ${item.repo} | #${item.issue_number} | \`${item.branch}\` | ${item.size} | ${item.commits} |`
      );
    }
    return 0;
  }

  logger.info(`Contribution Stats Summary`);
  logger.divider(72);
  logger.plain(`  Total Workspaces:   ${stats.totalWorkspaces}`);
  logger.plain(`  Active on Disk:     ${stats.activeWorkspaces}`);
  logger.divider(72);

  if (stats.items.length === 0) {
    logger.plain('No workspaces tracked yet. Run `npx gsoc-contrib start <url>` to begin.');
    return 0;
  }

  for (const item of stats.items) {
    logger.plain(`[${item.repo} #${item.issue_number}] ${item.title || item.id}`);
    logger.dim(`  ID:     ${item.id}`);
    logger.dim(`  Branch: ${item.branch}`);
    logger.dim(`  Size:   ${item.size} (${item.mode})`);
    logger.divider(72);
  }

  return 0;
}
