import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GSOC_ORGANIZATIONS,
  evaluateOrgMatch,
  getRecommendedOrgs,
} from '../src/services/recommend.js';
import { handleRecommend } from '../src/commands/recommend.js';

test('GSOC_ORGANIZATIONS database integrity', () => {
  assert.ok(Array.isArray(GSOC_ORGANIZATIONS));
  assert.ok(GSOC_ORGANIZATIONS.length >= 10);

  GSOC_ORGANIZATIONS.forEach((org) => {
    assert.ok(org.id, 'Org must have id');
    assert.ok(org.name, 'Org must have name');
    assert.ok(Array.isArray(org.languages), 'Org must have languages array');
    assert.ok(Array.isArray(org.domains), 'Org must have domains array');
    assert.ok(org.defaultRepo, 'Org must have defaultRepo');
  });
});

test('evaluateOrgMatch calculates match score correctly', () => {
  const psf = GSOC_ORGANIZATIONS.find((o) => o.id === 'psf');
  assert.ok(psf);

  const match = evaluateOrgMatch(psf, {
    languages: ['python'],
    domains: ['web'],
    level: 'beginner',
  });

  assert.ok(match.matchPercent >= 60);
  assert.ok(match.matchReasons.length > 0);
});

test('getRecommendedOrgs sorts by match percent', () => {
  const recs = getRecommendedOrgs({
    languages: ['python', 'c++'],
    domains: ['ai', 'ml'],
    level: 'beginner',
    limit: 3,
  });

  assert.equal(recs.length, 3);
  assert.ok(recs[0].matchPercent >= recs[1].matchPercent);
  assert.ok(recs[1].matchPercent >= recs[2].matchPercent);
});

test('handleRecommend JSON output', async () => {
  let logs = [];
  const originalLog = console.log;
  console.log = (msg) => logs.push(msg);

  try {
    const exitCode = await handleRecommend({
      lang: 'python',
      domain: 'ai',
      json: true,
    });
    assert.equal(exitCode, 0);
    assert.ok(logs.length > 0);

    const parsed = JSON.parse(logs[0]);
    assert.ok(Array.isArray(parsed));
    assert.equal(parsed.length, 3);
  } finally {
    console.log = originalLog;
  }
});
