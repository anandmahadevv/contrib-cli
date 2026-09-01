/**
 * Handler for 'start' and 'contribute' commands.
 */

import { checkGitInstalled } from '../utils/git.js';
import { logger } from '../utils/logger.js';
import { createWorkspace } from '../services/workspace.js';

/**
 * Execute the workspace initialization command.
 * @param {string} target
 * @param {{ branch?: string }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleStart(target, options = {}) {
  await checkGitInstalled();

  logger.info(`Initializing workspace for: ${target}`);

  const ws = await createWorkspace(target, { branch: options.branch });

  if (ws.isNew) {
    logger.success(`Created blobless workspace.`);
  } else {
    logger.success(`Reused existing workspace clone.`);
  }

  logger.success(`Workspace ready at: ${ws.path}`);
  logger.success(`Active branch:      ${ws.branch}`);
  if (ws.title) {
    logger.success(`Title:              ${ws.title}`);
  }

  logger.plain('');
  logger.plain('To begin working, navigate to the workspace:');
  logger.step('  cd', `"${ws.path}"`);

  return 0;
}
