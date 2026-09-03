/**
 * Handler for 'status' command.
 */

import { logger } from '../utils/logger.js';
import { listWorkspaces } from '../services/workspace.js';

/**
 * List all active contribution workspaces.
 * @param {{ ids?: boolean }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleStatus(options = {}) {
  const workspaces = listWorkspaces();

  if (options && options.ids) {
    process.stdout.write(workspaces.map((w) => w.id).join('\n') + (workspaces.length ? '\n' : ''));
    return 0;
  }

  if (workspaces.length === 0) {
    logger.plain('No active contribution workspaces found.');
    logger.plain("Run 'contrib start <issue-url>' or 'npx gsoc-contrib contribute <owner/repo>' to create one.");
    return 0;
  }

  logger.plain(`Active Contribution Workspaces (${workspaces.length}):`);
  logger.divider(72);

  for (const ws of workspaces) {
    logger.plain(`  ID:     ${ws.id}`);
    logger.plain(`  Repo:   ${ws.owner}/${ws.repo} (Issue #${ws.issue_number || 'main'})`);
    logger.plain(`  Branch: ${ws.branch}`);
    logger.plain(`  Path:   ${ws.path}`);
    if (ws.formattedSize) {
      logger.plain(`  Size:   ${ws.formattedSize}`);
    }
    logger.divider(72);
  }

  return 0;
}
