/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Monorepo Local Workspace Closure Planner.
 * Computes package dependency closure for npm and pnpm monorepos before sparse checkout.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Simple YAML reader for pnpm-workspace.yaml package globs.
 * @param {string} yamlContent
 * @returns {string[]}
 */
function parsePnpmWorkspaceYaml(yamlContent) {
  const globs = [];
  const lines = yamlContent.split('\n');
  let inPackagesSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('packages:')) {
      inPackagesSection = true;
      continue;
    }
    if (inPackagesSection) {
      if (trimmed.startsWith('-')) {
        const item = trimmed.replace(/^-/, '').trim().replace(/['"]/g, '');
        if (item) globs.push(item);
      } else if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
        // Exited packages block
        break;
      }
    }
  }
  return globs;
}

/**
 * Discover package directories matching workspace globs safely without symlink traversal.
 * @param {string} rootDir
 * @param {string[]} globs
 * @returns {string[]} Relative folder paths containing package.json
 */
function discoverWorkspacePackages(rootDir, globs) {
  const packagePaths = [];

  for (const pattern of globs) {
    // Handle standard glob patterns like 'packages/*', 'apps/*', 'libs/**'
    const cleanPattern = pattern.replace(/['"]/g, '').replace(/!.*$/, '').trim();
    if (!cleanPattern) continue;

    // Convert simple glob to directory scan
    const baseDirName = cleanPattern.split('/')[0].replace(/\*/g, '');
    const searchBase = path.join(rootDir, baseDirName);

    if (!fs.existsSync(searchBase)) continue;

    try {
      const entries = fs.readdirSync(searchBase, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subDir = path.join(searchBase, entry.name);
          const pkgJsonPath = path.join(subDir, 'package.json');
          if (fs.existsSync(pkgJsonPath)) {
            const rel = path.relative(rootDir, subDir).replace(/\\/g, '/');
            if (!packagePaths.includes(rel)) {
              packagePaths.push(rel);
            }
          }
        }
      }
    } catch {
      // ignore unreadable directories
    }
  }

  return packagePaths;
}

/**
 * Plan the local workspace closure for a monorepo before running sparse checkout.
 *
 * @param {string} wsPath
 * @param {string[]} focusAreas
 * @returns {{ isMonorepo: boolean, targetPaths: string[], requiredPackages: string[], fullCheckoutRequired: boolean, plan?: Record<string, any> }}
 */
export function planWorkspaceClosure(wsPath, focusAreas = []) {
  if (!fs.existsSync(wsPath)) {
    return { isMonorepo: false, targetPaths: focusAreas, requiredPackages: [], fullCheckoutRequired: false };
  }

  let workspaceGlobs = [];
  const rootPkgPath = path.join(wsPath, 'package.json');
  const pnpmYamlPath = path.join(wsPath, 'pnpm-workspace.yaml');

  // Check npm / yarn / bun workspaces in package.json
  if (fs.existsSync(rootPkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
      if (pkg.workspaces) {
        if (Array.isArray(pkg.workspaces)) {
          workspaceGlobs.push(...pkg.workspaces);
        } else if (Array.isArray(pkg.workspaces.packages)) {
          workspaceGlobs.push(...pkg.workspaces.packages);
        }
      }
    } catch {
      return { isMonorepo: true, targetPaths: [], requiredPackages: [], fullCheckoutRequired: true };
    }
  }

  // Check pnpm-workspace.yaml
  if (fs.existsSync(pnpmYamlPath)) {
    try {
      const yamlContent = fs.readFileSync(pnpmYamlPath, 'utf-8');
      const pnpmGlobs = parsePnpmWorkspaceYaml(yamlContent);
      workspaceGlobs.push(...pnpmGlobs);
    } catch {
      // ignore
    }
  }

  if (workspaceGlobs.length === 0) {
    return { isMonorepo: false, targetPaths: focusAreas, requiredPackages: [], fullCheckoutRequired: false };
  }

  // Discover all workspace packages
  const packageRelPaths = discoverWorkspacePackages(wsPath, workspaceGlobs);
  const packageMap = new Map(); // packageName -> { name, relPath, deps }

  for (const relPath of packageRelPaths) {
    const pkgPath = path.join(wsPath, relPath, 'package.json');
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.name) {
        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
          ...(pkg.peerDependencies || {}),
        };
        packageMap.set(pkg.name, {
          name: pkg.name,
          relPath,
          deps: Object.keys(allDeps),
        });
      }
    } catch {
      // ignore malformed package.json
    }
  }

  // Determine target seed packages from focus areas
  const seedPackages = new Set();
  const focusList = Array.isArray(focusAreas) ? focusAreas : [focusAreas];

  for (const focus of focusList) {
    const normalized = String(focus).replace(/\\/g, '/');
    for (const [pkgName, pkgInfo] of packageMap.entries()) {
      if (normalized === pkgInfo.relPath || normalized.startsWith(`${pkgInfo.relPath}/`)) {
        seedPackages.add(pkgName);
      }
    }
  }

  // If focus areas did not match any specific subpackage, include all discovered packages
  if (seedPackages.size === 0) {
    for (const pkgName of packageMap.keys()) {
      seedPackages.add(pkgName);
    }
  }

  // Traverse transitive dependencies within the workspace
  const visited = new Set();
  const requiredPackages = [];
  const targetPaths = [];

  function visit(pkgName) {
    if (visited.has(pkgName)) return;
    visited.add(pkgName);

    const pkgInfo = packageMap.get(pkgName);
    if (!pkgInfo) return;

    requiredPackages.push(pkgInfo.name);
    targetPaths.push(pkgInfo.relPath);

    for (const depName of pkgInfo.deps) {
      if (packageMap.has(depName)) {
        visit(depName);
      }
    }
  }

  for (const seed of seedPackages) {
    visit(seed);
  }

  const plan = {
    isMonorepo: true,
    globs: workspaceGlobs,
    discoveredPackagesCount: packageMap.size,
    seedPackages: Array.from(seedPackages),
    requiredPackages,
    targetPaths,
    created_at: new Date().toISOString(),
  };

  // Write closure plan artifact to .contrib inside workspace
  try {
    const contribDir = path.join(wsPath, '.contrib');
    if (!fs.existsSync(contribDir)) {
      fs.mkdirSync(contribDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(contribDir, 'closure_plan.json'),
      JSON.stringify(plan, null, 2),
      'utf-8'
    );
  } catch {
    // non-fatal
  }

  return {
    isMonorepo: true,
    targetPaths,
    requiredPackages,
    fullCheckoutRequired: false,
    plan,
  };
}
