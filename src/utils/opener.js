/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Cross-platform opener utilities for editors, browsers, and terminal viewers.
 */

import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { SecurityError, UserError } from './security.js';

const TERMINAL_EDITORS = new Set([
  'vim',
  'vi',
  'nvim',
  'nano',
  'emacs',
  'helix',
  'hx',
  'micro',
  'pico',
]);

export const EDITOR_CANDIDATES = {
  antigravity: ['antigravity-ide', 'antigravity', 'agy'],
  code: ['code', 'code.cmd'],
  cursor: ['cursor', 'cursor.cmd'],
  nvim: ['nvim', 'nvim.exe'],
  vim: ['vim', 'vim.exe'],
  helix: ['hx', 'helix'],
  zed: ['zed', 'zedit'],
  sublime: ['subl', 'sublime_text'],
  idea: ['idea', 'idea64.exe', 'idea.cmd'],
  pycharm: ['pycharm', 'pycharm64.exe', 'pycharm.cmd'],
  webstorm: ['webstorm', 'webstorm64.exe', 'webstorm.cmd'],
};

/**
 * Resolve an editor key or name to an available system binary.
 * @param {string} editorKeyOrName
 * @returns {string}
 */
export function resolveEditorBinary(editorKeyOrName) {
  if (!editorKeyOrName || typeof editorKeyOrName !== 'string') return 'code';
  const key = editorKeyOrName.toLowerCase().trim();
  const candidates = EDITOR_CANDIDATES[key] || [editorKeyOrName.trim()];
  for (const candidate of candidates) {
    if (isCommandAvailable(candidate)) {
      return candidate;
    }
  }
  return candidates[0];
}

/**
 * Resolve the requested editor from CLI option flags.
 * @param {Record<string, any>} options
 * @returns {string | null}
 */
export function resolveRequestedEditor(options = {}) {
  if (options.antigravity || options.agy || options.ide) {
    return resolveEditorBinary('antigravity');
  }
  if (options.code) {
    return resolveEditorBinary('code');
  }
  if (options.cursor) {
    return resolveEditorBinary('cursor');
  }
  if (options.nvim) {
    return resolveEditorBinary('nvim');
  }
  if (options.vim) {
    return resolveEditorBinary('vim');
  }
  if (options.helix || options.hx) {
    return resolveEditorBinary('helix');
  }
  if (options.zed) {
    return resolveEditorBinary('zed');
  }
  if (options.subl || options.sublime) {
    return resolveEditorBinary('sublime');
  }
  if (options.idea) {
    return resolveEditorBinary('idea');
  }
  if (options.pycharm) {
    return resolveEditorBinary('pycharm');
  }
  if (options.webstorm) {
    return resolveEditorBinary('webstorm');
  }
  if (options.editor && typeof options.editor === 'string') {
    return resolveEditorBinary(options.editor);
  }
  if (options.open) {
    return detectDefaultEditor();
  }
  return null;
}

/**
 * Check if a command executable is available in PATH.
 * @param {string} cmd
 * @returns {boolean}
 */
export function isCommandAvailable(cmd) {
  if (!cmd || typeof cmd !== 'string') return false;
  const trimmed = cmd.trim();
  // Safe binary name verification
  if (!/^[a-zA-Z0-9_\-\.]+$/.test(trimmed)) return false;

  const checker = process.platform === 'win32' ? 'where.exe' : 'which';
  try {
    execFileSync(checker, [trimmed], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect the preferred default editor on the current system.
 * Checks $VISUAL, $EDITOR, Antigravity, VS Code, Cursor, Zed, Sublime, Neovim, Vim, Helix.
 * @returns {string | null}
 */
export function detectDefaultEditor() {
  if (process.env.VISUAL && process.env.VISUAL.trim()) {
    const visual = process.env.VISUAL.trim();
    if (isCommandAvailable(visual)) return visual;
  }
  if (process.env.EDITOR && process.env.EDITOR.trim()) {
    const editor = process.env.EDITOR.trim();
    if (isCommandAvailable(editor)) return editor;
  }
  const defaultPriority = [
    'antigravity-ide',
    'antigravity',
    'code',
    'cursor',
    'zed',
    'subl',
    'nvim',
    'vim',
    'hx',
  ];
  for (const ed of defaultPriority) {
    if (isCommandAvailable(ed)) {
      return ed;
    }
  }
  return null;
}

/**
 * Open a file or directory in the user's chosen or detected editor.
 * @param {string} targetPath Absolute or relative path to open
 * @param {string} editorName Editor binary name (e.g. 'code', 'cursor', 'vim', 'nvim')
 * @returns {Promise<number>}
 */
export async function openInEditor(targetPath, editorName = 'code') {
  if (!targetPath || typeof targetPath !== 'string') {
    throw new UserError('Target path for editor must be a valid non-empty string.');
  }

  const resolved = path.resolve(targetPath);
  if (!fs.existsSync(resolved)) {
    throw new UserError(`Path does not exist on disk: ${resolved}`);
  }

  const safeEditor = (editorName || 'code').trim();
  const baseName = path.basename(safeEditor).toLowerCase().replace(/\.(exe|cmd|bat)$/, '');
  const isTerminal = TERMINAL_EDITORS.has(baseName);

  if (isTerminal) {
    try {
      const child = spawn(safeEditor, [resolved], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });

      return await new Promise((resolve, reject) => {
        child.on('error', (err) => {
          reject(new UserError(`Failed to launch terminal editor '${safeEditor}': ${err.message}`));
        });
        child.on('exit', (code) => {
          resolve(code || 0);
        });
      });
    } catch (err) {
      if (err instanceof UserError) throw err;
      throw new UserError(`Failed to launch terminal editor '${safeEditor}': ${err.message}`);
    }
  }

  // GUI editor
  try {
    if (process.platform === 'win32') {
      const child = spawn(
        process.env.ComSpec || 'cmd.exe',
        ['/d', '/s', '/c', `${safeEditor} "${resolved}"`],
        {
          windowsVerbatimArguments: true,
          detached: true,
          stdio: 'ignore',
        }
      );
      child.unref();
    } else {
      const child = spawn(safeEditor, [resolved], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
    }
    return 0;
  } catch (err) {
    throw new UserError(`Failed to launch editor '${safeEditor}': ${err.message}`);
  }
}

/**
 * Open a web URL safely in the system default browser.
 * @param {string} url
 * @returns {Promise<string>} Opened URL
 */
export async function openInBrowser(url) {
  if (!url || typeof url !== 'string') {
    throw new SecurityError('A valid URL must be provided.');
  }

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new SecurityError(`Invalid URL format: '${url}'.`);
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new SecurityError(
      `Invalid URL protocol: '${parsed.protocol}'. Only HTTP and HTTPS URLs are supported.`
    );
  }

  const safeUrl = parsed.href;

  try {
    if (process.platform === 'win32') {
      const child = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', safeUrl], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      });
      child.unref();
    } else if (process.platform === 'darwin') {
      const child = spawn('open', [safeUrl], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
    } else {
      const child = spawn('xdg-open', [safeUrl], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
    }
    return safeUrl;
  } catch (err) {
    throw new UserError(`Failed to open default browser: ${err.message}`);
  }
}
