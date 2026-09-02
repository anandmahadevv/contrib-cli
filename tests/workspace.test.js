import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  listWorkspaces,
  getWorkspace,
  analyzeIssue,
  writeWorkspaceContextFiles,
} from '../src/services/workspace.js';
import { detectProjectStack } from '../src/utils/git.js';
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

  test('writeWorkspaceContextFiles creates .contrib/ISSUE.md and .contrib/context.json', () => {
    const wsPath = path.join(tmpDir, 'workspaces', 'test_context_ws');
    fs.mkdirSync(wsPath, { recursive: true });

    const meta = {
      owner: 'example',
      repo: 'project',
      issue_number: '123',
      url: 'https://github.com/example/project/issues/123',
      title: 'Fix parsing bug in header parser',
      body: 'Here is how to reproduce the bug: look at src/parser.js',
      author: 'contributor1',
      labels: ['bug', 'good first issue'],
      state: 'open',
    };

    writeWorkspaceContextFiles(wsPath, meta, 'contrib/issue-123', ['src/parser.js'], {
      type: 'Node.js / JavaScript',
      packageManager: 'npm',
      testCommand: 'npm test',
    });

    const issueMdPath = path.join(wsPath, '.contrib', 'ISSUE.md');
    const aiPromptPath = path.join(wsPath, '.contrib', 'AI_PROMPT.md');
    const contextJsonPath = path.join(wsPath, '.contrib', 'context.json');

    assert.strictEqual(fs.existsSync(issueMdPath), true);
    assert.strictEqual(fs.existsSync(aiPromptPath), true);
    assert.strictEqual(fs.existsSync(contextJsonPath), true);

    const issueMd = fs.readFileSync(issueMdPath, 'utf-8');
    assert.ok(issueMd.includes('Fix parsing bug in header parser'));
    assert.ok(issueMd.includes('src/parser.js'));
    assert.ok(issueMd.includes('npm test'));

    const aiPrompt = fs.readFileSync(aiPromptPath, 'utf-8');
    assert.ok(aiPrompt.includes('AI Agent Instructions for Issue #123'));
    assert.ok(aiPrompt.includes('Fix parsing bug in header parser'));

    const contextJson = JSON.parse(fs.readFileSync(contextJsonPath, 'utf-8'));
    assert.strictEqual(contextJson.issue_number, '123');
    assert.strictEqual(contextJson.repository, 'example/project');
  });

  test('detectProjectStack identifies Node, Python, and Rust repositories', () => {
    const nodeDir = path.join(tmpDir, 'node_project');
    fs.mkdirSync(nodeDir, { recursive: true });
    fs.writeFileSync(
      path.join(nodeDir, 'package.json'),
      JSON.stringify({ name: 'test-node', scripts: { test: 'vitest run' } })
    );

    const nodeStack = detectProjectStack(nodeDir);
    assert.strictEqual(nodeStack.type, 'Node.js / JavaScript');
    assert.strictEqual(nodeStack.testCommand, 'npm test');

    const pyDir = path.join(tmpDir, 'py_project');
    fs.mkdirSync(pyDir, { recursive: true });
    fs.writeFileSync(path.join(pyDir, 'requirements.txt'), 'pytest>=7.0\n');

    const pyStack = detectProjectStack(pyDir);
    assert.strictEqual(pyStack.type, 'Python');
    assert.strictEqual(pyStack.testCommand, 'pytest');
  });
});


