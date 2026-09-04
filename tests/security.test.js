import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGitHubUrl,
  sanitizeWorkspaceName,
  isPathInside,
  redactSensitiveOutput,
  SecurityError,
} from '../src/utils/security.js';

describe('Security & Validation', () => {
  test('validates full GitHub issue URL', () => {
    const res = validateGitHubUrl('https://github.com/psf/requests/issues/1234');
    assert.strictEqual(res.owner, 'psf');
    assert.strictEqual(res.repo, 'requests');
    assert.strictEqual(res.issue, '1234');
    assert.strictEqual(res.pr, null);
  });

  test('validates full GitHub pull request URL', () => {
    const res = validateGitHubUrl('https://github.com/torvalds/linux/pull/50');
    assert.strictEqual(res.owner, 'torvalds');
    assert.strictEqual(res.repo, 'linux');
    assert.strictEqual(res.issue, null);
    assert.strictEqual(res.pr, '50');
  });

  test('validates shorthand owner/repo#123 format', () => {
    const res = validateGitHubUrl('facebook/react#12345');
    assert.strictEqual(res.owner, 'facebook');
    assert.strictEqual(res.repo, 'react');
    assert.strictEqual(res.issue, '12345');
  });

  test('validates shorthand owner/repo format', () => {
    const res = validateGitHubUrl('torvalds/linux');
    assert.strictEqual(res.owner, 'torvalds');
    assert.strictEqual(res.repo, 'linux');
    assert.strictEqual(res.issue, null);
  });

  test('rejects malicious or non-github host', () => {
    assert.throws(
      () => validateGitHubUrl('https://evil-site.com/psf/requests/issues/1'),
      SecurityError
    );
  });

  test('rejects insecure http protocol', () => {
    assert.throws(
      () => validateGitHubUrl('http://github.com/psf/requests/issues/1'),
      SecurityError
    );
  });

  test('rejects invalid empty or non-string input', () => {
    assert.throws(() => validateGitHubUrl(''), SecurityError);
    assert.throws(() => validateGitHubUrl(null), SecurityError);
  });

  test('sanitizes workspace names safely', () => {
    assert.strictEqual(
      sanitizeWorkspaceName('psf__requests__issue_1'),
      'psf__requests__issue_1'
    );
    assert.strictEqual(
      sanitizeWorkspaceName('bad/name\\with*chars'),
      'bad_name_with_chars'
    );
  });

  test('rejects directory traversal names', () => {
    assert.throws(() => sanitizeWorkspaceName('..'), SecurityError);
    assert.throws(() => sanitizeWorkspaceName('.'), SecurityError);
    assert.throws(() => sanitizeWorkspaceName(''), SecurityError);
  });

  test('verifies directory containment with isPathInside', () => {
    const parent = 'C:/Users/anand/.contrib/workspaces';
    const child = 'C:/Users/anand/.contrib/workspaces/psf__requests__issue_1';
    const outside = 'C:/Users/anand/Desktop/important_files';

    assert.strictEqual(isPathInside(parent, child), true);
    assert.strictEqual(isPathInside(parent, outside), false);
  });

  test('redacts GitHub personal access tokens and secrets', () => {
    const raw = 'Error authenticating with token ghp_123456789012345678901234567890123456 and fine-grained github_pat_11AAAAAAA0123456789012345678901234567890123456789012345678901234567890123456789012';
    const redacted = redactSensitiveOutput(raw);
    assert.strictEqual(redacted.includes('ghp_1234567890'), false);
    assert.strictEqual(redacted.includes('ghp_***'), true);
    assert.strictEqual(redacted.includes('github_pat_11AAAA'), false);
    assert.strictEqual(redacted.includes('github_pat_***'), true);
  });

  test('redacts authorization headers and embedded git credentials', () => {
    const rawAuth = 'Authorization: Bearer ghp_sampletokenstringlongenoughhere';
    const redactedAuth = redactSensitiveOutput(rawAuth);
    assert.strictEqual(redactedAuth, 'Authorization: Bearer [REDACTED]');

    const rawUrl = 'fatal: could not read from https://user:secretpassword@github.com/org/repo.git';
    const redactedUrl = redactSensitiveOutput(rawUrl);
    assert.strictEqual(redactedUrl, 'fatal: could not read from https://***:***@github.com/org/repo.git');
  });
});
