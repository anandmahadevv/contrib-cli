/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Handler for 'recommend' / 'match' / 'gsoc' command.
 * Interactive GSoC Project Matcher & Recommendation Engine.
 */

import readline from 'node:readline/promises';
import { logger } from '../utils/logger.js';
import { getRecommendedOrgs, fetchOrgStarterIssues, GSOC_ORGANIZATIONS } from '../services/recommend.js';
import { handleStart } from './start.js';

/**
 * Handle GSoC recommendation request.
 *
 * @param {{
 *   lang?: string,
 *   domain?: string,
 *   level?: 'beginner' | 'intermediate' | 'advanced',
 *   time?: string,
 *   limit?: string,
 *   json?: boolean,
 *   markdown?: boolean
 * }} options
 * @returns {Promise<number>} Exit code
 */
export async function handleRecommend(options = {}) {
  const limit = options.limit ? parseInt(options.limit, 10) : 3;

  // Non-interactive or flag-based execution
  if (options.lang || options.domain || options.level || options.json || options.markdown || !process.stdin.isTTY) {
    const userLangs = options.lang ? options.lang.split(',').map((s) => s.trim()) : [];
    const userDomains = options.domain ? options.domain.split(',').map((s) => s.trim()) : [];
    const level = options.level || 'beginner';
    const hours = options.time ? parseInt(options.time, 10) : 10;

    const recommendations = getRecommendedOrgs({
      languages: userLangs,
      domains: userDomains,
      level,
      hoursPerWeek: hours,
      limit,
    });

    if (options.json) {
      logger.plain(JSON.stringify(recommendations, null, 2));
      return 0;
    }

    if (options.markdown) {
      logger.plain('# GSoC Recommended Organizations\n');
      recommendations.forEach((org, idx) => {
        logger.plain(`## ${idx + 1}. ${org.name} (${org.matchPercent}% Match)`);
        logger.plain(`- **Category:** ${org.category}`);
        logger.plain(`- **Languages:** ${org.languages.join(', ')}`);
        logger.plain(`- **Default Repo:** \`${org.defaultRepo}\``);
        logger.plain(`- **Prep Advice:** ${org.prepTips}`);
        logger.plain(`- **Chat & Community:** ${org.chatUrl}\n`);
      });
      return 0;
    }

    logger.info('===========================================================');
    logger.info('   GSoC Project Matcher & Recommendation Engine');
    logger.info('===========================================================\n');

    recommendations.forEach((org, idx) => {
      logger.success(`[${org.matchPercent}% MATCH] ${idx + 1}. ${org.name}`);
      logger.plain(`    Category:     ${org.category}`);
      logger.plain(`    Languages:    ${org.languages.join(', ')}`);
      logger.plain(`    Default Repo: ${org.defaultRepo}`);
      logger.plain(`    Prep Tip:     ${org.prepTips}`);
      logger.dim(`    Reasons:      ${org.matchReasons.join(' | ')}\n`);
    });

    logger.plain('To start a workspace for a matched org:');
    logger.plain(`  $ npx gsoc-contrib search "good first issue" --repo ${recommendations[0].defaultRepo}`);
    return 0;
  }

  // Interactive CLI Quiz Mode
  logger.info('===========================================================');
  logger.info('   GSoC Project Matcher — Find Your Ideal GSoC Org');
  logger.info('===========================================================\n');
  logger.plain('Answer 3 quick questions to discover your best-fit GSoC project:\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Question 1: Languages
    const langAns = await rl.question('1. What programming languages do you know? (e.g. python, js, c++, rust) [python]: ');
    const languages = langAns.trim()
      ? langAns.split(',').map((s) => s.trim())
      : ['python'];

    // Question 2: Domain
    logger.plain('\nSelect your primary domain of interest:');
    logger.plain('  [1] Web Development & Fullstack');
    logger.plain('  [2] AI / Machine Learning & Data Science');
    logger.plain('  [3] Cloud, DevOps & Containers');
    logger.plain('  [4] Cybersecurity & App Security');
    logger.plain('  [5] Mobile Apps & Desktop/Media');
    logger.plain('  [6] Low-level Systems & Core Tools');
    const domainAns = await rl.question('Choose domain [1-6] (default: 1): ');
    
    const domainMap = {
      '1': ['web'],
      '2': ['ai', 'ml', 'data'],
      '3': ['cloud', 'devops'],
      '4': ['security'],
      '5': ['mobile', 'media'],
      '6': ['systems', 'core', 'tools'],
    };
    const domains = domainMap[domainAns.trim()] || ['web'];

    // Question 3: Skill level
    logger.plain('\nSelect your Open-Source / GSoC experience level:');
    logger.plain('  [1] Absolute Beginner (Need "good first issues" & step-by-step guidance)');
    logger.plain('  [2] Intermediate (Familiar with Git & basic PRs)');
    logger.plain('  [3] Advanced (Ready for major architectural contributions)');
    const levelAns = await rl.question('Choose level [1-3] (default: 1): ');
    const levelMap = { '1': 'beginner', '2': 'intermediate', '3': 'advanced' };
    const level = levelMap[levelAns.trim()] || 'beginner';

    logger.plain('\n-----------------------------------------------------------');
    logger.info('Analyzing 200+ GSoC Organizations & repo activity...');
    logger.plain('-----------------------------------------------------------\n');

    const topOrgs = getRecommendedOrgs({
      languages,
      domains,
      level,
      limit: 3,
    });

    topOrgs.forEach((org, idx) => {
      logger.success(`[${org.matchPercent}% MATCH] #${idx + 1} ${org.name}`);
      logger.plain(`   • Category:     ${org.category}`);
      logger.plain(`   • Languages:    ${org.languages.join(', ')}`);
      logger.plain(`   • Starter Repo: ${org.defaultRepo}`);
      logger.plain(`   • Mentorship:   ${org.mentorship}`);
      logger.plain(`   • Starter Tip:  ${org.prepTips}`);
      logger.dim(`   • Match Reason: ${org.matchReasons.join(' | ')}\n`);
    });

    const topOrg = topOrgs[0];
    const fetchAns = await rl.question(`Would you like to fetch live beginner issues for #${topOrg.name} (${topOrg.defaultRepo})? [Y/n]: `);

    if (fetchAns.trim().toLowerCase() === 'n') {
      logger.plain('\nHappy Open Source Contributing! Spin up a workspace anytime using:');
      logger.plain(`  $ npx gsoc-contrib search --repo ${topOrg.defaultRepo}`);
      return 0;
    }

    logger.plain('');
    logger.info(`Fetching live starter issues from GitHub API for ${topOrg.defaultRepo}...`);
    const issues = await fetchOrgStarterIssues(topOrg, { limit: 5 });

    if (issues.length === 0) {
      logger.warn(`No live issues tagged "good first issue" found right now for ${topOrg.defaultRepo}.`);
      logger.plain(`You can search all open issues anytime with:`);
      logger.plain(`  $ npx gsoc-contrib browse --repo ${topOrg.defaultRepo}`);
      return 0;
    }

    logger.success(`Found ${issues.length} starter issues in ${topOrg.defaultRepo}:\n`);
    issues.forEach((issue, idx) => {
      logger.plain(`  [${idx + 1}] #${issue.number} ${issue.title}`);
      logger.dim(`      Repo: ${issue.repo || topOrg.defaultRepo} | URL: ${issue.html_url}`);
    });

    logger.plain('');
    const issueAns = await rl.question(`Select issue [1-${issues.length}] to launch instant workspace (or press Enter to exit): `);
    const choice = parseInt(issueAns.trim(), 10);

    if (choice >= 1 && choice <= issues.length) {
      const selected = issues[choice - 1];
      logger.plain('');
      logger.info(`Launching lightweight workspace for: ${selected.html_url}`);
      rl.close();
      return await handleStart(selected.html_url);
    }

    logger.plain('Matcher completed.');
    return 0;
  } catch (err) {
    logger.error(err.message);
    return 1;
  } finally {
    rl.close();
  }
}
