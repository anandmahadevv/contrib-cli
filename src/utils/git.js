/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Git command execution and verification utilities.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { GitError, SecurityError } from './security.js';

const execFileAsync = promisify(execFile);

/**
 * Check if Git is installed and accessible in PATH.
 * @returns {Promise<string>} Git version string
 */
export async function checkGitInstalled() {
  try {
    const { stdout } = await execFileAsync('git', ['--version']);
    return stdout.trim();
  } catch {
    throw new SecurityError(
      'Git executable was not found in your PATH. Please install Git from https://git-scm.com/ to use this tool.'
    );
  }
}

/**
 * Execute a Git command safely via argument list (shell=false).
 * @param {string[]} args
 * @param {{ cwd?: string, timeout?: number }} options
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
export async function runGitCommand(args, options = {}) {
  const { cwd, timeout = 120000 } = options;

  try {
    const result = await execFileAsync('git', args, {
      cwd,
      timeout,
      shell: false,
      maxBuffer: 10 * 1024 * 1024,
    });
    return {
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new SecurityError(
        'Git executable was not found in your PATH. Please install Git to continue.'
      );
    }
    const stderr = err.stderr ? err.stderr.trim() : err.message;
    throw new GitError(
      `Git command failed: git ${args.join(' ')}\nError: ${stderr}`,
      stderr
    );
  }
}

/**
 * Calculate the total size of a directory on disk.
 * @param {string} dirPath
 * @returns {number} Size in bytes
 */
export function getDirectorySize(dirPath) {
  let totalSize = 0;
  if (!fs.existsSync(dirPath)) return 0;

  function traverse(current) {
    try {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          try {
            const stat = fs.statSync(fullPath);
            totalSize += stat.size;
          } catch {
            // ignore inaccessible files
          }
        }
      }
    } catch {
      // ignore inaccessible dirs
    }
  }

  traverse(dirPath);
  return totalSize;
}

/**
 * Format bytes into human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
