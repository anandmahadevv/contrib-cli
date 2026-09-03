import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fetchIssueMetadata } from '../src/services/github.js';
import { createWorkspace } from '../src/services/workspace.js';
import { getApiCacheDir, getGitCacheDir } from '../src/config/index.js';
import { UserError } from '../src/utils/security.js';
import { runGitCommand } from '../src/utils/git.js';

describe('Smart Offline Engine', () => {
  let tmpHome;
  let origContribHome;

  beforeEach(() => {
    origContribHome = process.env.CONTRIB_HOME;
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-offline-test-'));
    process.env.CONTRIB_HOME = tmpHome;
  });

  afterEach(() => {
    if (origContribHome !== undefined) {
      process.env.CONTRIB_HOME = origContribHome;
    } else {
      delete process.env.CONTRIB_HOME;
    }
    try {
      fs.rmSync(tmpHome, { recursive: true, force: true });
    } catch {}
  });

  test('fetchIssueMetadata in offline mode uses cached metadata if present', async () => {
    const apiCache = getApiCacheDir();
    const cacheFile = path.join(apiCache, 'facebook__react__issue_9999.json');
    fs.writeFileSync(
      cacheFile,
      JSON.stringify({
        cached_at: Date.now() - 1000,
        data: {
          title: 'Cached Offline Issue Title',
          body: 'Cached issue description',
          labels: ['bug', 'offline'],
        },
      }),
      'utf-8'
    );

    const meta = await fetchIssueMetadata('facebook/react#9999', { offline: true });
    assert.strictEqual(meta.title, 'Cached Offline Issue Title');
    assert.strictEqual(meta.offline, true);
  });

  test('fetchIssueMetadata in offline mode synthesizes fallback when not cached', async () => {
    const meta = await fetchIssueMetadata('torvalds/linux#12345', { offline: true });
    assert.ok(meta.title.includes('[Offline]'));
    assert.strictEqual(meta.offline, true);
    assert.strictEqual(meta.issue_number, '12345');
  });

  test('createWorkspace throws UserError in offline mode if bare repo not cached', async () => {
    await assert.rejects(async () => {
      await createWorkspace('psf/requests#7777', { offline: true, worktree: true });
    }, UserError);
  });

  test('createWorkspace in offline mode succeeds when bare repo is cached', async () => {
    // 1. Create a dummy bare repository inside git cache dir
    const gitCache = getGitCacheDir();
    const bareRepo = path.join(gitCache, 'sample__repo.git');
    fs.mkdirSync(bareRepo, { recursive: true });
    await runGitCommand(['init', '--bare'], { cwd: bareRepo });

    // Seed bare repo with an initial commit on main
    const tempSeed = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-seed-'));
    try {
      await runGitCommand(['init', '-b', 'main'], { cwd: tempSeed });
      await runGitCommand(['config', 'user.name', 'Tester'], { cwd: tempSeed });
      await runGitCommand(['config', 'user.email', 'tester@test.org'], { cwd: tempSeed });
      fs.writeFileSync(path.join(tempSeed, 'README.md'), '# Offline Sample', 'utf-8');
      await runGitCommand(['add', '.'], { cwd: tempSeed });
      await runGitCommand(['commit', '-m', 'Initial commit'], { cwd: tempSeed });
      await runGitCommand(['remote', 'add', 'origin', bareRepo], { cwd: tempSeed });
      await runGitCommand(['push', 'origin', 'main'], { cwd: tempSeed });
      await runGitCommand(['symbolic-ref', 'HEAD', 'refs/heads/main'], { cwd: bareRepo });
    } finally {
      fs.rmSync(tempSeed, { recursive: true, force: true });
    }

    // 2. Run createWorkspace in offline worktree mode
    const ws = await createWorkspace('sample/repo#101', {
      offline: true,
      worktree: true,
    });

    assert.ok(ws);
    assert.strictEqual(ws.offline, true);
    assert.ok(fs.existsSync(path.join(ws.path, 'README.md')));
    assert.ok(fs.existsSync(path.join(ws.path, '.contrib', 'AI_PROMPT.md')));
  });
});
