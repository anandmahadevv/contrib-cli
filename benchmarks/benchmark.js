/**
 * @license MIT
 * Contrib CLI (v0.5.3) Academic Benchmark & Empirical Performance Suite
 * 
 * Measures:
 * 1. Cold Setup Latency (Standard Full Clone vs. Blobless Bare Cache Initialization)
 * 2. Warm Workspace Creation Latency (N-th Issue Worktree Spin-up from Cache)
 * 3. Total Disk Storage Footprint Across N Concurrent Issue Workspaces
 * 4. Multi-Trial Statistical Sampling (Mean, Standard Deviation)
 * 5. Dynamic Default Branch Detection & Automated CSV Export
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target Repositories for Empirical Evaluation
const TEST_REPOSITORIES = [
  { name: 'express', url: 'https://github.com/expressjs/express.git', category: 'Small' },
  { name: 'flask', url: 'https://github.com/pallets/flask.git', category: 'Medium' },
  { name: 'requests', url: 'https://github.com/psf/requests.git', category: 'Medium' },
];

const NUM_TRIALS = 3;
const BENCHMARK_DIR = path.join(__dirname, '.contrib_benchmark_run');
const CSV_OUTPUT_PATH = path.join(__dirname, 'benchmark_results.csv');

/**
 * Calculate directory size recursively in bytes.
 */
function getDirectorySize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        size += getDirectorySize(full);
      } else if (entry.isFile()) {
        try {
          size += fs.statSync(full).size;
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }
  return size;
}

function bytesToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function detectDefaultBranch(dirPath) {
  try {
    const out = execSync('git symbolic-ref refs/remotes/origin/HEAD', { cwd: dirPath, encoding: 'utf-8' });
    return out.trim().replace('refs/remotes/origin/', '');
  } catch {
    try {
      const branches = execSync('git branch', { cwd: dirPath, encoding: 'utf-8' });
      if (branches.includes('main')) return 'main';
      if (branches.includes('master')) return 'master';
    } catch {
      // fallback
    }
  }
  return 'main';
}

function getStats(arr) {
  if (arr.length === 0) return { mean: 0, stdDev: 0 };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return {
    mean: Number(mean.toFixed(2)),
    stdDev: Number(Math.sqrt(variance).toFixed(2)),
  };
}

