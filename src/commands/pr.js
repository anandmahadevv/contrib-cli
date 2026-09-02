/**
 * Handler for 'pr' command (alias for submit).
 */

import { handleSubmit } from './submit.js';

export async function handlePr(idOrTarget, options = {}) {
  return handleSubmit(idOrTarget, options);
}
