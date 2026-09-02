/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'browse' command (interactive issue discovery and workspace creation).
 */

import readline from 'node:readline/promises';
import { logger } from '../utils/logger.js';
import { searchIssues } from '../services/github.js';
import { handleStart } from './start.js';

/**
 * Interactively browse and launch contribution workspaces.
 * @param {string | undefined} query
 * @param {{ repo?: string, label?: string, limit?: string }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleBrowse(query, options = {}) {
  const q = query || '';
  const limit = options.limit ? parseInt(options.limit, 10) : 10;

  logger.info('Searching GitHub issues for interactive browsing...');
  if (options.repo) logger.dim(`  Repository: ${options.repo}`);
  if (options.label) logger.dim(`  Label:      ${options.label}`);

  try {
    const issues = await searchIssues(q, {
      repo: options.repo,
      label: options.label,
      limit,
    });

    if (issues.length === 0) {
      logger.plain('No matching open issues found.');
      return 0;
    }

    logger.success(`Found ${issues.length} candidate issues:\n`);

    issues.forEach((issue, idx) => {
      logger.plain(`  [${idx + 1}] #${issue.number} ${issue.title}`);
      logger.dim(`      Repo: ${issue.repo} | Labels: ${issue.labels.join(', ') || 'none'}`);
    });

    logger.plain('');

    if (!process.stdin.isTTY) {
      logger.plain("To start work on an issue, run: npx gsoc-contrib start <url>");
      return 0;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      const answer = await rl.question(`Select an issue number to start workspace [1-${issues.length}] (or press Enter to cancel): `);
      const choice = parseInt(answer.trim(), 10);
      if (!choice || choice < 1 || choice > issues.length) {
        logger.plain('Browse cancelled.');
        return 0;
      }

      const selected = issues[choice - 1];
      logger.plain('');
      logger.info(`Launching workspace for: ${selected.html_url}`);
      return await handleStart(selected.html_url);
    } finally {
      rl.close();
    }
  } catch (err) {
    logger.error(err.message);
    return 1;
  }
}
