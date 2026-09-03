/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'open' command (launch workspaces in editors or open issues in browser).
 */

import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger.js';
import { listWorkspaces, getWorkspace } from '../services/workspace.js';
import {
  openInEditor,
  openInBrowser,
  detectDefaultEditor,
  resolveRequestedEditor,
} from '../utils/opener.js';

/**
 * Open a workspace in an editor or open its GitHub issue in browser.
 * @param {string | undefined} idOrTarget
 * @param {{
 *   web?: boolean,
 *   code?: boolean,
 *   cursor?: boolean,
 *   editor?: string,
 *   issue?: boolean,
 *   print?: boolean
 * }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleOpen(idOrTarget, options = {}) {
  let ws = null;

  if (idOrTarget) {
    ws = getWorkspace(idOrTarget);
    if (!ws) {
      if (options.print) {
        return 1;
      }
      logger.error(`Workspace not found for: '${idOrTarget}'.`);
      const allWs = listWorkspaces();
      if (allWs.length > 0) {
        logger.plain('\nAvailable active workspaces:');
        for (const w of allWs) {
          logger.plain(`  • ${w.id} (${w.owner}/${w.repo} #${w.issue_number || 'main'})`);
        }
      } else {
        logger.plain('\nNo active workspaces found. Create one first with:');
        logger.step('  start:', 'npx gsoc-contrib start <issue-url>');
      }
      return 1;
    }
  } else {
    // Check if cwd is inside an active workspace
    const cwd = process.cwd();
    const allWs = listWorkspaces();
    ws =
      allWs.find(
        (w) =>
          path.resolve(w.path) === path.resolve(cwd) ||
          cwd.startsWith(path.resolve(w.path))
      ) || null;

    if (!ws) {
      if (allWs.length === 1) {
        // Exactly one workspace: convenient auto-selection
        ws = allWs[0];
      } else if (allWs.length === 0) {
        if (options.print) return 1;
        logger.error('No active contribution workspaces found.');
        logger.plain('Create a workspace first using:');
        logger.step('  start:', 'npx gsoc-contrib start <issue-url>');
        return 1;
      } else {
        if (options.print) return 1;
        logger.warn(
          'Multiple active workspaces detected. Please specify which workspace to open:'
        );
        for (const w of allWs) {
          logger.plain(`  • ${w.id} (branch: ${w.branch})`);
        }
        logger.plain('\nUsage: npx gsoc-contrib open <workspace-id>');
        return 1;
      }
    }
  }

  // Verify workspace exists on disk
  if (!fs.existsSync(ws.path)) {
    if (options.print) return 1;
    logger.error(`Workspace directory does not exist on disk: ${ws.path}`);
    logger.plain(
      `Run 'npx gsoc-contrib cleanup ${ws.id}' to remove this stale entry.`
    );
    return 1;
  }

  // Option: --print (pure path output for shell scripting, e.g. cd $(contrib open psf/requests#6000 -p))
  if (options.print) {
    process.stdout.write(`${ws.path}\n`);
    return 0;
  }

  // Option: --web (open GitHub issue/PR URL in default browser)
  if (options.web) {
    const targetUrl =
      ws.url ||
      `https://github.com/${ws.owner}/${ws.repo}/issues/${ws.issue_number || ''}`;
    logger.info('Opening GitHub target in default browser...');
    logger.plain(`  URL: ${targetUrl}`);
    try {
      await openInBrowser(targetUrl);
    } catch (err) {
      logger.error(err.message);
      return 1;
    }

    // If user only specified --web, exit here
    const requestedEditor = resolveRequestedEditor(options);
    if (!requestedEditor && !options.editor && !options.issue) {
      return 0;
    }
  }

  // Target path (workspace folder, or .contrib/ISSUE.md if requested)
  let targetPath = ws.path;
  if (options.issue) {
    const issueFile = path.join(ws.path, '.contrib', 'ISSUE.md');
    if (fs.existsSync(issueFile)) {
      targetPath = issueFile;
    }
  }

  // Determine which editor to launch
  const editor = resolveRequestedEditor(options) || detectDefaultEditor();

  if (editor) {
    logger.info(`Opening workspace in ${editor}...`);
    logger.plain(`  Workspace: ${ws.id}`);
    logger.plain(`  Path:      ${targetPath}`);
    logger.plain(`  Branch:    ${ws.branch}`);

    try {
      await openInEditor(targetPath, editor);
      logger.success(`Launched ${editor} successfully.`);
      return 0;
    } catch (err) {
      logger.error(err.message);
      return 1;
    }
  }

  // Fallback when no supported editor is available
  logger.info(`Workspace ready at: ${ws.path}`);
  logger.plain(`  Branch:    ${ws.branch}`);
  logger.plain(
    `  Issue:     ${ws.url || `${ws.owner}/${ws.repo} #${ws.issue_number || ''}`}`
  );
  logger.plain(
    '\nNo supported editor detected in PATH (checked: $VISUAL, $EDITOR, code, cursor).'
  );
  logger.plain('Specify an editor with --editor <name> or navigate manually:');
  logger.step('  cd:', `"${ws.path}"`);

  return 0;
}
