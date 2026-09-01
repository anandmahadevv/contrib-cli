/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * GitHub API integration and issue resolution.
 */

import { validateGitHubUrl, GitHubApiError } from '../utils/security.js';
import { getGitHubToken } from '../utils/env.js';

const USER_AGENT = 'gsoc-contrib-cli/0.1.1';

/**
 * Fetch issue or pull request details via GitHub REST API.
 * Falls back gracefully if rate-limited or offline.
 *
 * @param {string} urlOrTarget
 * @returns {Promise<{
 *   owner: string,
 *   repo: string,
 *   issue_number: string | null,
 *   url: string,
 *   title: string,
 *   body: string,
 *   labels: string[],
 *   state: string,
 *   clone_url: string
 * }>}
 */
export async function fetchIssueMetadata(urlOrTarget) {
  const parsed = validateGitHubUrl(urlOrTarget);
  const owner = parsed.owner;
  const repo = parsed.repo;
  const issueNum = parsed.issue || parsed.pr;

  const metadata = {
    owner,
    repo,
    issue_number: issueNum,
    url: parsed.url,
    title: `${owner}/${repo}` + (issueNum ? ` #${issueNum}` : ''),
    body: '',
    labels: [],
    state: 'open',
    clone_url: `https://github.com/${owner}/${repo}.git`,
  };

  if (!issueNum) {
    return metadata;
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNum}`;
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.github.v3+json',
  };

  const token = await getGitHubToken();
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const payload = await response.json();
      metadata.title = payload.title || metadata.title;
      metadata.body = payload.body || '';
      metadata.state = payload.state || 'open';
      if (Array.isArray(payload.labels)) {
        metadata.labels = payload.labels.map((lbl) =>
          typeof lbl === 'string' ? lbl : lbl.name || ''
        ).filter(Boolean);
      }
    }
  } catch {
    // Graceful fallback on network or API errors
  }

  return metadata;
}

/**
 * Search GitHub issues for contribution opportunities.
 * @param {string} query
 * @param {{ repo?: string, label?: string, state?: string, limit?: number }} options
 * @returns {Promise<Array<{ id: number, number: number, title: string, html_url: string, labels: string[], repo: string, state: string }>>}
 */
export async function searchIssues(query, options = {}) {
  const { repo, label, state = 'open', limit = 10 } = options;

  let q = query ? `${query} ` : '';
  q += `state:${state} is:issue `;
  if (repo) {
    q += `repo:${repo} `;
  }
  if (label) {
    q += `label:"${label}" `;
  }

  const searchUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(
    q.trim()
  )}&per_page=${Math.min(limit, 30)}`;

  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.github.v3+json',
  };

  const token = await getGitHubToken();
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(searchUrl, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      if (response.status === 403) {
        throw new GitHubApiError(
          'GitHub API rate limit exceeded. Set GITHUB_TOKEN environment variable to increase limit.',
          403
        );
      }
      throw new GitHubApiError(`GitHub API error: HTTP ${response.status}`, response.status);
    }

    const data = await response.json();
    return (data.items || []).map((item) => {
      const repoUrlParts = (item.repository_url || '').split('/');
      const repoName =
        repoUrlParts.length >= 2
          ? `${repoUrlParts[repoUrlParts.length - 2]}/${repoUrlParts[repoUrlParts.length - 1]}`
          : '';

      return {
        id: item.id,
        number: item.number,
        title: item.title,
        html_url: item.html_url,
        labels: (item.labels || []).map((l) => (typeof l === 'string' ? l : l.name || '')),
        repo: repoName,
        state: item.state,
      };
    });
  } catch (err) {
    if (err instanceof GitHubApiError) throw err;
    throw new GitHubApiError(`Failed to search GitHub issues: ${err.message}`);
  }
}

/**
 * Check authentication and rate limit status.
 * @returns {Promise<{ authenticated: boolean, tokenSource: string | null, remaining: number, limit: number, resetDate: Date | null }>}
 */
export async function checkGitHubAuth() {
  const token = await getGitHubToken();
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.github.v3+json',
  };

  let tokenSource = null;
  if (process.env.GITHUB_TOKEN) {
    tokenSource = 'GITHUB_TOKEN env var';
    headers.Authorization = `token ${process.env.GITHUB_TOKEN.trim()}`;
  } else if (process.env.GH_TOKEN) {
    tokenSource = 'GH_TOKEN env var';
    headers.Authorization = `token ${process.env.GH_TOKEN.trim()}`;
  } else if (token) {
    tokenSource = 'GitHub CLI (gh auth)';
    headers.Authorization = `token ${token}`;
  }

  try {
    const res = await fetch('https://api.github.com/rate_limit', { headers });
    if (res.ok) {
      const data = await res.json();
      const core = data.resources?.core || {};
      return {
        authenticated: Boolean(token),
        tokenSource,
        remaining: core.remaining ?? 60,
        limit: core.limit ?? 60,
        resetDate: core.reset ? new Date(core.reset * 1000) : null,
      };
    }
  } catch {
    // Offline or connection error
  }

  return {
    authenticated: Boolean(token),
    tokenSource,
    remaining: 0,
    limit: 60,
    resetDate: null,
  };
}
