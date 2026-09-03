/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'sync' command (upstream rebase and branch synchronization).
 */

import path from 'node:path';
import { logger } from '../utils/logger.js';
import { syncWorkspace, listWorkspaces, getWorkspace } from '../services/workspace.js';

/**
 * Sync contribution workspace with upstream changes.
 * @param {string | undefined} idOrTarget
 * @param {{ push?: boolean, fork?: boolean }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleSync(idOrTarget, options = {}) {
  let ws = null;
  if (idOrTarget) {
    ws = getWorkspace(idOrTarget);
  } else {
    const cwd = process.cwd();
    const allWs = listWorkspaces();
    ws = allWs.find((w) => path.resolve(w.path) === path.resolve(cwd) || cwd.startsWith(path.resolve(w.path))) || null;
  }

  if (!ws) {
    logger.error('No workspace specified or detected. Please run inside a workspace or provide a workspace ID:');
    logger.plain("  Usage: npx gsoc-contrib sync <workspace-id>");
    return 1;
  }

  logger.info(`Syncing workspace '${ws.id}' with upstream...`);

  try {
    const res = await syncWorkspace(ws.id, options);
    logger.success(res.message);
    return 0;
  } catch (err) {
    logger.error(err.message);
    return 1;
  }
}
