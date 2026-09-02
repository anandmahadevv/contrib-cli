/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * gsoc-contrib (contrib) - Programmatic API.
 * Lightweight GitHub contribution workspace manager.
 */

export {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  deleteWorkspace,
  analyzeIssue,
  writeWorkspaceContextFiles,
  syncWorkspace,
  getWorkspaceDiff,
} from './services/workspace.js';

export {
  fetchIssueMetadata,
  searchIssues,
  checkGitHubAuth,
  getUserFork,
  createFork,
  getRepoDefaultBranch,
} from './services/github.js';

export {
  getContribHome,
  getWorkspacesDir,
  getCacheDir,
  getApiCacheDir,
  getGitCacheDir,
  getRegistryFile,
  loadRegistry,
  saveRegistry,
  removeRegistryEntry,
} from './config/index.js';

export {
  validateGitHubUrl,
  sanitizeWorkspaceName,
  isPathInside,
  SecurityError,
  UserError,
  GitError,
  GitHubApiError,
} from './utils/security.js';

export {
  runGitCommand,
  checkGitInstalled,
  getDirectorySize,
  formatBytes,
  isGitDirty,
  getGitStatusSummary,
  setupSparseCheckout,
  detectProjectStack,
  installDependencies,
} from './utils/git.js';

export {
  getGitHubToken,
  checkNodeVersion,
} from './utils/env.js';

export { logger } from './utils/logger.js';
export { createProgram, runCli } from './cli.js';

