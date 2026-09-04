#!/usr/bin/env node

/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * gsoc-contrib CLI executable entry point.
 */

import { runCli } from '../src/cli.js';
import { redactSensitiveOutput } from '../src/utils/security.js';

// Gracefully handle termination signals
process.on('SIGINT', () => {
  process.stderr.write('\n\x1b[33m[!] Operation cancelled by user.\x1b[0m\n');
  process.exit(130);
});

process.on('SIGTERM', () => {
  process.exit(143);
});

// Run CLI
runCli(process.argv)
  .then((exitCode) => {
    if (typeof exitCode === 'number') {
      process.exitCode = exitCode;
    }
  })
  .catch((err) => {
    const rawMsg = err.message || String(err);
    process.stderr.write(`\x1b[31m[!] Error:\x1b[0m ${redactSensitiveOutput(rawMsg)}\n`);
    process.exitCode = 1;
  });

