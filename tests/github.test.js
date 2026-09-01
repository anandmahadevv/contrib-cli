import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { fetchIssueMetadata, checkGitHubAuth } from '../src/services/github.js';
import { getGitHubToken, maskToken } from '../src/utils/env.js';

describe('GitHub Service & Auth', () => {
  test('fetchIssueMetadata returns default metadata structure for valid issue URL', async () => {
    const meta = await fetchIssueMetadata('https://github.com/psf/requests/issues/6000');
    assert.strictEqual(meta.owner, 'psf');
    assert.strictEqual(meta.repo, 'requests');
    assert.strictEqual(meta.issue_number, '6000');
    assert.strictEqual(meta.clone_url, 'https://github.com/psf/requests.git');
    assert.ok(typeof meta.title === 'string');
  });

  test('fetchIssueMetadata works with shorthand owner/repo', async () => {
    const meta = await fetchIssueMetadata('psf/requests');
    assert.strictEqual(meta.owner, 'psf');
    assert.strictEqual(meta.repo, 'requests');
    assert.strictEqual(meta.issue_number, null);
    assert.strictEqual(meta.clone_url, 'https://github.com/psf/requests.git');
  });

  test('checkGitHubAuth returns status object with rate limits', async () => {
    const status = await checkGitHubAuth();
    assert.ok(typeof status.authenticated === 'boolean');
    assert.ok(typeof status.remaining === 'number');
    assert.ok(typeof status.limit === 'number');
  });

  test('maskToken masks secret tokens properly', () => {
    assert.strictEqual(maskToken('ghp_abcdefghijklmnop1234'), 'ghp_...1234');
    assert.strictEqual(maskToken('short'), '****');
    assert.strictEqual(maskToken(''), '****');
  });
});
