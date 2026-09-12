/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * GSoC Project Matcher & Recommendation Engine.
 * Helps beginners find the best open-source organizations & starter issues based on
 * skills, domain interests, experience level, and available time.
 */

import { searchIssues } from './github.js';

/**
 * Curated list of top GSoC Organizations with metadata.
 */
export const GSOC_ORGANIZATIONS = [
  {
    id: 'psf',
    name: 'Python Software Foundation (PSF)',
    category: 'Core Language & Web Ecosystem',
    languages: ['python'],
    domains: ['web', 'core', 'tools', 'data'],
    repos: ['psf/requests', 'psf/black', 'pallets/flask', 'python/cpython'],
    defaultRepo: 'psf/requests',
    mentorship: 'High (Discourse & GitHub)',
    beginnerFriendly: 5, // out of 5
    description: 'Maintains Python interpreter, popular packages (Requests, Black, Flask), and core web tools.',
    prepTips: 'Start by fixing docstrings, adding unit tests, or tackling "good first issue" labels in Requests or Flask.',
    chatUrl: 'https://discuss.python.org/'
  },
  {
    id: 'zulip',
    name: 'Zulip',
    category: 'Real-time Collaboration & Web/Mobile',
    languages: ['python', 'javascript', 'typescript', 'react', 'flutter'],
    domains: ['web', 'mobile', 'communication', 'tools'],
    repos: ['zulip/zulip', 'zulip/zulip-mobile', 'zulip/zulip-terminal'],
    defaultRepo: 'zulip/zulip',
    mentorship: 'World-Class (Gold standard for GSoC onboarding)',
    beginnerFriendly: 5,
    description: 'Real-time team chat app known across GSoC for the best beginner onboarding and mentorship.',
    prepTips: 'Join chat.zulip.org, follow their automated dev setup, and pick from 100+ tagged beginner issues.',
    chatUrl: 'https://chat.zulip.org/'
  },
  {
    id: 'tensorflow',
    name: 'TensorFlow & Google AI',
    category: 'Machine Learning & Deep Learning',
    languages: ['python', 'cpp', 'cuda'],
    domains: ['ai', 'ml', 'data', 'systems'],
    repos: ['tensorflow/tensorflow', 'keras-team/keras', 'google/jax'],
    defaultRepo: 'keras-team/keras',
    mentorship: 'High',
    beginnerFriendly: 3,
    description: 'Open-source end-to-end platform for machine learning, neural networks, and AI research.',
    prepTips: 'Start with Keras tutorial notebook fixes, documentation formatting, or easy API tests.',
    chatUrl: 'https://discuss.tensorflow.org/'
  },
  {
    id: 'cncf',
    name: 'Cloud Native Computing Foundation (CNCF)',
    category: 'Cloud, DevOps & Containers',
    languages: ['go', 'yaml', 'bash'],
    domains: ['cloud', 'devops', 'systems'],
    repos: ['kubernetes/kubernetes', 'prometheus/prometheus', 'helm/helm'],
    defaultRepo: 'prometheus/prometheus',
    mentorship: 'High (Active Slack)',
    beginnerFriendly: 4,
    description: 'Building the foundation for cloud-native infrastructure including Kubernetes and Prometheus.',
    prepTips: 'Join CNCF Slack, look for "good first issue" in Helm or Prometheus repos.',
    chatUrl: 'https://slack.cncf.io/'
  },
  {
    id: 'owasp',
    name: 'OWASP (Web Security Project)',
    category: 'Cybersecurity & Application Security',
    languages: ['java', 'javascript', 'python'],
    domains: ['security', 'web', 'tools'],
    repos: ['zaproxy/zaproxy', 'OWASP/Juice-Shop', 'owasp-dep-scan'],
    defaultRepo: 'OWASP/Juice-Shop',
    mentorship: 'Very Active',
    beginnerFriendly: 5,
    description: 'Global non-profit dedicated to web application security, vulnerability testing, and security tools.',
    prepTips: 'Try OWASP Juice-Shop starter challenges or ZAP add-on bug fixes.',
    chatUrl: 'https://owasp.org/slack'
  },
  {
    id: 'mozilla',
    name: 'Mozilla',
    category: 'Web Standards & Rust/Browser Tech',
    languages: ['javascript', 'typescript', 'rust', 'cpp', 'swift'],
    domains: ['web', 'systems', 'browser', 'mobile'],
    repos: ['mozilla/pdf.js', 'mozilla/firefox-ios', 'rust-lang/rust'],
    defaultRepo: 'mozilla/pdf.js',
    mentorship: 'High',
    beginnerFriendly: 4,
    description: 'Firefox browser, PDF.js renderer, and Rust language ecosystem.',
    prepTips: 'PDF.js has very clear beginner-friendly issues with step-by-step mentor guidance.',
    chatUrl: 'https://chat.mozilla.org/'
  },
  {
    id: 'apache',
    name: 'Apache Software Foundation',
    category: 'Big Data & Cloud Orchestration',
    languages: ['python', 'typescript', 'java', 'scala'],
    domains: ['data', 'web', 'cloud', 'analytics'],
    repos: ['apache/superset', 'apache/airflow', 'apache/spark'],
    defaultRepo: 'apache/superset',
    mentorship: 'High',
    beginnerFriendly: 4,
    description: 'Powers enterprise data visualization (Superset) and workflow automation (Airflow).',
    prepTips: 'Airflow and Superset have active GitHub issue trackers with "good first issue" labels.',
    chatUrl: 'https://apache.org/foundation/mailinglists.html'
  },
  {
    id: 'opencv',
    name: 'OpenCV',
    category: 'Computer Vision & AI',
    languages: ['cpp', 'python'],
    domains: ['ai', 'computer-vision', 'media'],
    repos: ['opencv/opencv', 'opencv/opencv_contrib'],
    defaultRepo: 'opencv/opencv',
    mentorship: 'Moderate',
    beginnerFriendly: 3,
    description: 'The world\'s leading open-source computer vision and image processing library.',
    prepTips: 'Focus on python binding tests, documentation updates, or sample script improvements.',
    chatUrl: 'https://forum.opencv.org/'
  },
  {
    id: 'julia',
    name: 'Julia Language',
    category: 'Scientific Computing & Data Science',
    languages: ['julia', 'cpp', 'c'],
    domains: ['data', 'core', 'scientific'],
    repos: ['JuliaLang/julia', 'JuliaData/DataFrames.jl'],
    defaultRepo: 'JuliaData/DataFrames.jl',
    mentorship: 'Welcoming & Enthusiastic',
    beginnerFriendly: 4,
    description: 'High-performance dynamic language designed for data science and scientific computing.',
    prepTips: 'Join Julia Discourse, pick a starter issue in DataFrames.jl or documentation.',
    chatUrl: 'https://discourse.julialang.org/'
  },
  {
    id: 'videolan',
    name: 'VideoLAN (VLC)',
    category: 'Multimedia & Video Systems',
    languages: ['c', 'cpp', 'java', 'kotlin'],
    domains: ['media', 'mobile', 'systems'],
    repos: ['videolan/vlc', 'videolan/vlc-android'],
    defaultRepo: 'videolan/vlc-android',
    mentorship: 'High (IRC)',
    beginnerFriendly: 4,
    description: 'Creators of VLC media player, used by hundreds of millions worldwide.',
    prepTips: 'Check VLC Android starter issues or C/C++ audio/video demuxer tests.',
    chatUrl: 'https://www.videolan.org/contribute.html'
  }
];

