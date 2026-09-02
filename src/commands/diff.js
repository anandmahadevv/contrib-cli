/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'diff' command (view and export workspace diffs).
 */

import path from 'node:path';
import { logger } from '../utils/logger.js';
import { getWorkspaceDiff, listWorkspaces, getWorkspace } from '../services/workspace.js';

/**
 * Display or export workspace diff.
 * @param {string | undefined} idOrTarget
 * @param {{ patch?: boolean, markdown?: boolean }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleDiff(idOrTarget, options = {}) {
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
    logger.plain("  Usage: npx gsoc-contrib diff <workspace-id>");
    return 1;
  }

  try {
    const res = await getWorkspaceDiff(ws.id, options);

    if (options.markdown) {
      logger.plain('```diff');
      logger.plain(res.diff || '# No changes');
      logger.plain('```');
      return 0;
    }

    logger.info(`Diff summary for workspace: ${ws.id}`);
    logger.plain(`Branch: ${ws.branch}`);
    logger.divider(72);
    if (res.summary) {
      logger.plain(res.summary);
      logger.divider(72);
    }
    if (res.diff) {
      logger.plain(res.diff);
    } else {
      logger.dim('No code differences detected against base branch.');
    }

    return 0;
  } catch (err) {
    logger.error(err.message);
    return 1;
  }
}
