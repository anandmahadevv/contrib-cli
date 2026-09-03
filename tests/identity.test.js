import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  loadIdentities,
  saveIdentities,
  getIdentity,
  setIdentity,
  removeIdentity,
  getContribHome,
} from '../src/config/index.js';
import { applyIdentityToWorkspace } from '../src/services/identity.js';
import { handleIdentity } from '../src/commands/identity.js';
import { runGitCommand } from '../src/utils/git.js';

describe('Git & SSH Identity Manager', () => {
  let tmpHome;
  let origContribHome;
  let tmpWs;

  beforeEach(async () => {
    origContribHome = process.env.CONTRIB_HOME;
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-id-test-'));
    process.env.CONTRIB_HOME = tmpHome;

    tmpWs = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-id-ws-'));
    // Initialize a git repo in tmpWs
    await runGitCommand(['init'], { cwd: tmpWs });
  });

  afterEach(() => {
    if (origContribHome !== undefined) {
      process.env.CONTRIB_HOME = origContribHome;
    } else {
      delete process.env.CONTRIB_HOME;
    }
    try {
      fs.rmSync(tmpHome, { recursive: true, force: true });
      fs.rmSync(tmpWs, { recursive: true, force: true });
    } catch {}
  });

  test('setIdentity, getIdentity, and loadIdentities manage identities', () => {
    assert.deepStrictEqual(loadIdentities(), {});

    const saved = setIdentity('personal', {
      name: 'Anand Dev',
      email: 'anand@personal.me',
      sshHost: 'github-personal',
    });

    assert.strictEqual(saved.id, 'personal');
    assert.strictEqual(saved.name, 'Anand Dev');
    assert.strictEqual(saved.email, 'anand@personal.me');
    assert.strictEqual(saved.sshHost, 'github-personal');

    const fetched = getIdentity('personal');
    assert.ok(fetched);
    assert.strictEqual(fetched.name, 'Anand Dev');

    const all = loadIdentities();
    assert.ok(all.personal);

    const removed = removeIdentity('personal');
    assert.strictEqual(removed, true);
    assert.strictEqual(getIdentity('personal'), null);
  });

  test('applyIdentityToWorkspace configures user.name and user.email in git workspace', async () => {
    setIdentity('work', {
      name: 'Enterprise Contributor',
      email: 'work@corp.com',
    });

    const applied = await applyIdentityToWorkspace(tmpWs, 'work');
    assert.strictEqual(applied.name, 'Enterprise Contributor');

    const { stdout: nameOut } = await runGitCommand(['config', 'user.name'], { cwd: tmpWs });
    assert.strictEqual(nameOut.trim(), 'Enterprise Contributor');

    const { stdout: emailOut } = await runGitCommand(['config', 'user.email'], { cwd: tmpWs });
    assert.strictEqual(emailOut.trim(), 'work@corp.com');
  });

  test('applyIdentityToWorkspace rewrites github.com remotes to custom sshHost', async () => {
    // Add dummy origin remote
    await runGitCommand(['remote', 'add', 'origin', 'git@github.com:sample/repo.git'], { cwd: tmpWs });

    await applyIdentityToWorkspace(tmpWs, {
      name: 'SSH Dev',
      email: 'ssh@dev.org',
      sshHost: 'github-personal',
    });

    const { stdout: remoteUrl } = await runGitCommand(['remote', 'get-url', 'origin'], { cwd: tmpWs });
    assert.strictEqual(remoteUrl.trim(), 'git@github-personal:sample/repo.git');
  });

  test('handleIdentity list, add, and remove command workflows', async () => {
    // List when empty
    const codeListEmpty = await handleIdentity('list');
    assert.strictEqual(codeListEmpty, 0);

    // Add identity
    const codeAdd = await handleIdentity('add', 'test-id', {
      name: 'Test Name',
      email: 'test@example.com',
    });
    assert.strictEqual(codeAdd, 0);

    const idObj = getIdentity('test-id');
    assert.ok(idObj);
    assert.strictEqual(idObj.email, 'test@example.com');

    // Remove identity
    const codeRm = await handleIdentity('remove', 'test-id');
    assert.strictEqual(codeRm, 0);
    assert.strictEqual(getIdentity('test-id'), null);
  });
});