/**
 * Calculate match percentage and score for a GSoC org based on candidate preferences.
 *
 * @param {typeof GSOC_ORGANIZATIONS[0]} org
 * @param {{
 *   languages?: string[],
 *   domains?: string[],
 *   level?: 'beginner' | 'intermediate' | 'advanced',
 *   hoursPerWeek?: number
 * }} prefs
 * @returns {{ score: number, matchPercent: number, matchReasons: string[] }}
 */
export function evaluateOrgMatch(org, prefs = {}) {
  let score = 0;
  const maxPossible = 100;
  const matchReasons = [];

  const userLangs = (prefs.languages || []).map((l) => l.toLowerCase().trim());
  const userDomains = (prefs.domains || []).map((d) => d.toLowerCase().trim());
  const level = prefs.level || 'beginner';

  // 1. Language overlap (up to 45 points)
  if (userLangs.length > 0) {
    const matchedLangs = org.languages.filter((l) =>
      userLangs.some((ul) => l.includes(ul) || ul.includes(l))
    );
    if (matchedLangs.length > 0) {
      const langPoints = Math.min(45, Math.round((matchedLangs.length / org.languages.length) * 35 + 10));
      score += langPoints;
      matchReasons.push(`Uses your tech stack: ${matchedLangs.join(', ')}`);
    }
  } else {
    // Neutral language score if none specified
    score += 25;
  }

  // 2. Domain / Topic overlap (up to 35 points)
  if (userDomains.length > 0) {
    const matchedDomains = org.domains.filter((d) =>
      userDomains.some((ud) => d.includes(ud) || ud.includes(d))
    );
    if (matchedDomains.length > 0) {
      score += 35;
      matchReasons.push(`Matches your interest in ${matchedDomains.join(', ')}`);
    }
  } else {
    score += 20;
  }

  // 3. Skill Level & Mentorship alignment (up to 20 points)
  if (level === 'beginner') {
    score += org.beginnerFriendly * 4; // 5 -> 20 pts
    if (org.beginnerFriendly >= 4) {
      matchReasons.push('High beginner friendliness & structured mentorship');
    }
  } else if (level === 'intermediate') {
    score += 15;
    matchReasons.push('Great intermediate project scope');
  } else {
    score += 18;
    matchReasons.push('Deep codebase suitable for advanced contributions');
  }

  const matchPercent = Math.min(99, Math.max(50, Math.round((score / maxPossible) * 100)));

  return {
    score,
    matchPercent,
    matchReasons,
  };
}

