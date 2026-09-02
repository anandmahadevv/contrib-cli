/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'submit' and 'pr' commands (PR workflow assistance).
 */

import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger.js';
import { getGitStatusSummary, runGitCommand } from '../utils/git.js';
import { listWorkspaces, getWorkspace } from '../services/workspace.js';

/**
 * Assist contributor in submitting their changes as a pull request.
 * @param {string | undefined} idOrTarget
 * @param {{ title?: string, body?: string }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleSubmit(idOrTarget, options = {}) {
  let ws = null;
  if (idOrTarget) {
    ws = getWorkspace(idOrTarget);
  } else {
    // Check if cwd is inside an active workspace
    const cwd = process.cwd();
    const allWs = listWorkspaces();
    ws = allWs.find((w) => path.resolve(w.path) === path.resolve(cwd) || cwd.startsWith(path.resolve(w.path))) || null;
  }

  if (!ws) {
    logger.error('No workspace specified or detected. Please run from inside a workspace or provide a workspace ID:');
    logger.plain("  Usage: npx gsoc-contrib submit <workspace-id>");
    return 1;
  }

  if (!fs.existsSync(ws.path)) {
    logger.error(`Workspace directory does not exist: ${ws.path}`);
    return 1;
  }

  logger.info(`Preparing submission for workspace: ${ws.id}`);
  logger.plain(`  Repository: ${ws.owner}/${ws.repo} (Issue #${ws.issue_number || 'main'})`);
  logger.plain(`  Branch:     ${ws.branch}`);
  logger.divider(72);

  const gitStatus = await getGitStatusSummary(ws.path);

  if (gitStatus.isDirty) {
    logger.warn(`You have ${gitStatus.files.length} uncommitted or untracked file(s):`);
    for (const f of gitStatus.files.slice(0, 8)) {
      logger.plain(`    ${f}`);
    }
    if (gitStatus.files.length > 8) {
      logger.dim(`    ... and ${gitStatus.files.length - 8} more`);
    }
    logger.plain('\nPlease stage and commit your changes first:');
    logger.step('  git add .', '&& git commit -m "fix: resolve issue"');
    logger.divider(72);
  }

  const prTitle = options.title || `fix: resolve issue #${ws.issue_number || 'contribution'}`;
  const prBody = options.body || `Fixes #${ws.issue_number || ''}\n\n## Summary\nContribution for issue #${ws.issue_number}: ${ws.title || ''}`;

  const compareUrl = `https://github.com/${ws.owner}/${ws.repo}/compare/main...${ws.branch}?expand=1`;

  logger.success('Pull Request Details:');
  logger.plain(`  Title:   ${prTitle}`);
  logger.plain(`  Body:    Fixes #${ws.issue_number || ''}`);
  logger.plain(`  Compare: ${compareUrl}`);

  logger.plain('');
  logger.success('Next Steps:');
  logger.step('  1. Push your branch:', `git push origin ${ws.branch}`);
  logger.step('  2. Create PR with gh CLI:', `gh pr create --title "${prTitle}" --body "Fixes #${ws.issue_number || ''}"`);
  logger.step('  3. Or open browser URL:', compareUrl);

  return 0;
}
