import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { planWorkspaceClosure } from '../src/services/planner.js';

describe('Monorepo Workspace Closure Planner', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-planner-test-'));
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  test('returns non-monorepo result when no workspace manifest exists', () => {
    const res = planWorkspaceClosure(tmpDir, ['src/index.js']);
    assert.strictEqual(res.isMonorepo, false);
    assert.deepStrictEqual(res.targetPaths, ['src/index.js']);
  });

  test('correctly discovers npm workspaces and transitive package dependencies', () => {
    // Write root package.json
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'my-monorepo', workspaces: ['packages/*'] }),
      'utf-8'
    );

    // Create subpackages: packages/core, packages/utils (core -> utils)
    const pkgCoreDir = path.join(tmpDir, 'packages', 'core');
    const pkgUtilsDir = path.join(tmpDir, 'packages', 'utils');
    fs.mkdirSync(pkgCoreDir, { recursive: true });
    fs.mkdirSync(pkgUtilsDir, { recursive: true });

    fs.writeFileSync(
      path.join(pkgCoreDir, 'package.json'),
      JSON.stringify({ name: '@myorg/core', dependencies: { '@myorg/utils': '^1.0.0' } }),
      'utf-8'
    );

    fs.writeFileSync(
      path.join(pkgUtilsDir, 'package.json'),
      JSON.stringify({ name: '@myorg/utils' }),
      'utf-8'
    );

    // Plan closure targeting packages/core
    const res = planWorkspaceClosure(tmpDir, ['packages/core/src/index.ts']);

    assert.strictEqual(res.isMonorepo, true);
    assert.strictEqual(res.fullCheckoutRequired, false);
    assert.ok(res.requiredPackages.includes('@myorg/core'));
    assert.ok(res.requiredPackages.includes('@myorg/utils'));
    assert.ok(res.targetPaths.includes('packages/core'));
    assert.ok(res.targetPaths.includes('packages/utils'));
  });

  test('handles pnpm-workspace.yaml package definitions', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'pnpm-workspace.yaml'),
      `packages:\n  - 'apps/*'\n  - 'libs/*'\n`,
      'utf-8'
    );

    const appDir = path.join(tmpDir, 'apps', 'web');
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(
      path.join(appDir, 'package.json'),
      JSON.stringify({ name: 'web-app' }),
      'utf-8'
    );

    const res = planWorkspaceClosure(tmpDir, ['apps/web']);
    assert.strictEqual(res.isMonorepo, true);
    assert.ok(res.targetPaths.includes('apps/web'));
  });
});