/**
 * Recommend top matching GSoC organizations based on candidate preferences.
 *
 * @param {{
 *   languages?: string[],
 *   domains?: string[],
 *   level?: 'beginner' | 'intermediate' | 'advanced',
 *   hoursPerWeek?: number,
 *   limit?: number
 * }} prefs
 * @returns {Array<typeof GSOC_ORGANIZATIONS[0] & { matchPercent: number, matchReasons: string[] }>}
 */
export function getRecommendedOrgs(prefs = {}) {
  const limit = prefs.limit || 3;

  const scored = GSOC_ORGANIZATIONS.map((org) => {
    const match = evaluateOrgMatch(org, prefs);
    return {
      ...org,
      matchPercent: match.matchPercent,
      matchReasons: match.matchReasons,
    };
  });

  // Sort descending by match percent
  scored.sort((a, b) => b.matchPercent - a.matchPercent);

  return scored.slice(0, limit);
}

/**
 * Fetch live starter issues for a target recommended organization from GitHub API.
 *
 * @param {typeof GSOC_ORGANIZATIONS[0]} org
 * @param {{ limit?: number }} options
 * @returns {Promise<Array<{ number: number, title: string, repo: string, html_url: string, labels: string[] }>>}
 */
export async function fetchOrgStarterIssues(org, options = {}) {
  const limit = options.limit || 5;
  const repo = org.defaultRepo;

  try {
    const issues = await searchIssues('good first issue OR help wanted OR beginner', {
      repo,
      limit,
    });
    if (issues.length > 0) return issues;
  } catch (err) {
    // Graceful fallback
  }

  // Fallback query across org repos if defaultRepo returned no tagged issues
  try {
    const fallbackIssues = await searchIssues('state:open', {
      repo,
      limit,
    });
    return fallbackIssues;
  } catch (err) {
    return [];
  }
}
