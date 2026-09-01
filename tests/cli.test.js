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
      assert.match(output, /gsoc-contrib 0\.1\.1/);
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
});
