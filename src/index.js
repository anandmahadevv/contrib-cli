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
  getIdentitiesFile,
  loadIdentities,
  saveIdentities,
  getIdentity,
  setIdentity,
  removeIdentity,
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

export {
  scanContributingGuidelines,
  scanPullRequestTemplate,
  scanLintersAndFormatters,
  generateAiPromptV2,
} from './services/context.js';

export {
  openInEditor,
  openInBrowser,
  isCommandAvailable,
  detectDefaultEditor,
  resolveRequestedEditor,
  resolveEditorBinary,
  EDITOR_CANDIDATES,
} from './utils/opener.js';

export {
  detectShell,
  getShellIntegrationScript,
  getShellConfigFile,
  handleShellInit,
  handleAlias,
} from './commands/shell.js';

export { applyIdentityToWorkspace } from './services/identity.js';
export { handleIdentity } from './commands/identity.js';
export { handleDashboard } from './commands/dashboard.js';
export { handleOpen } from './commands/open.js';
export { logger } from './utils/logger.js';
export { createProgram, runCli } from './cli.js';

