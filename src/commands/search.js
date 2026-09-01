/**
 * Handler for 'search' command.
 */

import { logger } from '../utils/logger.js';
import { searchIssues } from '../services/github.js';

/**
 * Search GitHub for contribution issues.
 * @param {string | undefined} query
 * @param {{ repo?: string, label?: string, limit?: string }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleSearch(query, options = {}) {
  const q = query || '';
  const limit = options.limit ? parseInt(options.limit, 10) : 10;

  logger.info(`Searching GitHub for contribution opportunities...`);
  if (options.repo) logger.dim(`  Repository: ${options.repo}`);
  if (options.label) logger.dim(`  Label:      ${options.label}`);
  if (q) logger.dim(`  Keywords:   ${q}`);

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

    logger.success(`Found ${issues.length} candidate issues:`);
    logger.divider(72);

    for (const issue of issues) {
      logger.plain(`[#${issue.number}] ${issue.title}`);
      logger.dim(`  Repo:   ${issue.repo}`);
      if (issue.labels && issue.labels.length > 0) {
        logger.dim(`  Labels: ${issue.labels.join(', ')}`);
      }
      logger.dim(`  URL:    ${issue.html_url}`);
      logger.step(`  Start:`, `contrib start ${issue.html_url}`);
      logger.divider(72);
    }

    return 0;
  } catch (err) {
    logger.error(err.message);
    return 1;
  }
}
