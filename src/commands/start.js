/**
 * Handler for 'start' and 'contribute' commands.
 */

import { checkGitInstalled } from '../utils/git.js';
import { logger } from '../utils/logger.js';
import { createWorkspace } from '../services/workspace.js';
import {
  detectDefaultEditor,
  openInEditor,
  resolveRequestedEditor,
} from '../utils/opener.js';

/**
 * Execute the workspace initialization command.
 * @param {string} target
 * @param {{
 *   branch?: string,
 *   sparse?: boolean | string | string[],
 *   mode?: 'blobless' | 'treeless' | 'shallow' | 'worktree',
 *   worktree?: boolean,
 *   fork?: boolean
 * }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleStart(target, options = {}) {
  await checkGitInstalled();

  logger.info(`Initializing workspace for: ${target}`);

  const ws = await createWorkspace(target, {
    branch: options.branch,
    sparse: options.sparse,
    mode: options.mode,
    worktree: options.worktree,
    fork: options.fork,
    install: options.install,
  });

  if (ws.isNew) {
    if (ws.isWorktree) {
      logger.success(`Created instant workspace via shared Git worktree.`);
    } else {
      logger.success(`Created ${ws.mode || 'blobless'} workspace.`);
    }
  } else {
    logger.success(`Reused existing workspace clone.`);
  }

  logger.success(`Workspace ready at: ${ws.path}`);
  logger.success(`Active branch:      ${ws.branch}`);
  if (ws.title) {
    logger.success(`Title:              ${ws.title}`);
  }

  if (ws.stack && ws.stack.type && ws.stack.type !== 'Generic / Unknown') {
    logger.success(`Detected Stack:     ${ws.stack.type} (${ws.stack.packageManager})`);
    if (ws.stack.testCommand) {
      logger.dim(`  Test command:     ${ws.stack.testCommand}`);
    }
  }

  if (ws.installed) {
    logger.success(`Dependencies:       Installed successfully`);
  }

  logger.dim(`  Context files:    ${ws.path}/.contrib/ISSUE.md`);
  logger.dim(`                    ${ws.path}/.contrib/AI_PROMPT.md`);

  logger.plain('');
  logger.plain('To begin working, navigate to the workspace:');
  logger.step('  open workspace:', `npx gsoc-contrib open ${ws.id}`);
  logger.step('  cd', `"${ws.path}"`);
  if (ws.stack && ws.stack.testCommand) {
    logger.step('  test:', ws.stack.testCommand);
  }
  logger.step('  submit PR:', 'npx gsoc-contrib submit');

  const editor = resolveRequestedEditor(options) || (options.open ? detectDefaultEditor() : null);
  if (editor) {
    logger.info(`Opening workspace in ${editor}...`);
    try {
      await openInEditor(ws.path, editor);
    } catch {
      // non-fatal
    }
  }

  return 0;
}
