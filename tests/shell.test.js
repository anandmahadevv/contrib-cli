import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  detectShell,
  getShellIntegrationScript,
  getShellConfigFile,
  handleShellInit,
  handleAlias,
} from '../src/commands/shell.js';

describe('Shell Integration', () => {
  test('detectShell parses explicit shell strings correctly', () => {
    assert.strictEqual(detectShell('zsh'), 'zsh');
    assert.strictEqual(detectShell('bash'), 'bash');
    assert.strictEqual(detectShell('fish'), 'fish');
    assert.strictEqual(detectShell('powershell'), 'powershell');
    assert.strictEqual(detectShell('pwsh'), 'powershell');
    assert.strictEqual(detectShell('ps'), 'powershell');
  });

  test('getShellIntegrationScript generates valid script for zsh and bash', () => {
    const zshScript = getShellIntegrationScript('zsh');
    assert.ok(zshScript.includes('gcd() {'));
    assert.ok(zshScript.includes('contrib open'));
    assert.ok(zshScript.includes('complete -F _contrib_complete gcd'));

    const bashScript = getShellIntegrationScript('bash');
    assert.ok(bashScript.includes('gcd() {'));
  });

  test('getShellIntegrationScript generates valid script for fish', () => {
    const fishScript = getShellIntegrationScript('fish');
    assert.ok(fishScript.includes('function gcd'));
    assert.ok(fishScript.includes('complete -c gcd'));
  });

  test('getShellIntegrationScript generates valid script for powershell', () => {
    const psScript = getShellIntegrationScript('powershell');
    assert.ok(psScript.includes('function gcd {'));
    assert.ok(psScript.includes('Set-Location'));
    assert.ok(psScript.includes('Register-ArgumentCompleter'));
  });

  test('getShellConfigFile returns valid file path per shell', () => {
    assert.ok(getShellConfigFile('zsh').endsWith('.zshrc'));
    assert.ok(getShellConfigFile('bash').endsWith('.bashrc'));
    assert.ok(getShellConfigFile('fish').includes('config.fish'));
    assert.ok(getShellConfigFile('powershell').includes('profile.ps1'));
  });

  test('handleShellInit writes script to stdout and exits 0', async () => {
    let captured = '';
    const origWrite = process.stdout.write;
    process.stdout.write = (chunk) => {
      captured += chunk;
      return true;
    };
    try {
      const code = await handleShellInit('bash');
      assert.strictEqual(code, 0);
      assert.ok(captured.includes('gcd()'));
    } finally {
      process.stdout.write = origWrite;
    }
  });

  test('handleAlias displays guidance when not installing', async () => {
    const code = await handleAlias({ shell: 'bash' });
    assert.strictEqual(code, 0);
  });
});
