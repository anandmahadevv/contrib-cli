/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Main CLI definition using Commander.
 */

import fs from 'node:fs';
import { Command } from 'commander';
import { logger } from './utils/logger.js';
import { checkNodeVersion } from './utils/env.js';
import { handleStart } from './commands/start.js';
import { handleContribute } from './commands/contribute.js';
import { handleAnalyze } from './commands/analyze.js';
import { handleStatus } from './commands/status.js';
import { handleCleanup } from './commands/cleanup.js';
import { handleInit } from './commands/init.js';
import { handleSearch } from './commands/search.js';
import { handleDoctor } from './commands/doctor.js';
import { handleSubmit } from './commands/submit.js';
import { handlePr } from './commands/pr.js';
import { handleSync } from './commands/sync.js';
import { handleDiff } from './commands/diff.js';
import { handleSetup } from './commands/setup.js';
import { handleStats } from './commands/stats.js';
import { handleBrowse } from './commands/browse.js';
import {
  SecurityError,
  UserError,
  GitError,
  GitHubApiError,
} from './utils/security.js';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
);

/**
 * Build the CLI program instance.
 * @returns {Command}
 */
export function createProgram() {
  const program = new Command();

  program
    .name('contrib')
    .description('Lightweight GitHub contribution workspace manager.')
    .version(`${pkg.name} ${pkg.version}`, '-v, --version', "Show program's version number and exit.")
    .helpOption('-h, --help', 'Display help for command.')
    .showHelpAfterError('(add --help for additional information)')
    .addHelpText(
      'after',
      `
Examples:
  $ npx gsoc-contrib start https://github.com/psf/requests/issues/6000 --worktree --install
  $ npx gsoc-contrib contribute psf/requests#6000 -b fix-header-parsing
  $ npx gsoc-contrib browse --repo psf/requests
  $ npx gsoc-contrib sync
  $ npx gsoc-contrib diff
  $ npx gsoc-contrib stats
  $ npx gsoc-contrib doctor
  $ npx gsoc-contrib submit
  $ npx gsoc-contrib status
  $ npx gsoc-contrib cleanup --all
`
    );

  // Command: start
  program
    .command('start <url>')
    .description('Create or open a lightweight contribution workspace for a GitHub issue or PR.')
    .option('-b, --branch <branch>', 'Custom branch name to create in the workspace')
    .option('-s, --sparse [dirs...]', 'Enable sparse checkout for specific or candidate directories')
    .option('-w, --worktree', 'Use shared bare repo cache & git worktree for sub-second setup')
    .option('-m, --mode <mode>', 'Clone mode: blobless, treeless, shallow, or worktree', 'blobless')
    .option('-i, --install', 'Automatically install project dependencies after creation')
    .option('--fork', 'Automatically configure remote for user fork')
    .action(async (url, options) => {
      process.exitCode = await handleStart(url, options);
    });

  // Command: contribute (smart alias)
  program
    .command('contribute <target>')
    .description('Start contributing to a GitHub issue or repository (supports URL or owner/repo#123).')
    .option('-b, --branch <branch>', 'Custom branch name to create in the workspace')
    .option('-s, --sparse [dirs...]', 'Enable sparse checkout for specific or candidate directories')
    .option('-w, --worktree', 'Use shared bare repo cache & git worktree for sub-second setup')
    .option('-m, --mode <mode>', 'Clone mode: blobless, treeless, shallow, or worktree', 'blobless')
    .option('-i, --install', 'Automatically install project dependencies after creation')
    .option('--fork', 'Automatically configure remote for user fork')
    .action(async (target, options) => {
      process.exitCode = await handleContribute(target, options);
    });

  // Command: browse (interactive issue picker)
  program
    .command('browse [query]')
    .description('Interactively search and select candidate GitHub issues to start workspaces.')
    .option('-r, --repo <repo>', 'Target repository (e.g. psf/requests)')
    .option('-l, --label <label>', 'Filter by label (e.g. "good first issue")')
    .option('-n, --limit <number>', 'Maximum results (default: 10)')
    .action(async (query, options) => {
      process.exitCode = await handleBrowse(query, options);
    });

  // Command: analyze
  program
    .command('analyze <url>')
    .description('Analyze a GitHub issue description for focus areas and candidate files.')
    .action(async (url) => {
      process.exitCode = await handleAnalyze(url);
    });

  // Command: status
  program
    .command('status')
    .description('List all active contribution workspaces.')
    .action(async () => {
      process.exitCode = await handleStatus();
    });

  // Command: sync
  program
    .command('sync [id]')
    .description('Pull upstream changes and rebase your working contribution branch.')
    .action(async (id) => {
      process.exitCode = await handleSync(id);
    });

  // Command: diff
  program
    .command('diff [id]')
    .description('Inspect the git diff of changes made on the issue branch.')
    .option('-m, --markdown', 'Output diff formatted in Markdown')
    .action(async (id, options) => {
      process.exitCode = await handleDiff(id, options);
    });

  // Command: setup
  program
    .command('setup [id]')
    .description('Detect and install dependencies in an active workspace.')
    .action(async (id) => {
      process.exitCode = await handleSetup(id);
    });

  // Command: stats
  program
    .command('stats')
    .description('View contribution activity, commits authored, and metrics across workspaces.')
    .option('-m, --markdown', 'Output report formatted in Markdown (for GSoC reports)')
    .option('-j, --json', 'Output report as JSON')
    .action(async (options) => {
      process.exitCode = await handleStats(options);
    });

  // Command: search
  program
    .command('search [query]')
    .description('Search GitHub for contribution opportunities and issues.')
    .option('-r, --repo <repo>', 'Target repository (e.g. psf/requests)')
    .option('-l, --label <label>', 'Filter by label (e.g. "good first issue")')
    .option('-n, --limit <number>', 'Maximum number of results (default: 10)')
    .action(async (query, options) => {
      process.exitCode = await handleSearch(query, options);
    });

  // Command: doctor / info
  program
    .command('doctor [id]')
    .alias('info')
    .description('Inspect environment health, storage, cache, and workspace status.')
    .action(async (id) => {
      process.exitCode = await handleDoctor(id);
    });

  // Command: submit / pr
  program
    .command('submit [id]')
    .alias('pr')
    .description('Review branch status and prepare PR creation for a workspace.')
    .option('-t, --title <title>', 'Custom Pull Request title')
    .option('--body <body>', 'Custom Pull Request body')
    .action(async (id, options) => {
      process.exitCode = await handleSubmit(id, options);
    });

  // Command: cleanup
  program
    .command('cleanup [id]')
    .description('Safely clean up one or all active contribution workspaces.')
    .option('-a, --all', 'Remove all active workspaces')
    .option('-y, --yes', 'Skip confirmation prompt')
    .option('-f, --force', 'Force remove workspace (even if uncommitted changes exist)')
    .action(async (id, options) => {
      process.exitCode = await handleCleanup(id, options);
    });

  // Command: init
  program
    .command('init')
    .description('Initialize and inspect local contribution environment.')
    .action(async () => {
      process.exitCode = await handleInit();
    });

  return program;
}

/**
 * Execute the CLI application with the given arguments.
 * @param {string[]} argv
 * @returns {Promise<number>}
 */
export async function runCli(argv = process.argv) {
  try {
    checkNodeVersion(18);
    const program = createProgram();

    // If no arguments provided, show help
    if (argv.length <= 2) {
      program.outputHelp();
      return 0;
    }

    await program.parseAsync(argv);
    return typeof process.exitCode === 'number' ? process.exitCode : 0;
  } catch (err) {
    if (
      err instanceof SecurityError ||
      err instanceof UserError ||
      err instanceof GitError ||
      err instanceof GitHubApiError
    ) {
      logger.error(err.message);
      return 1;
    }

    // Commander error (e.g. unknown option / missing required arg)
    if (err.code === 'commander.unknownOption' || err.code === 'commander.missingArgument') {
      return 2;
    }

    // Unexpected error
    logger.error(err.message || String(err));
    return 1;
  }
}
