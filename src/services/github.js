/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * GitHub API integration and issue resolution.
 */

import fs from 'node:fs';
import path from 'node:path';
import { validateGitHubUrl, GitHubApiError } from '../utils/security.js';
import { getGitHubToken } from '../utils/env.js';
import { getApiCacheDir } from '../config/index.js';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
);
const USER_AGENT = `gsoc-contrib-cli/${pkg.version}`;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch issue or pull request details via GitHub REST API.
 * Falls back gracefully to cache or defaults if rate-limited or offline.
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
 *   author?: string,
 *   clone_url: string
 * }>}
 */
export async function fetchIssueMetadata(urlOrTarget, options = {}) {
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
    author: '',
    clone_url: `https://github.com/${owner}/${repo}.git`,
    offline: Boolean(options.offline),
  };

  if (!issueNum) {
    return metadata;
  }

  const cacheFile = path.join(
    getApiCacheDir(),
    `${owner.toLowerCase()}__${repo.toLowerCase()}__issue_${issueNum}.json`
  );

  // Check local cache
  if (fs.existsSync(cacheFile)) {
    try {
      const cachedRaw = fs.readFileSync(cacheFile, 'utf-8');
      const cached = JSON.parse(cachedRaw);
      const isFresh = cached.cached_at && Date.now() - cached.cached_at < CACHE_TTL_MS;
      if ((isFresh || options.offline) && cached.data) {
        return { ...metadata, ...cached.data, offline: Boolean(options.offline) };
      }
    } catch {
      // cache corrupted, continue
    }
  }

  // If explicit offline requested and not in cache, return fallback offline metadata without network calls
  if (options.offline) {
    metadata.title = `[Offline] ${owner}/${repo} #${issueNum}`;
    metadata.body = '_Workspace initialized in offline mode without network sync._';
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
      metadata.author = payload.user?.login || '';
      if (Array.isArray(payload.labels)) {
        metadata.labels = payload.labels
          .map((lbl) => (typeof lbl === 'string' ? lbl : lbl.name || ''))
          .filter(Boolean);
      }

      // Save to cache
      try {
        fs.writeFileSync(
          cacheFile,
          JSON.stringify({ cached_at: Date.now(), data: metadata }, null, 2),
          'utf-8'
        );
      } catch {
        // ignore cache write error
      }
    }
  } catch {
    // Graceful fallback: load stale cache if available
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        if (cached.data) return { ...metadata, ...cached.data };
      } catch {
        // ignore
      }
    }
  }

  return metadata;
}

/**
 * Check if the user has a fork of the target repo.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ hasFork: boolean, forkUrl: string | null, forkOwner: string | null }>}
 */
export async function getUserFork(owner, repo) {
  const token = await getGitHubToken();
  if (!token) {
    return { hasFork: false, forkUrl: null, forkOwner: null };
  }

  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${token}`,
  };

  try {
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) return { hasFork: false, forkUrl: null, forkOwner: null };
    const userData = await userRes.json();
    const username = userData.login;

    if (username.toLowerCase() === owner.toLowerCase()) {
      return { hasFork: false, forkUrl: null, forkOwner: null };
    }

    const forkRes = await fetch(`https://api.github.com/repos/${username}/${repo}`, { headers });
    if (forkRes.ok) {
      const forkData = await forkRes.json();
      if (
        forkData.fork &&
        forkData.parent &&
        forkData.parent.full_name.toLowerCase() === `${owner}/${repo}`.toLowerCase()
      ) {
        return {
          hasFork: true,
          exists: true,
          forkUrl: forkData.clone_url || `https://github.com/${username}/${repo}.git`,
          forkOwner: username,
        };
      }
    }
  } catch {
    // ignore
  }

  return { hasFork: false, exists: false, forkUrl: null, forkOwner: null };
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

/**
 * Create a fork of the target repository for the authenticated user.
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<{ success: boolean, forkUrl: string, forkOwner: string }>}
 */
export async function createFork(owner, repo) {
  const token = await getGitHubToken();
  if (!token) {
    throw new GitHubApiError(
      'GitHub authentication is required to create a fork. Set GITHUB_TOKEN or login with `gh auth login`.'
    );
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/forks`;
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.github.v3+json',
    Authorization: `token ${token}`,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new GitHubApiError(`Failed to create fork: HTTP ${response.status}`, response.status);
    }

    const data = await response.json();
    return {
      success: true,
      forkUrl: data.clone_url || `https://github.com/${data.owner?.login}/${repo}.git`,
      forkOwner: data.owner?.login || '',
    };
  } catch (err) {
    if (err instanceof GitHubApiError) throw err;
    throw new GitHubApiError(`Failed to create fork: ${err.message}`);
  }
}

/**
 * Get repository default branch name (e.g. main or master).
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<string>}
 */
export async function getRepoDefaultBranch(owner, repo) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.github.v3+json',
  };

  const token = await getGitHubToken();
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const response = await fetch(apiUrl, { headers });
    if (response.ok) {
      const data = await response.json();
      return data.default_branch || 'main';
    }
  } catch {
    // fallback
  }

  return 'main';
}

