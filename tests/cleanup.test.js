import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { deleteWorkspace, listWorkspaces } from '../src/services/workspace.js';
import { saveRegistry, loadRegistry, getWorkspacesDir } from '../src/config/index.js';
import { SecurityError, UserError } from '../src/utils/security.js';

describe('Cleanup & Safe Deletion', () => {
  let tmpDir;
  let originalEnv;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-cleanup-test-'));
    originalEnv = process.env.CONTRIB_HOME;
    process.env.CONTRIB_HOME = tmpDir;
  });

  afterEach(() => {
    process.env.CONTRIB_HOME = originalEnv;
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  test('safely deletes workspace within workspaces root and removes registry entry', async () => {
    const wsDir = getWorkspacesDir();
    const targetWs = path.join(wsDir, 'test_org__repo__issue_1');
    fs.mkdirSync(targetWs, { recursive: true });
    fs.writeFileSync(path.join(targetWs, 'code.js'), 'console.log(1);');

    saveRegistry({
      test_org__repo__issue_1: {
        id: 'test_org__repo__issue_1',
        owner: 'test_org',
        repo: 'repo',
        issue_number: '1',
        path: targetWs,
      },
    });

    const result = await deleteWorkspace('test_org__repo__issue_1');
    assert.strictEqual(result.deleted, true);
    assert.strictEqual(fs.existsSync(targetWs), false);

    const registry = loadRegistry();
    assert.strictEqual(registry.test_org__repo__issue_1, undefined);
  });

  test('throws UserError if workspace does not exist in registry', async () => {
    await assert.rejects(
      async () => await deleteWorkspace('non_existent_workspace'),
      UserError
    );
  });

  test('blocks deletion if workspace path points outside workspaces root', async () => {
    const outsideDir = path.join(tmpDir, 'important_user_folder');
    fs.mkdirSync(outsideDir, { recursive: true });
    fs.writeFileSync(path.join(outsideDir, 'important.txt'), 'do not delete');

    saveRegistry({
      malicious_ws: {
        id: 'malicious_ws',
        owner: 'bad',
        repo: 'repo',
        path: outsideDir,
      },
    });

    await assert.rejects(
      async () => await deleteWorkspace('malicious_ws'),
      SecurityError
    );

    // Assert file was NOT deleted
    assert.strictEqual(fs.existsSync(path.join(outsideDir, 'important.txt')), true);
  });

  test('blocks deletion of workspace with uncommitted changes unless force=true', async () => {
    const wsDir = getWorkspacesDir();
    const targetWs = path.join(wsDir, 'test_org__repo__issue_dirty');
    fs.mkdirSync(targetWs, { recursive: true });

    // Initialize mock git repo
    const { execSync } = await import('node:child_process');
    try {
      execSync('git init', { cwd: targetWs, stdio: 'pipe' });
      execSync('git config user.name "Tester"', { cwd: targetWs, stdio: 'pipe' });
      execSync('git config user.email "test@test.com"', { cwd: targetWs, stdio: 'pipe' });
      fs.writeFileSync(path.join(targetWs, 'initial.txt'), 'clean');
      execSync('git add . && git commit -m "init"', { cwd: targetWs, stdio: 'pipe' });

      // Create dirty uncommitted file
      fs.writeFileSync(path.join(targetWs, 'uncommitted.js'), 'const dirty = 1;');

      saveRegistry({
        test_org__repo__issue_dirty: {
          id: 'test_org__repo__issue_dirty',
          owner: 'test_org',
          repo: 'repo',
          issue_number: 'dirty',
          path: targetWs,
        },
      });

      // Attempt deletion without force should fail
      await assert.rejects(
        async () => await deleteWorkspace('test_org__repo__issue_dirty'),
        /uncommitted or untracked changes/
      );

      // Attempt deletion with force should succeed
      const result = await deleteWorkspace('test_org__repo__issue_dirty', { force: true });
      assert.strictEqual(result.deleted, true);
      assert.strictEqual(fs.existsSync(targetWs), false);
    } catch (e) {
      if (e.message && e.message.includes('Git executable')) {
        // If git is not installed in test runner, skip
        return;
      }
      throw e;
    }
  });
});

