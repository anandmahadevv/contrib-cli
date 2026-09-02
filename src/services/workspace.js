/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Workspace management, Git worktree/blobless/sparse operations, and safety controls.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  getWorkspacesDir,
  getGitCacheDir,
  loadRegistry,
  saveRegistry,
  removeRegistryEntry,
} from '../config/index.js';
import { fetchIssueMetadata, getUserFork } from './github.js';
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
  isGitDirty,
  getGitStatusSummary,
  setupSparseCheckout,
  detectProjectStack,
} from '../utils/git.js';

/**
 * Write .contrib/ISSUE.md and .contrib/context.json inside the workspace.
 * @param {string} wsPath
 * @param {Record<string, any>} meta
 * @param {string} targetBranch
 * @param {string[]} focusAreas
 * @param {Record<string, any>} stack
 */
export function writeWorkspaceContextFiles(wsPath, meta, targetBranch, focusAreas = [], stack = {}) {
  const contribDir = path.join(wsPath, '.contrib');
  if (!fs.existsSync(contribDir)) {
    fs.mkdirSync(contribDir, { recursive: true });
  }

  const issueMdContent = [
    `# Issue: ${meta.title || `${meta.owner}/${meta.repo} #${meta.issue_number}`}`,
    '',
    `- **Repository:** [${meta.owner}/${meta.repo}](https://github.com/${meta.owner}/${meta.repo})`,
    `- **Issue URL:** [${meta.url}](${meta.url})`,
    `- **Issue Number:** #${meta.issue_number || 'N/A'}`,
    `- **Author:** ${meta.author ? `@${meta.author}` : 'N/A'}`,
    `- **State:** ${meta.state || 'open'}`,
    `- **Labels:** ${meta.labels && meta.labels.length > 0 ? meta.labels.join(', ') : 'none'}`,
    `- **Working Branch:** \`${targetBranch}\``,
    stack.type ? `- **Detected Stack:** ${stack.type} (${stack.packageManager})` : '',
    '',
    '---',
    '',
    '## Issue Description',
    '',
    meta.body ? meta.body : '_No description provided._',
    '',
    '---',
    '',
    '## Candidate Files & Focus Areas',
    '',
    focusAreas.length > 0
      ? focusAreas.map((f) => `- \`${f}\``).join('\n')
      : '_No specific candidate files detected in issue body._',
    '',
    '---',
    '',
    '## Quick Contribution Commands',
    '',
    `- **Check Git Status:** \`git status\``,
    stack.testCommand ? `- **Run Tests:** \`${stack.testCommand}\`` : '',
    stack.buildCommand ? `- **Run Build:** \`${stack.buildCommand}\`` : '',
    `- **Inspect Workspace:** \`npx gsoc-contrib doctor\``,
    `- **Create Pull Request:** \`npx gsoc-contrib submit\``,
    '',
  ].filter(Boolean).join('\n');

  fs.writeFileSync(path.join(contribDir, 'ISSUE.md'), issueMdContent, 'utf-8');

  const contextJson = {
    workspace_id: sanitizeWorkspaceName(`${meta.owner}__${meta.repo}__issue_${meta.issue_number || 'main'}`),
    repository: `${meta.owner}/${meta.repo}`,
    issue_number: meta.issue_number,
    issue_url: meta.url,
    title: meta.title,
    author: meta.author || null,
    labels: meta.labels || [],
    branch: targetBranch,
    focus_areas: focusAreas,
    stack,
    created_at: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(contribDir, 'context.json'), JSON.stringify(contextJson, null, 2), 'utf-8');

  // Add .contrib to .git/info/exclude if .git exists so git status stays clean
  try {
    const gitInfoDir = path.join(wsPath, '.git', 'info');
    if (fs.existsSync(gitInfoDir)) {
      const excludeFile = path.join(gitInfoDir, 'exclude');
      let excludeContent = fs.existsSync(excludeFile) ? fs.readFileSync(excludeFile, 'utf-8') : '';
      if (!excludeContent.includes('.contrib')) {
        excludeContent += '\n.contrib\n.contrib/\n';
        fs.writeFileSync(excludeFile, excludeContent, 'utf-8');
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Create or open a lightweight contribution workspace for a GitHub issue or PR.
 *
 * @param {string} target
 * @param {{
 *   branch?: string,
 *   sparse?: boolean | string | string[],
 *   mode?: 'blobless' | 'treeless' | 'shallow' | 'worktree',
 *   worktree?: boolean,
 *   fork?: boolean
 * }} options
 * @returns {Promise<{
 *   id: string,
 *   url: string,
 *   owner: string,
 *   repo: string,
 *   issue_number: string,
 *   title: string,
 *   branch: string,
 *   path: string,
 *   mode: string,
 *   isWorktree: boolean,
 *   stack: Record<string, any>,
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

  const analysis = await analyzeIssue(target);
  const focusAreas = analysis.suggested_focus_areas || [];

  const wsId = sanitizeWorkspaceName(`${owner}__${repo}__issue_${issueNum}`);
  const wsPath = path.join(getWorkspacesDir(), wsId);

  const targetBranch = options.branch || `contrib/issue-${issueNum}`;
  const useWorktree = Boolean(options.worktree || options.mode === 'worktree');
  const cloneMode = useWorktree ? 'worktree' : (options.mode || 'blobless');

  let isNew = false;

  if (!fs.existsSync(wsPath)) {
    isNew = true;

    try {
      if (useWorktree) {
        // Shared Bare Repo Cache & Git Worktree
        const bareCacheDir = path.join(getGitCacheDir(), `${owner.toLowerCase()}__${repo.toLowerCase()}.git`);
        if (!fs.existsSync(bareCacheDir)) {
          fs.mkdirSync(path.dirname(bareCacheDir), { recursive: true });
          await runGitCommand(['clone', '--bare', '--filter=blob:none', meta.clone_url, bareCacheDir]);
        } else {
          try {
            await runGitCommand(['fetch', 'origin'], { cwd: bareCacheDir, timeout: 15000 });
          } catch {
            // offline or network failure, use cached bare repo
          }
        }

        // Add git worktree
        fs.mkdirSync(path.dirname(wsPath), { recursive: true });
        await runGitCommand(
          ['worktree', 'add', '-b', targetBranch, wsPath],
          { cwd: bareCacheDir }
        );
      } else {
        // Standard Blobless / Treeless / Shallow clone
        fs.mkdirSync(wsPath, { recursive: true });

        let cloneArgs = ['clone', '--filter=blob:none', meta.clone_url, wsPath];
        if (cloneMode === 'treeless') {
          cloneArgs = ['clone', '--filter=tree:0', meta.clone_url, wsPath];
        } else if (cloneMode === 'shallow') {
          cloneArgs = ['clone', '--depth', '1', meta.clone_url, wsPath];
        }

        await runGitCommand(cloneArgs);
        await runGitCommand(['checkout', '-b', targetBranch], { cwd: wsPath });
      }

      // Configure sparse checkout if requested
      if (options.sparse) {
        const sparsePaths =
          typeof options.sparse === 'boolean'
            ? focusAreas
            : options.sparse;
        if (sparsePaths && (Array.isArray(sparsePaths) ? sparsePaths.length > 0 : String(sparsePaths).length > 0)) {
          await setupSparseCheckout(wsPath, sparsePaths);
        }
      }

      // Configure fork remotes if requested
      if (options.fork) {
        try {
          const forkInfo = await getUserFork(owner, repo);
          if (forkInfo.hasFork && forkInfo.forkUrl) {
            await runGitCommand(['remote', 'rename', 'origin', 'upstream'], { cwd: wsPath });
            await runGitCommand(['remote', 'add', 'origin', forkInfo.forkUrl], { cwd: wsPath });
          }
        } catch {
          // ignore fork auto-setup error
        }
      }
    } catch (err) {
      // Clean up incomplete directory on failure
      try {
        if (fs.existsSync(wsPath)) {
          fs.rmSync(wsPath, { recursive: true, force: true });
        }
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

  // Detect project stack & write context files
  const stack = detectProjectStack(wsPath);
  writeWorkspaceContextFiles(wsPath, meta, targetBranch, focusAreas, stack);

  const record = {
    id: wsId,
    url: meta.url,
    owner,
    repo,
    issue_number: issueNum,
    title: meta.title || '',
    branch: targetBranch,
    path: wsPath,
    mode: cloneMode,
    isWorktree: useWorktree,
    stack,
    created_at: new Date().toISOString(),
    status: 'active',
  };

  const registry = loadRegistry();
  registry[wsId] = record;
  saveRegistry(registry);

  return { ...record, isNew, stack };
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
 * Protects uncommitted work unless force=true.
 *
 * @param {string} idOrTarget
 * @param {{ force?: boolean }} options
 * @returns {Promise<{ id: string, path: string, deleted: boolean }>}
 */
export async function deleteWorkspace(idOrTarget, options = {}) {
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

  // Safety check: verify uncommitted/dirty changes
  if (!options.force && fs.existsSync(wsPath)) {
    const dirty = await isGitDirty(wsPath);
    if (dirty) {
      const status = await getGitStatusSummary(wsPath);
      throw new UserError(
        `Workspace '${ws.id}' contains uncommitted or untracked changes (${status.files.length} file(s)). ` +
        `Pass --force (-f) to delete anyway.`
      );
    }
  }

  if (fs.existsSync(wsPath)) {
    // If worktree, remove worktree registration first
    if (ws.isWorktree) {
      const barePath = path.join(getGitCacheDir(), `${ws.owner.toLowerCase()}__${ws.repo.toLowerCase()}.git`);
      if (fs.existsSync(barePath)) {
        try {
          await runGitCommand(['worktree', 'remove', '--force', wsPath], { cwd: barePath });
        } catch {
          // ignore if unregistration fails
        }
      }
    }
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

