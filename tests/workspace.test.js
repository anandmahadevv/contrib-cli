import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  listWorkspaces,
  getWorkspace,
  analyzeIssue,
} from '../src/services/workspace.js';
import { saveRegistry } from '../src/config/index.js';

describe('Workspace Service', () => {
  let tmpDir;
  let originalEnv;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-ws-test-'));
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

  test('listWorkspaces returns all tracked workspaces with disk info', () => {
    const wsPath = path.join(tmpDir, 'workspaces', 'test_ws');
    fs.mkdirSync(wsPath, { recursive: true });
    fs.writeFileSync(path.join(wsPath, 'sample.txt'), 'hello world');

    saveRegistry({
      test_ws: {
        id: 'test_ws',
        owner: 'testorg',
        repo: 'testrepo',
        issue_number: '42',
        branch: 'contrib/issue-42',
        path: wsPath,
      },
    });

    const workspaces = listWorkspaces();
    assert.strictEqual(workspaces.length, 1);
    assert.strictEqual(workspaces[0].id, 'test_ws');
    assert.strictEqual(workspaces[0].existsOnDisk, true);
    assert.ok(workspaces[0].sizeBytes > 0);
  });

  test('getWorkspace retrieves workspace by id, url, or owner/repo', () => {
    saveRegistry({
      sample_id: {
        id: 'sample_id',
        url: 'https://github.com/myorg/myrepo/issues/99',
        owner: 'myorg',
        repo: 'myrepo',
        issue_number: '99',
      },
    });

    assert.ok(getWorkspace('sample_id'));
    assert.ok(getWorkspace('https://github.com/myorg/myrepo/issues/99'));
    assert.ok(getWorkspace('myorg/myrepo'));
    assert.ok(getWorkspace('myorg/myrepo#99'));
    assert.strictEqual(getWorkspace('nonexistent'), null);
  });

  test('analyzeIssue parses file references and paths from issue content', async () => {
    const analysis = await analyzeIssue('https://github.com/psf/requests/issues/6000');
    assert.ok(analysis.metadata);
    assert.ok(Array.isArray(analysis.suggested_focus_areas));
  });
});
