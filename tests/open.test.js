import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { handleOpen } from '../src/commands/open.js';
import {
  isCommandAvailable,
  detectDefaultEditor,
  openInBrowser,
  openInEditor,
  resolveRequestedEditor,
  resolveEditorBinary,
  EDITOR_CANDIDATES,
} from '../src/utils/opener.js';
import { saveRegistry } from '../src/config/index.js';
import { SecurityError, UserError } from '../src/utils/security.js';

describe('Opener Utilities', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = {
      VISUAL: process.env.VISUAL,
      EDITOR: process.env.EDITOR,
    };
  });

  afterEach(() => {
    if (originalEnv.VISUAL !== undefined) {
      process.env.VISUAL = originalEnv.VISUAL;
    } else {
      delete process.env.VISUAL;
    }
    if (originalEnv.EDITOR !== undefined) {
      process.env.EDITOR = originalEnv.EDITOR;
    } else {
      delete process.env.EDITOR;
    }
  });

  test('isCommandAvailable detects existing binary like node', () => {
    assert.strictEqual(isCommandAvailable('node'), true);
  });

  test('isCommandAvailable returns false for non-existent binary', () => {
    assert.strictEqual(isCommandAvailable('non_existent_binary_xyz_12345'), false);
  });

  test('isCommandAvailable returns false for invalid or shell-unsafe command names', () => {
    assert.strictEqual(isCommandAvailable('node && evil'), false);
    assert.strictEqual(isCommandAvailable(''), false);
    assert.strictEqual(isCommandAvailable(null), false);
  });

  test('detectDefaultEditor respects VISUAL environment variable if valid', () => {
    process.env.VISUAL = 'node';
    assert.strictEqual(detectDefaultEditor(), 'node');
  });

  test('detectDefaultEditor respects EDITOR environment variable if VISUAL is empty', () => {
    delete process.env.VISUAL;
    process.env.EDITOR = 'node';
    assert.strictEqual(detectDefaultEditor(), 'node');
  });

  test('openInBrowser validates URLs and rejects non-http/https protocols', async () => {
    await assert.rejects(async () => {
      await openInBrowser('javascript:alert(1)');
    }, SecurityError);

    await assert.rejects(async () => {
      await openInBrowser('file:///etc/passwd');
    }, SecurityError);

    await assert.rejects(async () => {
      await openInBrowser('');
    }, SecurityError);
  });

  test('openInEditor throws UserError when target path does not exist', async () => {
    await assert.rejects(async () => {
      await openInEditor('/path/to/nonexistent/workspace/12345', 'code');
    }, UserError);
  });

  test('resolveEditorBinary resolves candidate array and fallback', () => {
    assert.strictEqual(resolveEditorBinary('code'), EDITOR_CANDIDATES.code.includes(resolveEditorBinary('code')) ? resolveEditorBinary('code') : 'code');
    assert.ok(EDITOR_CANDIDATES.nvim.includes(resolveEditorBinary('nvim')));
    assert.ok(EDITOR_CANDIDATES.idea.includes(resolveEditorBinary('idea')));
    assert.strictEqual(resolveEditorBinary('custom_unknown_ed'), 'custom_unknown_ed');
  });

  test('resolveRequestedEditor resolves flags for Neovim, Vim, Helix, Zed, JetBrains, and Sublime', () => {
    assert.ok(EDITOR_CANDIDATES.nvim.includes(resolveRequestedEditor({ nvim: true })));
    assert.ok(EDITOR_CANDIDATES.vim.includes(resolveRequestedEditor({ vim: true })));
    assert.ok(EDITOR_CANDIDATES.helix.includes(resolveRequestedEditor({ helix: true })));
    assert.ok(EDITOR_CANDIDATES.helix.includes(resolveRequestedEditor({ hx: true })));
    assert.ok(EDITOR_CANDIDATES.zed.includes(resolveRequestedEditor({ zed: true })));
    assert.ok(EDITOR_CANDIDATES.idea.includes(resolveRequestedEditor({ idea: true })));
    assert.ok(EDITOR_CANDIDATES.pycharm.includes(resolveRequestedEditor({ pycharm: true })));
    assert.ok(EDITOR_CANDIDATES.webstorm.includes(resolveRequestedEditor({ webstorm: true })));
    assert.ok(EDITOR_CANDIDATES.sublime.includes(resolveRequestedEditor({ subl: true })));
    assert.ok(EDITOR_CANDIDATES.sublime.includes(resolveRequestedEditor({ sublime: true })));
    assert.strictEqual(resolveRequestedEditor({ editor: 'nano' }), 'nano');
    assert.strictEqual(resolveRequestedEditor({}), null);
  });
});

