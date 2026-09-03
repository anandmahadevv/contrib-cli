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
  scanContributingGuidelines,
  scanPullRequestTemplate,
  scanLintersAndFormatters,
  generateAiPromptV2,
} from './context.js';
import { applyIdentityToWorkspace } from './identity.js';
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

  // Scan repository for contributing guidelines, PR templates, and quality tools
  const contributing = scanContributingGuidelines(wsPath);
  const prTemplate = scanPullRequestTemplate(wsPath);
  const qualityTools = scanLintersAndFormatters(wsPath, stack);

  // Generate surgical v2 AI prompt for coding agents
  const aiPromptContent = generateAiPromptV2({
    meta,
    stack,
    targetBranch,
    focusAreas,
    contributing,
    prTemplate,
    qualityTools,
  });

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
    contributing_file: contributing ? contributing.path : null,
    pr_template_file: prTemplate ? prTemplate.path : null,
    quality_tools: qualityTools || [],
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
  const meta = await fetchIssueMetadata(target, options);
  const owner = meta.owner;
  const repo = meta.repo;
  const issueNum = meta.issue_number || 'main';

  const analysis = await analyzeIssue(target, options);
  const focusAreas = analysis.suggested_focus_areas || [];

  const wsId = sanitizeWorkspaceName(`${owner}__${repo}__issue_${issueNum}`);
  const wsPath = path.join(getWorkspacesDir(), wsId);

  const targetBranch = options.branch || `contrib/issue-${issueNum}`;
  const useWorktree = Boolean(options.worktree || options.mode === 'worktree');
  const cloneMode = useWorktree ? 'worktree' : (options.mode || 'blobless');

  let isNew = false;
  let configuredFork = null;
  let appliedIdentity = options.identity || null;

  if (!fs.existsSync(wsPath)) {
    isNew = true;

    try {
      const bareCacheDir = path.join(getGitCacheDir(), `${owner.toLowerCase()}__${repo.toLowerCase()}.git`);

      if (useWorktree) {
        // Shared Bare Repo Cache & Git Worktree
        if (!fs.existsSync(bareCacheDir)) {
          if (options.offline) {
            throw new UserError(
              `Cannot create workspace in offline mode: repository '${owner}/${repo}' is not cached locally. Run online first to cache the repository.`
            );
          }
          fs.mkdirSync(path.dirname(bareCacheDir), { recursive: true });
          await runGitCommand(['clone', '--bare', '--filter=blob:none', meta.clone_url, bareCacheDir]);
        } else if (!options.offline) {
          try {
            await runGitCommand(['fetch', 'origin'], { cwd: bareCacheDir, timeout: 15000 });
          } catch {
            // offline or network failure, use cached bare repo
          }
        }

        // Determine starting point branch from bare cache
        let startPoint = 'HEAD';
        try {
          const { stdout: branchOut } = await runGitCommand(['branch'], { cwd: bareCacheDir });
          const branches = branchOut.split('\n').map((b) => b.trim().replace(/^\*\s*/, '')).filter(Boolean);
          if (branches.includes('main')) startPoint = 'main';
          else if (branches.includes('master')) startPoint = 'master';
          else if (branches.length > 0) startPoint = branches[0];
        } catch {
          // ignore
        }

        // Add git worktree
        fs.mkdirSync(path.dirname(wsPath), { recursive: true });
        await runGitCommand(
          ['worktree', 'add', '-b', targetBranch, wsPath, startPoint],
          { cwd: bareCacheDir }
        );
      } else {
        // Standard Blobless / Treeless / Shallow clone
        fs.mkdirSync(wsPath, { recursive: true });

        let cloneSource = meta.clone_url;
        if (options.offline) {
          if (fs.existsSync(bareCacheDir)) {
            cloneSource = bareCacheDir;
          } else {
            throw new UserError(
              `Cannot create workspace in offline mode: repository '${owner}/${repo}' is not cached locally. Run online first to cache the repository.`
            );
          }
        }

        let cloneArgs = ['clone', '--filter=blob:none', cloneSource, wsPath];
        if (cloneMode === 'treeless') {
          cloneArgs = ['clone', '--filter=tree:0', cloneSource, wsPath];
        } else if (cloneMode === 'shallow') {
          cloneArgs = ['clone', '--depth', '1', cloneSource, wsPath];
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

      // Configure fork remotes if requested or specified
      if (options.fork) {
        try {
          let forkUrl = null;
          let forkOwner = null;
          if (typeof options.fork === 'string' && options.fork.trim()) {
            const trimmedFork = options.fork.trim();
            if (trimmedFork.startsWith('http') || trimmedFork.startsWith('git@')) {
              forkUrl = trimmedFork;
            } else if (trimmedFork.includes('/')) {
              forkUrl = `https://github.com/${trimmedFork}.git`;
              forkOwner = trimmedFork.split('/')[0];
            } else {
              forkUrl = `https://github.com/${trimmedFork}/${repo}.git`;
              forkOwner = trimmedFork;
            }
          } else {
            const forkInfo = await getUserFork(owner, repo);
            if (forkInfo && forkInfo.exists && forkInfo.forkUrl) {
              forkUrl = forkInfo.forkUrl;
              forkOwner = forkInfo.forkOwner;
            }
          }

          if (forkUrl) {
            const { stdout: remotes } = await runGitCommand(['remote'], { cwd: wsPath });
            if (!remotes.includes('upstream')) {
              await runGitCommand(['remote', 'rename', 'origin', 'upstream'], { cwd: wsPath });
            }
            if (!remotes.includes('origin')) {
              await runGitCommand(['remote', 'add', 'origin', forkUrl], { cwd: wsPath });
            } else {
              await runGitCommand(['remote', 'set-url', 'origin', forkUrl], { cwd: wsPath });
            }
            configuredFork = { url: forkUrl, owner: forkOwner };
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

      // Configure user Git/SSH identity if requested
      if (options.identity) {
        const idRes = await applyIdentityToWorkspace(wsPath, options.identity);
        appliedIdentity = idRes.id || options.identity;
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
    fork: configuredFork,
    identity: appliedIdentity,
    offline: Boolean(options.offline),
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
 * Supports multi-remote fork syncing and push to fork.
 * @param {string} idOrTarget
 * @param {{ push?: boolean, fork?: boolean }} options
 * @returns {Promise<{ id: string, branch: string, baseBranch: string, synced: boolean, pushed?: boolean, message: string }>}
 */
export async function syncWorkspace(idOrTarget, options = {}) {
  const ws = getWorkspace(idOrTarget);
  if (!ws) {
    throw new UserError(`Workspace not found for: '${idOrTarget}'.`);
  }

  if (!fs.existsSync(ws.path)) {
    throw new UserError(`Workspace directory does not exist on disk: ${ws.path}`);
  }

  // If --fork requested and workspace doesn't have upstream remote yet, configure it
  if (options.fork) {
    try {
      const { stdout: remotes } = await runGitCommand(['remote'], { cwd: ws.path });
      if (!remotes.includes('upstream')) {
        const forkInfo = await getUserFork(ws.owner, ws.repo);
        if (forkInfo && forkInfo.exists && forkInfo.forkUrl) {
          await runGitCommand(['remote', 'rename', 'origin', 'upstream'], { cwd: ws.path });
          await runGitCommand(['remote', 'add', 'origin', forkInfo.forkUrl], { cwd: ws.path });
        }
      }
    } catch {
      // ignore
    }
  }

  // Determine remotes
  let remoteName = 'origin';
  let hasOrigin = false;
  try {
    const { stdout: remotes } = await runGitCommand(['remote'], { cwd: ws.path });
    if (remotes.includes('upstream')) {
      remoteName = 'upstream';
    }
    if (remotes.includes('origin')) {
      hasOrigin = true;
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

  // Push to personal fork if requested or configured
  let pushed = false;
  let pushMessage = '';
  if (options.push || options.fork) {
    if (hasOrigin && remoteName === 'upstream') {
      try {
        await runGitCommand(['push', 'origin', ws.branch, '--force-with-lease'], { cwd: ws.path });
        pushed = true;
        pushMessage = ` and pushed to 'origin/${ws.branch}'`;
      } catch (pushErr) {
        pushMessage = ` (push to fork failed: ${pushErr.message})`;
      }
    }
  }

  return {
    id: ws.id,
    branch: ws.branch,
    baseBranch: `${remoteName}/${defaultBranch}`,
    synced: true,
    pushed,
    message: `Successfully rebased '${ws.branch}' onto '${remoteName}/${defaultBranch}'${pushMessage}.`,
  };
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


