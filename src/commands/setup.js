/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'setup' command (install and configure dependencies in a workspace).
 */

import path from 'node:path';
import { logger } from '../utils/logger.js';
import { listWorkspaces, getWorkspace } from '../services/workspace.js';
import { detectProjectStack, installDependencies } from '../utils/git.js';

/**
 * Install dependencies in a workspace.
 * @param {string | undefined} idOrTarget
 * @returns {Promise<number>} Exit code
 */
export async function handleSetup(idOrTarget) {
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
    logger.plain("  Usage: npx gsoc-contrib setup <workspace-id>");
    return 1;
  }

  const stack = detectProjectStack(ws.path);
  logger.info(`Detected project stack: ${stack.type} (${stack.packageManager})`);
  logger.info(`Installing dependencies in '${ws.path}'...`);

  const res = await installDependencies(ws.path, stack);
  if (res.success) {
    logger.success(`Successfully ran: ${res.command}`);
    if (stack.testCommand) {
      logger.step('  Run tests with:', stack.testCommand);
    }
    return 0;
  } else {
    logger.error(`Dependency installation failed: ${res.output}`);
    return 1;
  }
}
