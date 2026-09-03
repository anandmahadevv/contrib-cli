import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { runCli } from '../src/cli.js';

describe('CLI Entry Point', () => {
  test('prints version with --version', async () => {
    let output = '';
    const origWrite = process.stdout.write;
    process.stdout.write = (chunk) => {
      output += chunk;
      return true;
    };
    try {
      const code = await runCli(['node', 'contrib', '--version']);
      assert.strictEqual(code, 0);
      assert.match(output, /gsoc-contrib 0\.4\.0/);
    } finally {
      process.stdout.write = origWrite;
    }
  });

  test('prints help with --help', async () => {
    let output = '';
    const origWrite = process.stdout.write;
    process.stdout.write = (chunk) => {
      output += chunk;
      return true;
    };
    try {
      const code = await runCli(['node', 'contrib', '--help']);
      assert.strictEqual(code, 0);
      assert.match(output, /Lightweight GitHub contribution workspace manager/);
      assert.match(output, /start/);
      assert.match(output, /contribute/);
      assert.match(output, /analyze/);
      assert.match(output, /status/);
      assert.match(output, /cleanup/);
      assert.match(output, /open/);
      assert.match(output, /search/);
      assert.match(output, /init/);
    } finally {
      process.stdout.write = origWrite;
    }
  });

  test('shows help when no arguments provided', async () => {
    let output = '';
    const origWrite = process.stdout.write;
    process.stdout.write = (chunk) => {
      output += chunk;
      return true;
    };
    try {
      const code = await runCli(['node', 'contrib']);
      assert.strictEqual(code, 0);
      assert.match(output, /Usage: contrib/);
    } finally {
      process.stdout.write = origWrite;
    }
  });

  test('handles invalid command gracefully with non-zero exit code', async () => {
    const code = await runCli(['node', 'contrib', 'nonexistent-command']);
    assert.strictEqual(code, 2);
  });

  test('handles invalid start URL with non-zero exit code and no stack trace', async () => {
    const code = await runCli(['node', 'contrib', 'start', 'https://invalidsite.com/bad/repo']);
    assert.strictEqual(code, 1);
  });

  test('runs init command successfully', async () => {
    const code = await runCli(['node', 'contrib', 'init']);
    assert.strictEqual(code, 0);
  });

  test('runs status command successfully', async () => {
    const code = await runCli(['node', 'contrib', 'status']);
    assert.strictEqual(code, 0);
  });

  test('runs doctor command successfully', async () => {
    const code = await runCli(['node', 'contrib', 'doctor']);
    assert.strictEqual(code, 0);
  });

  test('runs stats command successfully', async () => {
    const code = await runCli(['node', 'contrib', 'stats']);
    assert.strictEqual(code, 0);
  });

  test('runs stats command with --markdown and --json', async () => {
    const codeMd = await runCli(['node', 'contrib', 'stats', '--markdown']);
    assert.strictEqual(codeMd, 0);
    const codeJson = await runCli(['node', 'contrib', 'stats', '--json']);
    assert.strictEqual(codeJson, 0);
  });

  test('submit exits gracefully when no workspace provided or active', async () => {
    const code = await runCli(['node', 'contrib', 'submit', 'non_existent_ws']);
    assert.strictEqual(code, 1);
  });

  test('sync exits gracefully when no workspace provided or active', async () => {
    const code = await runCli(['node', 'contrib', 'sync', 'non_existent_ws']);
    assert.strictEqual(code, 1);
  });

  test('diff exits gracefully when no workspace provided or active', async () => {
    const code = await runCli(['node', 'contrib', 'diff', 'non_existent_ws']);
    assert.strictEqual(code, 1);
  });

  test('setup exits gracefully when no workspace provided or active', async () => {
    const code = await runCli(['node', 'contrib', 'setup', 'non_existent_ws']);
    assert.strictEqual(code, 1);
  });

  test('open exits gracefully when no workspace provided or active', async () => {
    const code = await runCli(['node', 'contrib', 'open', 'non_existent_ws']);
    assert.strictEqual(code, 1);
  });

  test('runs shell-init command successfully for bash and powershell', async () => {
    const codeBash = await runCli(['node', 'contrib', 'shell-init', 'bash']);
    assert.strictEqual(codeBash, 0);

    const codePs = await runCli(['node', 'contrib', 'shell-init', 'powershell']);
    assert.strictEqual(codePs, 0);
  });

  test('runs alias command successfully', async () => {
    const code = await runCli(['node', 'contrib', 'alias']);
    assert.strictEqual(code, 0);
  });

  test('runs status with --ids flag', async () => {
    const code = await runCli(['node', 'contrib', 'status', '--ids']);
    assert.strictEqual(code, 0);
  });

  test('runs identity list and add commands successfully', async () => {
    const codeList = await runCli(['node', 'contrib', 'identity', 'list']);
    assert.strictEqual(codeList, 0);

    const codeAdd = await runCli([
      'node',
      'contrib',
      'identity',
      'add',
      'work-cli',
      '--name',
      'Work User',
      '--email',
      'work@corp.com',
    ]);
    assert.strictEqual(codeAdd, 0);
  });

  test('runs dashboard command in non-TTY environment gracefully', async () => {
    const code = await runCli(['node', 'contrib', 'dashboard']);
    assert.strictEqual(code, 0);
  });
});


