/**
 * Security, sanitization, and input validation utilities for contrib.
 */

import path from 'node:path';

export class SecurityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class UserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserError';
  }
}

export class GitError extends Error {
  constructor(message, stderr = '') {
    super(message);
    this.name = 'GitError';
    this.stderr = stderr;
  }
}

export class GitHubApiError extends Error {
  constructor(message, statusCode = null) {
    super(message);
    this.name = 'GitHubApiError';
    this.statusCode = statusCode;
  }
}

const GITHUB_URL_PATTERN = /^https:\/\/github\.com\/(?<owner>[a-zA-Z0-9_\-\.]+)\/(?<repo>[a-zA-Z0-9_\-\.]+?)(?:\.git)?(?:\/(?:issues|pull)\/(?<issue>\d+))?\/?$/;

const SHORTHAND_PATTERN = /^(?<owner>[a-zA-Z0-9_\-\.]+)\/(?<repo>[a-zA-Z0-9_\-\.]+?)(?:#(?:(?<issue1>\d+))|\/(?:issues|pull)\/(?<issue2>\d+))?$/;

/**
 * Validate and parse a GitHub URL or shorthand.
 * Supports:
 * - https://github.com/owner/repo/issues/123
 * - https://github.com/owner/repo/pull/123
 * - https://github.com/owner/repo
 * - owner/repo#123
 * - owner/repo
 *
 * @param {string} input
 * @returns {{ owner: string, repo: string, issue: string | null, pr: string | null, isShorthand: boolean, url: string }}
 */
export function validateGitHubUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new SecurityError('A valid GitHub URL or owner/repo identifier must be provided.');
  }

  const trimmed = input.trim();

  // Check if it's a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let parsedUrl;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      throw new SecurityError(`Invalid URL format: '${trimmed}'.`);
    }

    if (parsedUrl.protocol !== 'https:') {
      throw new SecurityError(
        `Invalid protocol: '${parsedUrl.protocol}'. Only secure 'https://' GitHub URLs are supported.`
      );
    }

    if (parsedUrl.hostname !== 'github.com' && parsedUrl.hostname !== 'www.github.com') {
      throw new SecurityError(
        `Invalid repository host: '${parsedUrl.hostname}'. Only 'https://github.com' is supported.`
      );
    }

    const match = GITHUB_URL_PATTERN.exec(trimmed);
    if (!match || !match.groups) {
      throw new SecurityError(
        `Invalid GitHub URL format: '${trimmed}'. Expected format: https://github.com/owner/repo/issues/123`
      );
    }

    const { owner, repo, issue } = match.groups;
    const cleanRepo = repo.endsWith('.git') ? repo.slice(0, -4) : repo;

    const isPr = trimmed.includes('/pull/');

    return {
      owner,
      repo: cleanRepo,
      issue: isPr ? null : (issue || null),
      pr: isPr ? (issue || null) : null,
      isShorthand: false,
      url: trimmed,
    };
  }

  // Check shorthand format (e.g. owner/repo or owner/repo#123)
  const shorthandMatch = SHORTHAND_PATTERN.exec(trimmed);
  if (shorthandMatch && shorthandMatch.groups) {
    const { owner, repo, issue1, issue2 } = shorthandMatch.groups;
    const cleanRepo = repo.endsWith('.git') ? repo.slice(0, -4) : repo;
    const issueNum = issue1 || issue2 || null;

    let fullUrl = `https://github.com/${owner}/${cleanRepo}`;
    if (issueNum) {
      fullUrl += `/issues/${issueNum}`;
    }

    return {
      owner,
      repo: cleanRepo,
      issue: issueNum,
      pr: null,
      isShorthand: true,
      url: fullUrl,
    };
  }

  throw new SecurityError(
    `Invalid GitHub target: '${trimmed}'. Expected format: https://github.com/owner/repo/issues/123 or owner/repo#123`
  );
}

/**
 * Ensure a directory or workspace name cannot escape its root.
 * @param {string} name
 * @returns {string}
 */
export function sanitizeWorkspaceName(name) {
  if (!name || typeof name !== 'string') {
    throw new SecurityError('Workspace name cannot be empty.');
  }
  const sanitized = name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  if (sanitized === '' || sanitized === '.' || sanitized === '..') {
    throw new SecurityError(`Unsafe workspace name: '${name}'`);
  }
  return sanitized;
}

/**
 * Verify that a target path is strictly contained within a parent directory.
 * Prevents directory traversal attacks.
 * @param {string} parentDir
 * @param {string} targetPath
 * @returns {boolean}
 */
export function isPathInside(parentDir, targetPath) {
  const rel = path.relative(path.resolve(parentDir), path.resolve(targetPath));
  return Boolean(rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}
