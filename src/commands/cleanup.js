/**
 * Handler for 'cleanup' command.
 */

import readline from 'node:readline/promises';
import { logger } from '../utils/logger.js';
import { listWorkspaces, deleteWorkspace, getWorkspace } from '../services/workspace.js';

/**
 * Ask user for confirmation.
 * @param {string} question
 * @returns {Promise<boolean>}
 */
async function confirm(question) {
  if (!process.stdin.isTTY) {
    return false;
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const answer = await rl.question(`${question} (y/N): `);
    return answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes';
  } finally {
    rl.close();
  }
}

/**
 * Execute workspace cleanup.
 * @param {string | undefined} idOrTarget
 * @param {{ all?: boolean, yes?: boolean, force?: boolean }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleCleanup(idOrTarget, options = {}) {
  const autoConfirm = options.yes || options.force;
  const force = Boolean(options.force);
  const workspaces = listWorkspaces();

  if (workspaces.length === 0) {
    logger.info('No active contribution workspaces to clean up.');
    return 0;
  }

  if (options.all) {
    logger.warn(`You are about to remove ALL (${workspaces.length}) contribution workspaces.`);
    if (!autoConfirm) {
      const ok = await confirm('Are you sure you want to delete all workspaces?');
      if (!ok) {
        logger.plain('Cleanup cancelled.');
        return 0;
      }
    }

    let deletedCount = 0;
    let skippedCount = 0;
    for (const ws of workspaces) {
      try {
        await deleteWorkspace(ws.id, { force });
        logger.success(`Removed workspace: ${ws.id}`);
        deletedCount++;
      } catch (err) {
        logger.warn(`Skipped '${ws.id}': ${err.message}`);
        skippedCount++;
      }
    }

    if (skippedCount > 0) {
      logger.warn(`Skipped ${skippedCount} workspace(s) with uncommitted changes. Use '--force' to delete all.`);
    }
    logger.success(`Successfully cleaned up ${deletedCount} workspace(s).`);
    return 0;
  }

  if (!idOrTarget) {
    logger.warn('Please specify a workspace ID/target to clean up, or pass --all to remove all workspaces.');
    logger.plain('\nActive workspaces:');
    for (const ws of workspaces) {
      logger.plain(`  - ${ws.id} (${ws.owner}/${ws.repo}) [${ws.formattedSize}]`);
    }
    logger.plain("\nUsage: contrib cleanup <workspace-id> [-y] [-f] or contrib cleanup --all");
    return 1;
  }

  const ws = getWorkspace(idOrTarget);
  if (!ws) {
    logger.error(`Workspace not found for: '${idOrTarget}'. Run 'contrib status' to view active workspaces.`);
    return 1;
  }

  if (!autoConfirm) {
    const ok = await confirm(`Delete workspace '${ws.id}' at '${ws.path}'?`);
    if (!ok) {
      logger.plain('Cleanup cancelled.');
      return 0;
    }
  }

  try {
    await deleteWorkspace(ws.id, { force });
    logger.success(`Successfully removed workspace '${ws.id}'.`);
    return 0;
  } catch (err) {
    logger.error(err.message);
    return 1;
  }
}
