/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Terminal output and formatting utilities.
 */

const isColorSupported =
  !process.env.NO_COLOR &&
  (process.env.FORCE_COLOR || (process.stdout.isTTY && process.env.TERM !== 'dumb'));

const colors = {
  reset: isColorSupported ? '\x1b[0m' : '',
  bold: isColorSupported ? '\x1b[1m' : '',
  dim: isColorSupported ? '\x1b[2m' : '',
  italic: isColorSupported ? '\x1b[3m' : '',
  underline: isColorSupported ? '\x1b[4m' : '',
  red: isColorSupported ? '\x1b[31m' : '',
  green: isColorSupported ? '\x1b[32m' : '',
  yellow: isColorSupported ? '\x1b[33m' : '',
  blue: isColorSupported ? '\x1b[34m' : '',
  magenta: isColorSupported ? '\x1b[35m' : '',
  cyan: isColorSupported ? '\x1b[36m' : '',
  white: isColorSupported ? '\x1b[37m' : '',
  gray: isColorSupported ? '\x1b[90m' : '',
};

import { redactSensitiveOutput } from './security.js';

export const logger = {
  colors,

  info(msg) {
    console.log(`${colors.blue}[*]${colors.reset} ${redactSensitiveOutput(msg)}`);
  },

  success(msg) {
    console.log(`${colors.green}[+]${colors.reset} ${redactSensitiveOutput(msg)}`);
  },

  warn(msg) {
    console.warn(`${colors.yellow}[!]${colors.reset} ${redactSensitiveOutput(msg)}`);
  },

  error(msg) {
    console.error(`${colors.red}[!] Error:${colors.reset} ${redactSensitiveOutput(msg)}`);
  },

  step(prefix, msg) {
    console.log(`${colors.cyan}${prefix}${colors.reset} ${redactSensitiveOutput(msg)}`);
  },

  plain(msg) {
    console.log(redactSensitiveOutput(msg));
  },

  dim(msg) {
    console.log(`${colors.dim}${redactSensitiveOutput(msg)}${colors.reset}`);
  },

  divider(len = 72) {
    console.log(`${colors.gray}${'-'.repeat(len)}${colors.reset}`);
  },
};

