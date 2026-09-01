import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  getContribHome,
  getWorkspacesDir,
  getRegistryFile,
  loadRegistry,
  saveRegistry,
  removeRegistryEntry,
} from '../src/config/index.js';

describe('Config and Registry Persistence', () => {
  let tmpDir;
  let originalEnv;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-test-'));
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

  test('respects CONTRIB_HOME environment variable', () => {
    assert.strictEqual(path.resolve(getContribHome()), path.resolve(tmpDir));
    assert.strictEqual(
      path.resolve(getWorkspacesDir()),
      path.resolve(path.join(tmpDir, 'workspaces'))
    );
  });

  test('loads empty registry when file does not exist', () => {
    const reg = loadRegistry();
    assert.deepStrictEqual(reg, {});
  });

  test('saves and loads registry atomically', () => {
    const data = {
      'test-id': {
        id: 'test-id',
        owner: 'test',
        repo: 'repo',
        status: 'active',
      },
    };
    saveRegistry(data);
    const loaded = loadRegistry();
    assert.deepStrictEqual(loaded, data);
  });

  test('removes registry entry properly', () => {
    const data = {
      ws1: { id: 'ws1', repo: 'r1' },
      ws2: { id: 'ws2', repo: 'r2' },
    };
    saveRegistry(data);
    removeRegistryEntry('ws1');

    const loaded = loadRegistry();
    assert.strictEqual(loaded.ws1, undefined);
    assert.strictEqual(loaded.ws2.id, 'ws2');
  });
});
