/**
 * Handler for 'init' command.
 */

import { logger } from '../utils/logger.js';
import { checkGitInstalled } from '../utils/git.js';
import { checkGitHubAuth } from '../services/github.js';
import { getContribHome, getWorkspacesDir, getRegistryFile } from '../config/index.js';

/**
 * Initialize and verify local contribution environment.
 * @returns {Promise<number>} Exit code
 */
export async function handleInit() {
  logger.info('Initializing and verifying contribution environment...');
  logger.divider(72);

  // 1. Node.js environment
  logger.success(`Node.js Runtime:     v${process.versions.node}`);

  // 2. Git status
  try {
    const gitVer = await checkGitInstalled();
    logger.success(`Git Executable:      ${gitVer}`);
  } catch (err) {
    logger.error(`Git Not Available:   ${err.message}`);
    return 1;
  }

  // 3. Storage configuration
  const homeDir = getContribHome();
  const wsDir = getWorkspacesDir();
  const regFile = getRegistryFile();

  logger.success(`Config Directory:    ${homeDir}`);
  logger.success(`Workspaces Root:     ${wsDir}`);
  logger.success(`Registry File:       ${regFile}`);

  // 4. GitHub Auth and Rate Limits
  const auth = await checkGitHubAuth();
  if (auth.authenticated) {
    logger.success(`GitHub Authentication: Configured (${auth.tokenSource})`);
    logger.success(`API Rate Limit:      ${auth.remaining} / ${auth.limit} requests remaining`);
  } else {
    logger.warn(`GitHub Authentication: Not configured (Unauthenticated)`);
    logger.dim(`  Tip: Set GITHUB_TOKEN or GH_TOKEN env var, or run 'gh auth login' to increase rate limits.`);
    logger.plain(`  Rate Limit:          ${auth.remaining} / ${auth.limit} requests remaining`);
  }

  logger.divider(72);
  logger.success('Environment is ready! You can start contributing with:');
  logger.step('  npx gsoc-contrib start', '<github-issue-url>');
  logger.step('  npx gsoc-contrib search', '"good first issue" --repo <owner/repo>');

  return 0;
}
