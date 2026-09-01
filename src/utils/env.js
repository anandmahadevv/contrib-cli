/**
 * Environment inspection and authentication helpers.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { UserError } from './security.js';

const execFileAsync = promisify(execFile);

/**
 * Verify current Node.js version satisfies minimum requirements.
 * @param {number} minMajor
 */
export function checkNodeVersion(minMajor = 18) {
  const currentMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (currentMajor < minMajor) {
    throw new UserError(
      `Node.js version v${process.versions.node} is not supported. Please upgrade to Node.js v${minMajor}.0.0 or higher.`
    );
  }
}

/**
 * Resolve GitHub authentication token from environment or GitHub CLI.
 * Never throws; returns null if not configured.
 * @returns {Promise<string | null>}
 */
export async function getGitHubToken() {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim()) {
    return process.env.GITHUB_TOKEN.trim();
  }

  if (process.env.GH_TOKEN && process.env.GH_TOKEN.trim()) {
    return process.env.GH_TOKEN.trim();
  }

  // Fallback to GitHub CLI (gh auth token) if installed
  try {
    const { stdout } = await execFileAsync('gh', ['auth', 'token'], {
      timeout: 3000,
      shell: false,
    });
    const token = stdout.trim();
    if (token) return token;
  } catch {
    // gh not installed or not authenticated
  }

  return null;
}

/**
 * Mask token for safe diagnostic display.
 * @param {string} token
 * @returns {string}
 */
export function maskToken(token) {
  if (!token || token.length < 8) return '****';
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}