async function runBenchmark() {
  console.log('================================================================');
  console.log('   Contrib CLI v0.5.3 — Rigorous Empirical Benchmark Suite      ');
  console.log('================================================================\n');

  if (fs.existsSync(BENCHMARK_DIR)) {
    fs.rmSync(BENCHMARK_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(BENCHMARK_DIR, { recursive: true });

  const csvRows = [
    'repository,category,trial,cold_full_clone_sec,cold_bare_cache_sec,warm_worktree_ms,storage_single_clone_mb,storage_n3_clones_mb,storage_contrib_cache_mb,storage_contrib_n3_total_mb',
  ];

  const summaryData = [];

  for (const repo of TEST_REPOSITORIES) {
    console.log(`\n▶ Benchmarking Target Repository: ${repo.name} (${repo.category} - ${repo.url})`);

    const repoWorkDir = path.join(BENCHMARK_DIR, repo.name);
    fs.mkdirSync(repoWorkDir, { recursive: true });

    const coldFullTimes = [];
    const coldCacheTimes = [];
    const warmWorktreeTimes = [];

    let singleCloneStorageMB = 0;
    let n3ClonesStorageMB = 0;
    let contribBareCacheStorageMB = 0;
    let contribN3TotalStorageMB = 0;

    for (let trial = 1; trial <= NUM_TRIALS; trial++) {
      console.log(`  └─ Trial ${trial}/${NUM_TRIALS}...`);
      const trialDir = path.join(repoWorkDir, `trial_${trial}`);
      fs.mkdirSync(trialDir, { recursive: true });

      try {
        // 1. Cold Full Clone Baseline
        const fullCloneDir = path.join(trialDir, 'full_clone_1');
        const t0 = Date.now();
        execSync(`git clone ${repo.url} "${fullCloneDir}"`, { stdio: 'ignore' });
        const fullCloneSec = (Date.now() - t0) / 1000;
        coldFullTimes.push(fullCloneSec);

        const defaultBranch = detectDefaultBranch(fullCloneDir);
        const singleSize = getDirectorySize(fullCloneDir);
        singleCloneStorageMB = Number(bytesToMB(singleSize));

        // Create N=3 full clones to measure traditional multi-issue storage
        for (let i = 2; i <= 3; i++) {
          execSync(`git clone ${repo.url} "${path.join(trialDir, `full_clone_${i}`)}"`, { stdio: 'ignore' });
        }
        const n3FullSize = getDirectorySize(trialDir);
        n3ClonesStorageMB = Number(bytesToMB(n3FullSize));

        // 2. Contrib CLI Cold Bare Cache Setup
        const bareCacheDir = path.join(trialDir, 'bare_cache.git');
        const t1 = Date.now();
        execSync(`git clone --bare --filter=blob:none ${repo.url} "${bareCacheDir}"`, { stdio: 'ignore' });
        const bareCacheSec = (Date.now() - t1) / 1000;
        coldCacheTimes.push(bareCacheSec);

        const cacheSize = getDirectorySize(bareCacheDir);
        contribBareCacheStorageMB = Number(bytesToMB(cacheSize));

        // 3. Contrib CLI Warm Worktree Allocations (N=3 workspaces)
        const worktreeSpinTimes = [];
        const worktreeDirs = [];

        for (let i = 1; i <= 3; i++) {
          const wtDir = path.join(trialDir, `contrib_worktree_${i}`);
          worktreeDirs.push(wtDir);
          const t2 = Date.now();
          execSync(`git worktree add -b contrib/issue-${i} "${wtDir}" ${defaultBranch}`, {
            cwd: bareCacheDir,
            stdio: 'ignore',
          });
          const spinMs = Date.now() - t2;
          worktreeSpinTimes.push(spinMs);
        }

        const avgWarmWorktreeMs = worktreeSpinTimes.reduce((a, b) => a + b, 0) / worktreeSpinTimes.length;
        warmWorktreeTimes.push(avgWarmWorktreeMs);

        // Combined storage
        let totalContribBytes = getDirectorySize(bareCacheDir);
        for (const wt of worktreeDirs) {
          totalContribBytes += getDirectorySize(wt);
        }
        contribN3TotalStorageMB = Number(bytesToMB(totalContribBytes));

        csvRows.push(
          `${repo.name},${repo.category},${trial},${fullCloneSec.toFixed(2)},${bareCacheSec.toFixed(
            2
          )},${avgWarmWorktreeMs.toFixed(2)},${singleCloneStorageMB},${n3ClonesStorageMB},${contribBareCacheStorageMB},${contribN3TotalStorageMB}`
        );
      } catch (trialErr) {
        console.warn(`    ⚠️ Trial ${trial} encountered error: ${trialErr.message}`);
      }
    }

    if (coldFullTimes.length > 0) {
      const fullCloneStats = getStats(coldFullTimes);
      const bareCacheStats = getStats(coldCacheTimes);
      const worktreeStats = getStats(warmWorktreeTimes);

      summaryData.push({
        repo: repo.name,
        category: repo.category,
        fullCloneSec: `${fullCloneStats.mean}s ± ${fullCloneStats.stdDev}s`,
        bareCacheSec: `${bareCacheStats.mean}s ± ${bareCacheStats.stdDev}s`,
        warmWorktreeMs: `${worktreeStats.mean}ms ± ${worktreeStats.stdDev}ms`,
        singleCloneMB: `${singleCloneStorageMB} MB`,
        n3ClonesMB: `${n3ClonesStorageMB} MB`,
        contribN3TotalMB: `${contribN3TotalStorageMB} MB`,
        storageSavingsN3: `${((1 - contribN3TotalStorageMB / n3ClonesStorageMB) * 100).toFixed(1)}%`,
      });
    }
  }

  fs.writeFileSync(CSV_OUTPUT_PATH, csvRows.join('\n'), 'utf-8');

  console.log('\n================================================================');
  console.log('                 EMPIRICAL RESULTS SUMMARY                      ');
  console.log('================================================================');
  console.table(summaryData);

  console.log(`\n✅ Raw experimental trial metrics saved to: ${CSV_OUTPUT_PATH}`);

  try {
    fs.rmSync(BENCHMARK_DIR, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node benchmarks/benchmark.js\n\nRuns Contrib CLI academic benchmark and empirical performance suite.');
  process.exit(0);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isDirectRun) {
  runBenchmark().catch((err) => {
    console.error('Benchmark execution failed:', err);
    process.exit(1);
  });
}

export { runBenchmark };
