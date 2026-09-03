/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Repository intelligence and AI context scanner.
 * Scans repository files for contributing guidelines, style guides,
 * PR templates, linters, formatters, and test commands.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Scan repository for contributing documentation.
 * @param {string} repoPath
 * @returns {{ path: string, excerpt: string, sections: Record<string, string> } | null}
 */
export function scanContributingGuidelines(repoPath) {
  const candidateFiles = [
    'CONTRIBUTING.md',
    '.github/CONTRIBUTING.md',
    '.github/contributing.md',
    'contributing.md',
    'docs/CONTRIBUTING.md',
    'DEVELOPMENT.md',
    'development.md',
    '.github/DEVELOPMENT.md',
    'HACKING.md',
  ];

  for (const rel of candidateFiles) {
    const fullPath = path.join(repoPath, rel);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const sections = extractKeySections(content);
        const excerpt = content.slice(0, 1500).trim();
        return {
          path: rel,
          excerpt,
          sections,
        };
      } catch {
        // ignore read error
      }
    }
  }

  return null;
}

/**
 * Extract sections from markdown by matching common contribution headers.
 * @param {string} markdown
 * @returns {Record<string, string>}
 */
export function extractKeySections(markdown) {
  const sections = {};
  const lines = markdown.split(/\r?\n/);

  let currentHeader = null;
  let currentLines = [];

  const flush = () => {
    if (currentHeader && currentLines.length > 0) {
      const text = currentLines.join('\n').trim();
      if (text.length > 0) {
        sections[currentHeader] = text.slice(0, 1500);
      }
    }
  };

  const headerRegex = /^(#{1,4})\s+(.+)$/;
  const targetKeywords = /(test|testing|style|format|lint|pull\s*request|pr|branch|commit|guideline)/i;

  for (const line of lines) {
    const match = line.match(headerRegex);
    if (match) {
      flush();
      const title = match[2].trim();
      if (targetKeywords.test(title)) {
        currentHeader = title;
        currentLines = [];
      } else {
        currentHeader = null;
        currentLines = [];
      }
    } else if (currentHeader) {
      currentLines.push(line);
    }
  }
  flush();

  return sections;
}

/**
 * Scan repository for Pull Request templates.
 * @param {string} repoPath
 * @returns {{ path: string, content: string } | null}
 */
export function scanPullRequestTemplate(repoPath) {
  const candidateFiles = [
    '.github/PULL_REQUEST_TEMPLATE.md',
    '.github/pull_request_template.md',
    'PULL_REQUEST_TEMPLATE.md',
    'pull_request_template.md',
    'docs/pull_request_template.md',
  ];

  for (const rel of candidateFiles) {
    const fullPath = path.join(repoPath, rel);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8').trim();
        return { path: rel, content: content.slice(0, 2000) };
      } catch {
        // ignore
      }
    }
  }

  const templateDir = path.join(repoPath, '.github', 'PULL_REQUEST_TEMPLATE');
  if (fs.existsSync(templateDir)) {
    try {
      const files = fs.readdirSync(templateDir);
      const mdFile = files.find((f) => f.endsWith('.md'));
      if (mdFile) {
        const fullPath = path.join(templateDir, mdFile);
        const content = fs.readFileSync(fullPath, 'utf-8').trim();
        return {
          path: path.join('.github', 'PULL_REQUEST_TEMPLATE', mdFile),
          content: content.slice(0, 2000),
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Scan repository for linters, formatters, and code quality configurations.
 * @param {string} repoPath
 * @param {Record<string, any>} [stack={}]
 * @returns {Array<{ tool: string, config: string, command: string, type: 'linter' | 'formatter' | 'typecheck' }>}
 */
export function scanLintersAndFormatters(repoPath, stack = {}) {
  const detected = [];

  const pkgJsonPath = path.join(repoPath, 'package.json');
  let pkgScripts = {};
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      pkgScripts = pkg.scripts || {};
    } catch {
      // ignore
    }
  }

  const eslintFiles = [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.ts',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.json',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc',
  ];
  for (const f of eslintFiles) {
    if (fs.existsSync(path.join(repoPath, f))) {
      detected.push({
        tool: 'ESLint',
        config: f,
        command: pkgScripts.lint ? 'npm run lint' : 'npx eslint .',
        type: 'linter',
      });
      break;
    }
  }

  const prettierFiles = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.yml',
    '.prettierrc.yaml',
    '.prettierrc.js',
    'prettier.config.js',
    'prettier.config.mjs',
  ];
  for (const f of prettierFiles) {
    if (fs.existsSync(path.join(repoPath, f))) {
      detected.push({
        tool: 'Prettier',
        config: f,
        command: pkgScripts.format ? 'npm run format' : 'npx prettier --check .',
        type: 'formatter',
      });
      break;
    }
  }

  if (fs.existsSync(path.join(repoPath, 'biome.json')) || fs.existsSync(path.join(repoPath, 'biome.jsonc'))) {
    detected.push({
      tool: 'Biome',
      config: 'biome.json',
      command: 'npx @biomejs/biome check .',
      type: 'linter',
    });
  }

  if (fs.existsSync(path.join(repoPath, 'tsconfig.json'))) {
    detected.push({
      tool: 'TypeScript',
      config: 'tsconfig.json',
      command: pkgScripts.typecheck ? 'npm run typecheck' : 'npx tsc --noEmit',
      type: 'typecheck',
    });
  }

  const pyprojectPath = path.join(repoPath, 'pyproject.toml');
  let pyprojectContent = '';
  if (fs.existsSync(pyprojectPath)) {
    try {
      pyprojectContent = fs.readFileSync(pyprojectPath, 'utf-8');
    } catch {
      // ignore
    }
  }

  if (
    fs.existsSync(path.join(repoPath, 'ruff.toml')) ||
    fs.existsSync(path.join(repoPath, '.ruff.toml')) ||
    pyprojectContent.includes('[tool.ruff]')
  ) {
    detected.push({
      tool: 'Ruff',
      config: pyprojectContent.includes('[tool.ruff]') ? 'pyproject.toml' : 'ruff.toml',
      command: 'ruff check .',
      type: 'linter',
    });
  }

  if (pyprojectContent.includes('[tool.black]')) {
    detected.push({
      tool: 'Black',
      config: 'pyproject.toml',
      command: 'black --check .',
      type: 'formatter',
    });
  }

  if (
    fs.existsSync(path.join(repoPath, 'mypy.ini')) ||
    fs.existsSync(path.join(repoPath, '.mypy.ini')) ||
    pyprojectContent.includes('[tool.mypy]')
  ) {
    detected.push({
      tool: 'Mypy',
      config: pyprojectContent.includes('[tool.mypy]') ? 'pyproject.toml' : 'mypy.ini',
      command: 'mypy .',
      type: 'typecheck',
    });
  }

  if (fs.existsSync(path.join(repoPath, 'Cargo.toml'))) {
    detected.push({
      tool: 'Clippy',
      config: 'Cargo.toml',
      command: 'cargo clippy -- -D warnings',
      type: 'linter',
    });
    if (fs.existsSync(path.join(repoPath, 'rustfmt.toml')) || fs.existsSync(path.join(repoPath, '.rustfmt.toml'))) {
      detected.push({
        tool: 'rustfmt',
        config: 'rustfmt.toml',
        command: 'cargo fmt --check',
        type: 'formatter',
      });
    }
  }

  if (fs.existsSync(path.join(repoPath, '.golangci.yml')) || fs.existsSync(path.join(repoPath, '.golangci.yaml'))) {
    detected.push({
      tool: 'golangci-lint',
      config: '.golangci.yml',
      command: 'golangci-lint run',
      type: 'linter',
    });
  }

  return detected;
}

/**
 * Generate rich, surgical AI prompt content (.contrib/AI_PROMPT.md v2).
 *
 * @param {{
 *   meta: Record<string, any>,
 *   stack: Record<string, any>,
 *   targetBranch: string,
 *   focusAreas: string[],
 *   contributing: ReturnType<typeof scanContributingGuidelines>,
 *   prTemplate: ReturnType<typeof scanPullRequestTemplate>,
 *   qualityTools: ReturnType<typeof scanLintersAndFormatters>
 * }} context
 * @returns {string} Markdown document
 */
export function generateAiPromptV2(context) {
  const { meta, stack, targetBranch, focusAreas, contributing, prTemplate, qualityTools } = context;

  const lines = [
    `# AI Agent Instructions for Issue #${meta.issue_number || 'N/A'}`,
    '',
    `## 1. Context & Metadata`,
    `- **Repository:** ${meta.owner}/${meta.repo}`,
    `- **Issue Title:** ${meta.title || 'N/A'}`,
    `- **Issue URL:** ${meta.url}`,
    `- **Working Branch:** ${targetBranch}`,
    `- **Tech Stack:** ${stack.type || 'Generic'} (${stack.packageManager || 'unknown'})`,
    '',
    `## 2. Issue Description & Goal`,
    meta.body ? meta.body : '_No description provided._',
    '',
    `## 3. Candidate Files & Focus Areas`,
    focusAreas && focusAreas.length > 0
      ? focusAreas.map((f) => `- \`${f}\``).join('\n')
      : '- Search the codebase for symbols, function names, or error messages mentioned in the issue.',
    '',
  ];

  if (contributing) {
    lines.push(`## 4. Repository Guidelines (${contributing.path})`);
    if (Object.keys(contributing.sections).length > 0) {
      for (const [secTitle, secContent] of Object.entries(contributing.sections)) {
        lines.push(`### ${secTitle}`);
        lines.push(secContent);
        lines.push('');
      }
    } else if (contributing.excerpt) {
      lines.push(contributing.excerpt);
      lines.push('');
    }
  }

  lines.push(`## 5. Quality Standards & Linters`);
  if (qualityTools && qualityTools.length > 0) {
    lines.push('Before submitting, ensure all code changes satisfy the project linters and formatters:');
    for (const tool of qualityTools) {
      lines.push(`- **${tool.tool}** (${tool.type}): \`${tool.command}\` [config: \`${tool.config}\`]`);
    }
  } else {
    lines.push('- Maintain existing project code formatting and styling conventions.');
  }
  lines.push('');

  lines.push(`## 6. Verification & Test Commands`);
  if (stack && stack.testCommand) {
    lines.push(`- Run primary test suite: \`${stack.testCommand}\``);
  } else {
    lines.push('- Run repository test suite before committing.');
  }
  lines.push('- Check git working tree: `git status`');
  lines.push('- Review staged changes: `git diff --staged`');
  lines.push('');

  if (prTemplate) {
    lines.push(`## 7. Pull Request Checklist (${prTemplate.path})`);
    lines.push('Ensure your solution satisfies the project PR requirements:');
    lines.push(prTemplate.content);
    lines.push('');
  }

  lines.push(`## 8. General Coding Rules for AI Assistants`);
  lines.push(`1. Make minimal, surgical modifications directly addressing the issue.`);
  lines.push(`2. Do not introduce extraneous refactoring or whitespace churn in untouched code.`);
  lines.push(`3. Add unit or regression tests verifying the fix where appropriate.`);
  lines.push(`4. Preserve all existing public API signatures and backward compatibility.`);
  lines.push('');

  return lines.join('\n');
}
