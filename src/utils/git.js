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
import { GitError, SecurityError, redactSensitiveOutput } from './security.js';

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
    const rawStderr = err.stderr ? err.stderr.trim() : err.message;
    const sanitizedStderr = redactSensitiveOutput(rawStderr);
    const sanitizedArgs = redactSensitiveOutput(args.join(' '));
    throw new GitError(
      `Git command failed: git ${sanitizedArgs}\nError: ${sanitizedStderr}`,
      sanitizedStderr
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

/**
 * Check if the git repository at cwd has uncommitted or untracked changes.
 * @param {string} cwd
 * @returns {Promise<boolean>}
 */
export async function isGitDirty(cwd) {
  if (!fs.existsSync(cwd) || !fs.existsSync(path.join(cwd, '.git'))) {
    return false;
  }
  try {
    const { stdout } = await runGitCommand(['status', '--porcelain'], { cwd });
    return stdout.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get detailed git status summary for a workspace.
 * @param {string} cwd
 * @returns {Promise<{ isDirty: boolean, files: string[], currentBranch: string, unpushedCount: number }>}
 */
export async function getGitStatusSummary(cwd) {
  if (!fs.existsSync(cwd) || !fs.existsSync(path.join(cwd, '.git'))) {
    return { isDirty: false, files: [], currentBranch: 'unknown', unpushedCount: 0 };
  }

  let isDirty = false;
  let files = [];
  let currentBranch = 'main';
  let unpushedCount = 0;

  try {
    const statusRes = await runGitCommand(['status', '--porcelain'], { cwd });
    if (statusRes.stdout) {
      files = statusRes.stdout.split('\n').map((l) => l.trim()).filter(Boolean);
      isDirty = files.length > 0;
    }
  } catch {
    // ignore
  }

  try {
    const branchRes = await runGitCommand(['branch', '--show-current'], { cwd });
    if (branchRes.stdout) {
      currentBranch = branchRes.stdout.trim();
    }
  } catch {
    // ignore
  }

  try {
    // Check commits relative to upstream/origin if exists or upstream/main
    const logRes = await runGitCommand(['log', '@{u}..HEAD', '--oneline'], { cwd });
    if (logRes.stdout) {
      unpushedCount = logRes.stdout.split('\n').filter(Boolean).length;
    }
  } catch {
    // Upstream tracking may not be configured; check against main/master
    try {
      const logRes = await runGitCommand(['log', 'main..HEAD', '--oneline'], { cwd });
      if (logRes.stdout) {
        unpushedCount = logRes.stdout.split('\n').filter(Boolean).length;
      }
    } catch {
      // ignore
    }
  }

  return {
    isDirty,
    files,
    currentBranch,
    unpushedCount,
  };
}

/**
 * Configure sparse-checkout in cone mode for specified directories.
 * @param {string} wsPath
 * @param {string[] | string} paths
 * @returns {Promise<void>}
 */
export async function setupSparseCheckout(wsPath, paths) {
  const pathList = Array.isArray(paths)
    ? paths
    : String(paths)
        .split(/[,\s]+/)
        .map((p) => p.trim())
        .filter(Boolean);

  if (pathList.length === 0) return;

  // Initialize sparse-checkout cone mode
  await runGitCommand(['sparse-checkout', 'init', '--cone'], { cwd: wsPath });
  await runGitCommand(['sparse-checkout', 'set', ...pathList], { cwd: wsPath });
}

/**
 * Detect project runtime, framework, package manager, and build/test commands.
 * @param {string} dirPath
 * @returns {{ type: string, packageManager: string, testCommand: string, buildCommand: string, details: string[] }}
 */
export function detectProjectStack(dirPath) {
  const stack = {
    type: 'Generic / Unknown',
    packageManager: 'unknown',
    testCommand: '',
    buildCommand: '',
    details: [],
  };

  if (!fs.existsSync(dirPath)) return stack;

  let files;
  try {
    files = new Set(fs.readdirSync(dirPath));
  } catch {
    return stack;
  }

  // Node.js / JavaScript / TypeScript
  if (files.has('package.json')) {
    stack.type = 'Node.js / JavaScript';
    stack.packageManager = 'npm';
    if (files.has('pnpm-lock.yaml')) stack.packageManager = 'pnpm';
    else if (files.has('yarn.lock')) stack.packageManager = 'yarn';
    else if (files.has('bun.lockb') || files.has('bun.lock')) stack.packageManager = 'bun';

    try {
      const pkgRaw = fs.readFileSync(path.join(dirPath, 'package.json'), 'utf-8');
      const pkg = JSON.parse(pkgRaw);
      if (pkg.scripts) {
        if (pkg.scripts.test) stack.testCommand = `${stack.packageManager} test`;
        if (pkg.scripts.build) stack.buildCommand = `${stack.packageManager} run build`;
        if (pkg.scripts.lint) stack.details.push(`lint: ${stack.packageManager} run lint`);
      }
      if (pkg.devDependencies?.typescript || pkg.dependencies?.typescript || files.has('tsconfig.json')) {
        stack.type = 'Node.js / TypeScript';
      }
    } catch {
      // ignore JSON parse error
    }
  }
  // Python
  else if (files.has('pyproject.toml') || files.has('requirements.txt') || files.has('Pipfile') || files.has('setup.py')) {
    stack.type = 'Python';
    stack.packageManager = 'pip';
    if (
      files.has('poetry.lock') ||
      (files.has('pyproject.toml') &&
        fs.readFileSync(path.join(dirPath, 'pyproject.toml'), 'utf-8').includes('[tool.poetry]'))
    ) {
      stack.packageManager = 'poetry';
      stack.testCommand = 'poetry run pytest';
    } else if (files.has('uv.lock')) {
      stack.packageManager = 'uv';
      stack.testCommand = 'uv run pytest';
    } else if (files.has('Pipfile')) {
      stack.packageManager = 'pipenv';
      stack.testCommand = 'pipenv run pytest';
    } else {
      stack.testCommand = 'pytest';
    }
  }
  // Rust
  else if (files.has('Cargo.toml')) {
    stack.type = 'Rust';
    stack.packageManager = 'cargo';
    stack.testCommand = 'cargo test';
    stack.buildCommand = 'cargo build';
  }
  // Go
  else if (files.has('go.mod')) {
    stack.type = 'Go';
    stack.packageManager = 'go';
    stack.testCommand = 'go test ./...';
    stack.buildCommand = 'go build ./...';
  }
  // Java / Kotlin
  else if (files.has('pom.xml')) {
    stack.type = 'Java / Maven';
    stack.packageManager = 'mvn';
    stack.testCommand = 'mvn test';
    stack.buildCommand = 'mvn clean install';
  } else if (files.has('build.gradle') || files.has('build.gradle.kts')) {
    stack.type = 'Java / Gradle';
    stack.packageManager = files.has('gradlew') ? './gradlew' : 'gradle';
    stack.testCommand = `${stack.packageManager} test`;
    stack.buildCommand = `${stack.packageManager} build`;
  }

  // Makefile fallback
  if (!stack.testCommand && files.has('Makefile')) {
    stack.testCommand = 'make test';
  }

  return stack;
}

/**
 * Run package manager install command if available.
 * @param {string} wsPath
 * @param {Record<string, any>} stack
 * @returns {Promise<{ success: boolean, command: string, output: string }>}
 */
export async function installDependencies(wsPath, stack) {
  let cmd = 'npm';
  let args = ['install'];

  if (stack.packageManager === 'pnpm') {
    cmd = 'pnpm';
    args = ['install'];
  } else if (stack.packageManager === 'yarn') {
    cmd = 'yarn';
    args = ['install'];
  } else if (stack.packageManager === 'bun') {
    cmd = 'bun';
    args = ['install'];
  } else if (stack.packageManager === 'poetry') {
    cmd = 'poetry';
    args = ['install'];
  } else if (stack.packageManager === 'uv') {
    cmd = 'uv';
    args = ['sync'];
  } else if (stack.packageManager === 'cargo') {
    cmd = 'cargo';
    args = ['fetch'];
  } else if (stack.packageManager === 'go') {
    cmd = 'go';
    args = ['mod', 'download'];
  }

  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      cwd: wsPath,
      timeout: 180000,
      shell: process.platform === 'win32',
    });
    return {
      success: true,
      command: `${cmd} ${args.join(' ')}`,
      output: (stdout || stderr || '').trim(),
    };
  } catch (err) {
    return {
      success: false,
      command: `${cmd} ${args.join(' ')}`,
      output: err.message,
    };
  }
}