describe('Open Command Handler', () => {
  let tmpDir;
  let originalContribHome;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-open-test-'));
    originalContribHome = process.env.CONTRIB_HOME;
    process.env.CONTRIB_HOME = tmpDir;
  });

  afterEach(() => {
    process.env.CONTRIB_HOME = originalContribHome;
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  test('handleOpen --print outputs workspace path and exits 0', async () => {
    const wsPath = path.join(tmpDir, 'workspaces', 'test_ws');
    fs.mkdirSync(wsPath, { recursive: true });

    saveRegistry({
      test_ws: {
        id: 'test_ws',
        owner: 'sample',
        repo: 'project',
        issue_number: '100',
        branch: 'contrib/issue-100',
        path: wsPath,
        url: 'https://github.com/sample/project/issues/100',
      },
    });

    let stdoutData = '';
    const origWrite = process.stdout.write;
    process.stdout.write = (chunk) => {
      stdoutData += chunk;
      return true;
    };

    try {
      const code = await handleOpen('test_ws', { print: true });
      assert.strictEqual(code, 0);
      assert.strictEqual(stdoutData.trim(), wsPath);
    } finally {
      process.stdout.write = origWrite;
    }
  });

  test('handleOpen auto-selects workspace when only 1 active workspace exists', async () => {
    const wsPath = path.join(tmpDir, 'workspaces', 'single_ws');
    fs.mkdirSync(wsPath, { recursive: true });

    saveRegistry({
      single_ws: {
        id: 'single_ws',
        owner: 'sample',
        repo: 'project',
        issue_number: '200',
        branch: 'contrib/issue-200',
        path: wsPath,
        url: 'https://github.com/sample/project/issues/200',
      },
    });

    let stdoutData = '';
    const origWrite = process.stdout.write;
    process.stdout.write = (chunk) => {
      stdoutData += chunk;
      return true;
    };

    try {
      const code = await handleOpen(undefined, { print: true });
      assert.strictEqual(code, 0);
      assert.strictEqual(stdoutData.trim(), wsPath);
    } finally {
      process.stdout.write = origWrite;
    }
  });

  test('handleOpen returns 1 when requested workspace does not exist', async () => {
    saveRegistry({});
    const code = await handleOpen('non_existent', {});
    assert.strictEqual(code, 1);
  });

  test('handleOpen returns 1 when workspace path does not exist on disk', async () => {
    saveRegistry({
      missing_disk_ws: {
        id: 'missing_disk_ws',
        owner: 'sample',
        repo: 'project',
        path: path.join(tmpDir, 'does_not_exist_on_disk'),
      },
    });

    const code = await handleOpen('missing_disk_ws', {});
    assert.strictEqual(code, 1);
  });

  test('handleOpen returns 1 when multiple workspaces exist and none is specified', async () => {
    const ws1 = path.join(tmpDir, 'workspaces', 'ws1');
    const ws2 = path.join(tmpDir, 'workspaces', 'ws2');
    fs.mkdirSync(ws1, { recursive: true });
    fs.mkdirSync(ws2, { recursive: true });

    saveRegistry({
      ws1: { id: 'ws1', owner: 'org', repo: 'repo1', path: ws1, branch: 'b1' },
      ws2: { id: 'ws2', owner: 'org', repo: 'repo2', path: ws2, branch: 'b2' },
    });

    const code = await handleOpen(undefined, {});
    assert.strictEqual(code, 1);
  });

  test('handleOpen accepts --antigravity, --agy, and --ide options', async () => {
    const wsPath = path.join(tmpDir, 'workspaces', 'ide_ws');
    fs.mkdirSync(wsPath, { recursive: true });

    saveRegistry({
      ide_ws: {
        id: 'ide_ws',
        owner: 'sample',
        repo: 'project',
        path: wsPath,
        branch: 'main',
      },
    });

    // With print flag to avoid launching external GUI
    const codeAgy = await handleOpen('ide_ws', { antigravity: true, print: true });
    assert.strictEqual(codeAgy, 0);

    const codeIde = await handleOpen('ide_ws', { ide: true, print: true });
    assert.strictEqual(codeIde, 0);

    const codeAgyShort = await handleOpen('ide_ws', { agy: true, print: true });
    assert.strictEqual(codeAgyShort, 0);

    // Multi-IDE flags with print flag to avoid external spawning
    const flags = ['nvim', 'vim', 'helix', 'hx', 'zed', 'idea', 'pycharm', 'webstorm', 'subl', 'sublime'];
    for (const flag of flags) {
      const res = await handleOpen('ide_ws', { [flag]: true, print: true });
      assert.strictEqual(res, 0, `handleOpen failed for flag --${flag}`);
    }
  });
});
