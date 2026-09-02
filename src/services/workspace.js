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
  installDependencies,
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

  // AI Prompt generation for coding agents
  const aiPromptContent = [
    `# AI Agent Instructions for Issue #${meta.issue_number || 'N/A'}`,
    '',
    `## Context`,
    `- **Repository:** ${meta.owner}/${meta.repo}`,
    `- **Issue Title:** ${meta.title || 'N/A'}`,
    `- **Issue URL:** ${meta.url}`,
    `- **Working Branch:** ${targetBranch}`,
    `- **Tech Stack:** ${stack.type || 'Generic'} (${stack.packageManager || 'unknown'})`,
    '',
    `## Task`,
    `You are tasked with resolving the following GitHub issue:`,
    '',
    `### Issue Description`,
    meta.body ? meta.body : '_No description provided._',
    '',
    `## Candidate Files & Focus Areas`,
    focusAreas.length > 0
      ? focusAreas.map((f) => `- \`${f}\``).join('\n')
      : '- Search for symbols or error strings referenced in the issue.',
    '',
    `## Verification Steps`,
    stack.testCommand ? `- Run test suite: \`${stack.testCommand}\`` : '- Run repository tests',
    `- Check git status: \`git status\``,
    '',
    `## Guidelines`,
    `1. Maintain documentation and code style conventions.`,
    `2. Ensure all existing tests pass before and after making changes.`,
    `3. Write minimal, surgical code changes targeting this issue.`,
    '',
  ].join('\n');

  fs.writeFileSync(path.join(contribDir, 'AI_PROMPT.md'), aiPromptContent, 'utf-8');

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
 *   fork?: boolean,
 *   install?: boolean
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
 *   installed?: boolean,
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
      // Apply Git performance optimizations to workspace
      try {
        await runGitCommand(['config', 'fetch.parallel', '0'], { cwd: wsPath });
        await runGitCommand(['config', 'index.threads', 'true'], { cwd: wsPath });
        await runGitCommand(['config', 'pack.threads', '0'], { cwd: wsPath });
      } catch {
        // non-fatal
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

  // Auto-install dependencies if requested
  let installed = false;
  let installOutput = '';
  if (options.install && isNew) {
    const installRes = await installDependencies(wsPath, stack);
    installed = installRes.success;
    installOutput = installRes.output;
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
    mode: cloneMode,
    isWorktree: useWorktree,
    stack,
    installed,
    created_at: new Date().toISOString(),
    status: 'active',
  };

  const registry = loadRegistry();
  registry[wsId] = record;
  saveRegistry(registry);

  return { ...record, isNew, stack, installOutput };
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

/**
 * Sync and rebase a workspace branch against upstream/origin main branch.
 * @param {string} idOrTarget
 * @returns {Promise<{ id: string, branch: string, baseBranch: string, synced: boolean, message: string }>}
 */
export async function syncWorkspace(idOrTarget) {
  const ws = getWorkspace(idOrTarget);
  if (!ws) {
    throw new UserError(`Workspace not found for: '${idOrTarget}'.`);
  }

  if (!fs.existsSync(ws.path)) {
    throw new UserError(`Workspace directory does not exist on disk: ${ws.path}`);
  }

  // Determine remotes
  let remoteName = 'origin';
  try {
    const { stdout: remotes } = await runGitCommand(['remote'], { cwd: ws.path });
    if (remotes.includes('upstream')) {
      remoteName = 'upstream';
    }
  } catch {
    // ignore
  }

  // Fetch remote
  try {
    await runGitCommand(['fetch', remoteName], { cwd: ws.path });
  } catch (err) {
    throw new GitError(`Failed to fetch from remote '${remoteName}': ${err.message}`);
  }

  // Determine default branch
  let defaultBranch = 'main';
  try {
    const { stdout: headRef } = await runGitCommand(
      ['symbolic-ref', `refs/remotes/${remoteName}/HEAD`],
      { cwd: ws.path }
    );
    defaultBranch = headRef.split('/').pop() || 'main';
  } catch {
    try {
      await runGitCommand(['rev-parse', '--verify', `${remoteName}/main`], { cwd: ws.path });
      defaultBranch = 'main';
    } catch {
      defaultBranch = 'master';
    }
  }

  // Rebase onto remote default branch
  try {
    await runGitCommand(['rebase', `${remoteName}/${defaultBranch}`], { cwd: ws.path });
    return {
      id: ws.id,
      branch: ws.branch,
      baseBranch: `${remoteName}/${defaultBranch}`,
      synced: true,
      message: `Successfully rebased '${ws.branch}' onto '${remoteName}/${defaultBranch}'.`,
    };
  } catch {
    // If rebase failed, abort rebase to leave workspace in clean state
    try {
      await runGitCommand(['rebase', '--abort'], { cwd: ws.path });
    } catch {
      // ignore
    }
    throw new GitError(
      `Sync failed due to merge conflicts while rebasing onto ${remoteName}/${defaultBranch}. Rebase was aborted.`
    );
  }
}

/**
 * Get the diff of changes made in a contribution workspace.
 * @param {string} idOrTarget
 * @param {{ patch?: boolean, markdown?: boolean }} options
 * @returns {Promise<{ id: string, diff: string, summary: string }>}
 */
export async function getWorkspaceDiff(idOrTarget, options = {}) {
  const ws = getWorkspace(idOrTarget);
  if (!ws) {
    throw new UserError(`Workspace not found for: '${idOrTarget}'.`);
  }

  if (!fs.existsSync(ws.path)) {
    throw new UserError(`Workspace directory does not exist: ${ws.path}`);
  }

  let baseRef = 'HEAD~1';
  try {
    await runGitCommand(['rev-parse', '--verify', 'upstream/main'], { cwd: ws.path });
    baseRef = 'upstream/main...HEAD';
  } catch {
    try {
      await runGitCommand(['rev-parse', '--verify', 'origin/main'], { cwd: ws.path });
      baseRef = 'origin/main...HEAD';
    } catch {
      baseRef = 'HEAD';
    }
  }

  let diffOutput = '';
  try {
    const diffRes = await runGitCommand(['diff', baseRef], { cwd: ws.path });
    diffOutput = diffRes.stdout;
  } catch {
    const fallbackRes = await runGitCommand(['diff'], { cwd: ws.path });
    diffOutput = fallbackRes.stdout;
  }

  let statOutput = '';
  try {
    const statRes = await runGitCommand(['diff', '--stat', baseRef], { cwd: ws.path });
    statOutput = statRes.stdout;
  } catch {
    // ignore
  }

  return {
    id: ws.id,
    diff: diffOutput,
    summary: statOutput || 'No changes detected.',
  };
}


