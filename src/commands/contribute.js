/**
 * Handler for 'contribute' command (alias/enhanced workflow for start).
 */

import { handleStart } from './start.js';

export async function handleContribute(target, options = {}) {
  return handleStart(target, options);
}
