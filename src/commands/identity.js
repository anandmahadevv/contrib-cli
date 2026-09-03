/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'identity' command.
 * Manage multiple Git/SSH identities and switch them across contribution workspaces.
 */

import path from 'node:path';
import { logger } from '../utils/logger.js';
import {
  loadIdentities,
  setIdentity,
  removeIdentity,
  getIdentity,
  saveRegistry,
  loadRegistry,
} from '../config/index.js';
import { listWorkspaces, getWorkspace } from '../services/workspace.js';
import { applyIdentityToWorkspace } from '../services/identity.js';

/**
 * Handle identity subcommands.
 * @param {'add' | 'set' | 'list' | 'use' | 'remove' | 'rm'} action
 * @param {string | undefined} targetName
 * @param {{
 *   name?: string,
 *   email?: string,
 *   sshHost?: string,
 *   sshKey?: string,
 *   signingKey?: string,
 *   workspace?: string
 * }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleIdentity(action, targetName, options = {}) {
  const normalizedAction = (action || 'list').toLowerCase();

  // 1. LIST IDENTITIES
  if (normalizedAction === 'list') {
    const list = loadIdentities();
    const keys = Object.keys(list);
    if (keys.length === 0) {
      logger.plain('No Git identities configured yet.');
      logger.plain('Add one using:');
      logger.step(
        '  add identity:',
        'npx gsoc-contrib identity add personal --name "Your Name" --email "your@email.com"'
      );
      return 0;
    }

    logger.plain(`Configured Git Identities (${keys.length}):`);
    logger.divider(72);
    for (const key of keys) {
      const id = list[key];
      logger.plain(`  ID:       ${id.id}`);
      logger.plain(`  Name:     ${id.name}`);
      logger.plain(`  Email:    ${id.email}`);
      if (id.sshHost) logger.plain(`  SSH Host: ${id.sshHost}`);
      if (id.sshKey) logger.plain(`  SSH Key:  ${id.sshKey}`);
      if (id.signingKey) logger.plain(`  GPG Key:  ${id.signingKey}`);
      logger.divider(72);
    }
    return 0;
  }

  // 2. ADD / SET IDENTITY
  if (normalizedAction === 'add' || normalizedAction === 'set') {
    if (!targetName) {
      logger.error('Identity name is required.');
      logger.plain('  Usage: npx gsoc-contrib identity add <name> --name "Full Name" --email "user@domain.com"');
      return 1;
    }
    if (!options.name || !options.email) {
      logger.error('Both --name and --email options are required when adding an identity.');
      logger.plain('  Example: npx gsoc-contrib identity add work --name "Alice Smith" --email "alice@company.com"');
      return 1;
    }

    const saved = setIdentity(targetName, {
      name: options.name,
      email: options.email,
      sshHost: options.sshHost,
      sshKey: options.sshKey,
      signingKey: options.signingKey,
    });

    logger.success(`Saved identity '${saved.id}' successfully!`);
    logger.plain(`  user.name:  ${saved.name}`);
    logger.plain(`  user.email: ${saved.email}`);
    if (saved.sshHost) logger.plain(`  ssh-host:   ${saved.sshHost}`);
    return 0;
  }

  // 3. REMOVE IDENTITY
  if (normalizedAction === 'remove' || normalizedAction === 'rm' || normalizedAction === 'delete') {
    if (!targetName) {
      logger.error('Identity name to remove is required.');
      logger.plain('  Usage: npx gsoc-contrib identity remove <name>');
      return 1;
    }
    const removed = removeIdentity(targetName);
    if (removed) {
      logger.success(`Removed identity '${targetName}'.`);
      return 0;
    } else {
      logger.warn(`Identity '${targetName}' was not found.`);
      return 1;
    }
  }

  // 4. USE IDENTITY IN WORKSPACE
  if (normalizedAction === 'use') {
    if (!targetName) {
      logger.error('Identity name is required.');
      logger.plain('  Usage: npx gsoc-contrib identity use <name> [workspace-id]');
      return 1;
    }

    const identity = getIdentity(targetName);
    if (!identity) {
      logger.error(`Identity '${targetName}' not found in registry.`);
      logger.plain('List configured identities with: npx gsoc-contrib identity list');
      return 1;
    }

    let ws = null;
    if (options.workspace) {
      ws = getWorkspace(options.workspace);
    } else {
      const cwd = process.cwd();
      const allWs = listWorkspaces();
      ws = allWs.find((w) => path.resolve(w.path) === path.resolve(cwd) || cwd.startsWith(path.resolve(w.path))) || null;
      if (!ws && allWs.length === 1) {
        ws = allWs[0];
      }
    }

    if (!ws) {
      logger.error('No active workspace detected to apply identity to.');
      logger.plain('Run inside a workspace directory or provide the workspace ID.');
      return 1;
    }

    try {
      await applyIdentityToWorkspace(ws.path, identity);
      // Update registry with applied identity
      const reg = loadRegistry();
      if (reg[ws.id]) {
        reg[ws.id].identity = identity.id;
        saveRegistry(reg);
      }
      logger.success(`Applied identity '${identity.id}' (${identity.name} <${identity.email}>) to workspace '${ws.id}'!`);
      return 0;
    } catch (err) {
      logger.error(err.message);
      return 1;
    }
  }

  logger.error(`Unknown identity action: '${action}'. Supported actions: list, add, use, remove.`);
  return 1;
}
