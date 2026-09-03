import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  scanContributingGuidelines,
  scanPullRequestTemplate,
  scanLintersAndFormatters,
  generateAiPromptV2,
  extractKeySections,
} from '../src/services/context.js';

describe('Repository Intelligence & AI Context Scanner', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contrib-ctx-test-'));
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  test('extractKeySections parses testing and style headers', () => {
    const markdown = [
      '# Contributing',
      'Intro text.',
      '## Testing Guidelines',
      'Run npm test to run the full test suite.',
      '## Code Style Rules',
      'Use single quotes and 2 spaces indentation.',
      '## Unrelated Section',
      'Random text.',
    ].join('\n');

    const sections = extractKeySections(markdown);
    assert.ok(sections['Testing Guidelines']);
    assert.ok(sections['Testing Guidelines'].includes('Run npm test'));
    assert.ok(sections['Code Style Rules']);
    assert.ok(sections['Code Style Rules'].includes('Use single quotes'));
    assert.strictEqual(sections['Unrelated Section'], undefined);
  });

  test('scanContributingGuidelines finds and parses CONTRIBUTING.md', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'CONTRIBUTING.md'),
      '# Contributing\n## Running Tests\nUse `pytest`.\n## Pull Request Checklist\nEnsure all tests pass.',
      'utf-8'
    );

    const res = scanContributingGuidelines(tmpDir);
    assert.ok(res);
    assert.strictEqual(res.path, 'CONTRIBUTING.md');
    assert.ok(res.sections['Running Tests']);
    assert.ok(res.sections['Pull Request Checklist']);
  });

  test('scanPullRequestTemplate discovers PR templates in .github', () => {
    const ghDir = path.join(tmpDir, '.github');
    fs.mkdirSync(ghDir, { recursive: true });
    fs.writeFileSync(
      path.join(ghDir, 'PULL_REQUEST_TEMPLATE.md'),
      '### Description\nWhat changed?\n- [ ] Added tests\n- [ ] Updated docs',
      'utf-8'
    );

    const res = scanPullRequestTemplate(tmpDir);
    assert.ok(res);
    assert.strictEqual(res.path, '.github/PULL_REQUEST_TEMPLATE.md');
    assert.ok(res.content.includes('- [ ] Added tests'));
  });

  test('scanLintersAndFormatters detects ESLint, Prettier, and package scripts', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        scripts: {
          lint: 'eslint .',
          format: 'prettier --write .',
        },
      }),
      'utf-8'
    );
    fs.writeFileSync(path.join(tmpDir, '.eslintrc.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(tmpDir, '.prettierrc'), '{}', 'utf-8');

    const tools = scanLintersAndFormatters(tmpDir, { type: 'Node.js' });
    assert.strictEqual(tools.length, 2);
    const eslintTool = tools.find((t) => t.tool === 'ESLint');
    const prettierTool = tools.find((t) => t.tool === 'Prettier');
    assert.ok(eslintTool);
    assert.strictEqual(eslintTool.command, 'npm run lint');
    assert.ok(prettierTool);
    assert.strictEqual(prettierTool.command, 'npm run format');
  });

  test('generateAiPromptV2 produces structured markdown with all sections', () => {
    const prompt = generateAiPromptV2({
      meta: {
        issue_number: '500',
        owner: 'sample',
        repo: 'app',
        title: 'Fix edge case crash',
        url: 'https://github.com/sample/app/issues/500',
        body: 'App crashes on startup when config is missing.',
      },
      stack: {
        type: 'Node.js',
        packageManager: 'npm',
        testCommand: 'npm test',
      },
      targetBranch: 'contrib/issue-500',
      focusAreas: ['src/config.js', 'src/app.js'],
      contributing: {
        path: 'CONTRIBUTING.md',
        excerpt: 'Follow semantic commits.',
        sections: {
          'Code Style': 'Always run prettier.',
        },
      },
      prTemplate: {
        path: '.github/PULL_REQUEST_TEMPLATE.md',
        content: '- [ ] Tests added',
      },
      qualityTools: [
        { tool: 'ESLint', type: 'linter', command: 'npm run lint', config: '.eslintrc.json' },
      ],
    });

    assert.ok(prompt.includes('# AI Agent Instructions for Issue #500'));
    assert.ok(prompt.includes('Fix edge case crash'));
    assert.ok(prompt.includes('`src/config.js`'));
    assert.ok(prompt.includes('## 4. Repository Guidelines (CONTRIBUTING.md)'));
    assert.ok(prompt.includes('Always run prettier.'));
    assert.ok(prompt.includes('## 5. Quality Standards & Linters'));
    assert.ok(prompt.includes('**ESLint** (linter): `npm run lint`'));
    assert.ok(prompt.includes('Run primary test suite: `npm test`'));
    assert.ok(prompt.includes('## 7. Pull Request Checklist'));
    assert.ok(prompt.includes('- [ ] Tests added'));
  });
});
