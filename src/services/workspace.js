/**
 * Workspace management and Git blobless sparse operations.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getWorkspacesDir,
  loadRegistry,
  saveRegistry,
  removeRegistryEntry,
} from '../config/index.js';
import { fetchIssueMetadata } from './github.js';
import {
  sanitizeWorkspaceName,
  isPathInside,
  SecurityError,
  UserError,
} from '../utils/security.js';
import {
  runGitCommand,
  getDirectorySize,
  formatBytes,
} from '../utils/git.js';

/**
 * Create or open a lightweight contribution workspace for a GitHub issue or PR.
 *
 * @param {string} target
 * @param {{ branch?: string }} options
 * @returns {Promise<{
 *   id: string,
 *   url: string,
 *   owner: string,
 *   repo: string,
 *   issue_number: string,
 *   title: string,
 *   branch: string,
 *   path: string,
 *   created_at: string,
 *   status: string,
 *   isNew: boolean
 * }>}
 */
export async function createWorkspace(target, options = {}) {
  const meta = await fetchIssueMetadata(target);
  const owner = meta.owner;
  const repo = meta.repo;
  const issueNum = meta.issue_number || 'main';

  const wsId = sanitizeWorkspaceName(`${owner}__${repo}__issue_${issueNum}`);
  const wsPath = path.join(getWorkspacesDir(), wsId);

  const targetBranch = options.branch || `contrib/issue-${issueNum}`;
  let isNew = false;

  if (!fs.existsSync(wsPath)) {
    isNew = true;
    fs.mkdirSync(wsPath, { recursive: true });

    try {
      // Blobless clone: downloads commits and trees but fetches file blobs on-demand
      await runGitCommand(['clone', '--filter=blob:none', meta.clone_url, wsPath]);
      // Create and checkout contribution branch
      await runGitCommand(['checkout', '-b', targetBranch], { cwd: wsPath });
    } catch (err) {
      // Clean up incomplete directory on failure
      try {
        fs.rmSync(wsPath, { recursive: true, force: true });
      } catch {
        // ignore
      }
      throw err;
    }
  } else {
    // Workspace exists: reuse existing clone
    try {
      await runGitCommand(['checkout', targetBranch], { cwd: wsPath });
    } catch {
      try {
        await runGitCommand(['checkout', '-b', targetBranch], { cwd: wsPath });
      } catch {
        // If already on branch, proceed
      }
    }
  }

  const record = {
    id: wsId,
    url: meta.url,
    owner,
    repo,
    issue_number: issueNum,
    title: meta.title || '',
    branch: targetBranch,
    path: wsPath,
    created_at: new Date().toISOString(),
    status: 'active',
  };

  const registry = loadRegistry();
  registry[wsId] = record;
  saveRegistry(registry);

  return { ...record, isNew };
}

/**
 * Return all tracked workspaces with disk usage info.
 * @returns {Array<Record<string, any>>}
 */
export function listWorkspaces() {
  const registry = loadRegistry();
  const list = Object.values(registry);

  return list.map((ws) => {
    const exists = fs.existsSync(ws.path);
    const sizeBytes = exists ? getDirectorySize(ws.path) : 0;
    return {
      ...ws,
      existsOnDisk: exists,
      sizeBytes,
      formattedSize: formatBytes(sizeBytes),
    };
  });
}

/**
 * Get a specific workspace by ID, URL, or owner/repo.
 * @param {string} idOrTarget
 * @returns {Record<string, any> | null}
 */
export function getWorkspace(idOrTarget) {
  const registry = loadRegistry();
  if (registry[idOrTarget]) {
    return registry[idOrTarget];
  }

  const values = Object.values(registry);
  const found = values.find(
    (w) =>
      w.id === idOrTarget ||
      w.url === idOrTarget ||
      `${w.owner}/${w.repo}` === idOrTarget ||
      `${w.owner}/${w.repo}#${w.issue_number}` === idOrTarget
  );
  return found || null;
}

/**
 * Safely delete a contribution workspace and remove it from the registry.
 * @param {string} idOrTarget
 * @returns {Promise<{ id: string, path: string, deleted: boolean }>}
 */
export async function deleteWorkspace(idOrTarget) {
  const ws = getWorkspace(idOrTarget);
  if (!ws) {
    throw new UserError(`Workspace not found for: '${idOrTarget}'. Run 'contrib status' to see active workspaces.`);
  }

  const workspacesDir = getWorkspacesDir();
  const wsPath = ws.path;

  // Strict safety check: Never delete any directory outside the workspaces root
  if (!isPathInside(workspacesDir, wsPath)) {
    throw new SecurityError(`Security check failed: Path '${wsPath}' is not inside workspaces directory '${workspacesDir}'.`);
  }

  if (fs.existsSync(wsPath)) {
    await fs.promises.rm(wsPath, { recursive: true, force: true });
  }

  removeRegistryEntry(ws.id);

  return {
    id: ws.id,
    path: wsPath,
    deleted: true,
  };
}

/**
 * Analyze an issue description and extract potential candidate files/modules.
 * @param {string} target
 * @returns {Promise<{ metadata: Record<string, any>, suggested_focus_areas: string[] }>}
 */
export async function analyzeIssue(target) {
  const meta = await fetchIssueMetadata(target);
  const textCorpus = `${meta.title || ''} ${meta.body || ''}`.toLowerCase();

  const suggestedPaths = [];
  const tokens = textCorpus.split(/\s+/);

  for (const token of tokens) {
    if (
      token.includes('/') ||
      /\.(?:py|js|jsx|ts|tsx|go|rs|md|json|yml|yaml|c|cpp|h|java|rb|php|html|css)$/.test(token)
    ) {
      const cleanToken = token.replace(/[`'",():[\]{}*]/g, '');
      if (
        cleanToken &&
        cleanToken.length > 2 &&
        !cleanToken.startsWith('http') &&
        !suggestedPaths.includes(cleanToken)
      ) {
        suggestedPaths.push(cleanToken);
      }
    }
  }

  return {
    metadata: meta,
    suggested_focus_areas: suggestedPaths.slice(0, 10),
  };
}
