/**
 * Handler for 'analyze' command.
 */

import { logger } from '../utils/logger.js';
import { analyzeIssue } from '../services/workspace.js';

/**
 * Execute the analyze command on a GitHub issue or PR.
 * @param {string} target
 * @returns {Promise<number>} Exit code
 */
export async function handleAnalyze(target) {
  logger.info(`Analyzing issue: ${target}`);

  const result = await analyzeIssue(target);
  const meta = result.metadata;

  logger.success(`Title:  ${meta.title || 'N/A'}`);
  logger.success(`Status: ${meta.state || 'open'}`);

  if (meta.labels && meta.labels.length > 0) {
    logger.success(`Labels: ${meta.labels.join(', ')}`);
  }

  const suggestions = result.suggested_focus_areas || [];
  if (suggestions.length > 0) {
    logger.plain('');
    logger.success('Detected focus files/areas:');
    for (const s of suggestions) {
      logger.plain(`    - ${s}`);
    }
  } else {
    logger.plain('');
    logger.dim('[-] No specific file references identified in the issue body.');
  }

  return 0;
}
