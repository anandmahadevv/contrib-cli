/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'doctor' command (diagnostics for environment and workspaces).
 */

import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger.js';
import { checkGitInstalled, getGitStatusSummary, getDirectorySize, formatBytes, detectProjectStack } from '../utils/git.js';
import { checkGitHubAuth } from '../services/github.js';
import { getContribHome, getWorkspacesDir, getCacheDir, getRegistryFile } from '../config/index.js';
import { listWorkspaces, getWorkspace } from '../services/workspace.js';

/**
 * Run comprehensive health checks and workspace inspection.
 * @param {string | undefined} idOrTarget
 * @returns {Promise<number>} Exit code
 */
export async function handleDoctor(idOrTarget) {
  logger.info('Running contrib-cli environment and workspace diagnostics...');
  logger.divider(72);

  // 1. System Runtime & Tools
  logger.success(`Node.js Runtime:     v${process.versions.node}`);

  let gitInstalled = false;
  try {
    const gitVer = await checkGitInstalled();
    logger.success(`Git Executable:      ${gitVer}`);
    gitInstalled = true;
  } catch (err) {
    logger.error(`Git Executable:      Not found (${err.message})`);
  }

  // 2. GitHub Auth
  const auth = await checkGitHubAuth();
  if (auth.authenticated) {
    logger.success(`GitHub Auth:         Configured (${auth.tokenSource})`);
    logger.success(`Rate Limit:          ${auth.remaining} / ${auth.limit} requests remaining`);
  } else {
    logger.warn(`GitHub Auth:         Unauthenticated (${auth.remaining} / ${auth.limit} remaining)`);
  }

  // 3. Storage & Cache
  const wsDir = getWorkspacesDir();
  const cacheDir = getCacheDir();
  const wsSize = getDirectorySize(wsDir);
  const cacheSize = getDirectorySize(cacheDir);

  logger.success(`Workspaces Root:     ${wsDir} (${formatBytes(wsSize)})`);
  logger.success(`Cache Directory:     ${cacheDir} (${formatBytes(cacheSize)})`);

  // 4. Target Workspace or Current Directory Inspection
  let targetWs = null;
  if (idOrTarget) {
    targetWs = getWorkspace(idOrTarget);
  } else {
    // Check if current working directory is an active workspace
    const cwd = process.cwd();
    const allWs = listWorkspaces();
    targetWs = allWs.find((w) => path.resolve(w.path) === path.resolve(cwd)) || null;
  }

  if (targetWs) {
    logger.divider(72);
    logger.plain(`Inspecting Workspace: ${targetWs.id}`);
    logger.plain(`  Repo:            ${targetWs.owner}/${targetWs.repo} (#${targetWs.issue_number || 'main'})`);
    logger.plain(`  Path:            ${targetWs.path}`);
    logger.plain(`  Mode:            ${targetWs.mode || (targetWs.isWorktree ? 'worktree' : 'blobless')}`);

    if (gitInstalled && fs.existsSync(targetWs.path)) {
      const gitStatus = await getGitStatusSummary(targetWs.path);
      logger.plain(`  Active Branch:   ${gitStatus.currentBranch}`);
      if (gitStatus.isDirty) {
        logger.warn(`  Git Working Tree: Dirty (${gitStatus.files.length} modified/untracked files)`);
      } else {
        logger.success(`  Git Working Tree: Clean`);
      }
      logger.plain(`  Unpushed Commits:${gitStatus.unpushedCount}`);

      const stack = detectProjectStack(targetWs.path);
      if (stack.type !== 'Generic / Unknown') {
        logger.plain(`  Detected Stack:  ${stack.type} (${stack.packageManager})`);
        if (stack.testCommand) logger.dim(`  Test Command:    ${stack.testCommand}`);
        if (stack.buildCommand) logger.dim(`  Build Command:   ${stack.buildCommand}`);
      }
    }
  }

  logger.divider(72);
  logger.success('Diagnostics complete.');
  return 0;
}
