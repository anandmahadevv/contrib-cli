/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Git and SSH identity service.
 * Applies user identities and SSH host configurations to Git workspaces.
 */

import { runGitCommand } from '../utils/git.js';
import { UserError } from '../utils/security.js';
import { getIdentity } from '../config/index.js';

/**
 * Apply a configured identity to a target Git workspace.
 * @param {string} wsPath Workspace directory
 * @param {string | { name: string, email: string, sshHost?: string, sshKey?: string, signingKey?: string }} identityOrName
 * @returns {Promise<{ name: string, email: string, sshHost?: string }>}
 */
export async function applyIdentityToWorkspace(wsPath, identityOrName) {
  let identity = null;
  if (typeof identityOrName === 'string') {
    identity = getIdentity(identityOrName);
    if (!identity) {
      throw new UserError(
        `Identity '${identityOrName}' not found. Configure it first with: npx gsoc-contrib identity add ${identityOrName} --name "Your Name" --email "your@email.com"`
      );
    }
  } else if (identityOrName && typeof identityOrName === 'object') {
    identity = identityOrName;
  }

  if (!identity || !identity.name || !identity.email) {
    throw new UserError('Identity must contain both a valid name and email.');
  }

  // 1. Configure local user name & email
  await runGitCommand(['config', 'user.name', identity.name], { cwd: wsPath });
  await runGitCommand(['config', 'user.email', identity.email], { cwd: wsPath });

  // 2. GPG / signing key if specified
  if (identity.signingKey) {
    await runGitCommand(['config', 'user.signingkey', identity.signingKey], { cwd: wsPath });
    await runGitCommand(['config', 'commit.gpgsign', 'true'], { cwd: wsPath });
  }

  // 3. Custom SSH key via core.sshCommand
  if (identity.sshKey) {
    await runGitCommand(['config', 'core.sshCommand', `ssh -i "${identity.sshKey}"`], { cwd: wsPath });
  }

  // 4. SSH Host rewriting for remotes (e.g. git@github.com:... -> git@github-personal:...)
  if (identity.sshHost) {
    try {
      const { stdout: remotes } = await runGitCommand(['remote'], { cwd: wsPath });
      const remoteList = remotes.split(/\s+/).filter(Boolean);
      for (const r of remoteList) {
        const { stdout: remoteUrl } = await runGitCommand(['remote', 'get-url', r], { cwd: wsPath });
        const trimmedUrl = remoteUrl.trim();
        if (trimmedUrl.startsWith('git@github.com:')) {
          const newUrl = trimmedUrl.replace('git@github.com:', `git@${identity.sshHost}:`);
          await runGitCommand(['remote', 'set-url', r, newUrl], { cwd: wsPath });
        } else if (trimmedUrl.startsWith('https://github.com/')) {
          const pathPart = trimmedUrl.replace('https://github.com/', '');
          const newUrl = `git@${identity.sshHost}:${pathPart}`;
          await runGitCommand(['remote', 'set-url', r, newUrl], { cwd: wsPath });
        }
      }
    } catch {
      // non-fatal
    }
  }

  return identity;
}
