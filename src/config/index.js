/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Configuration and state persistence for contrib.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

/**
 * Return the base directory for contrib data.
 * Respects CONTRIB_HOME environment variable if set.
 * @returns {string}
 */
export function getContribHome() {
  const customHome = process.env.CONTRIB_HOME;
  const base = customHome ? path.resolve(customHome) : path.join(os.homedir(), '.contrib');
  if (!fs.existsSync(base)) {
    fs.mkdirSync(base, { recursive: true });
  }
  return base;
}

/**
 * Return the directory containing all active contribution workspaces.
 * @returns {string}
 */
export function getWorkspacesDir() {
  const wsDir = path.join(getContribHome(), 'workspaces');
  if (!fs.existsSync(wsDir)) {
    fs.mkdirSync(wsDir, { recursive: true });
  }
  return wsDir;
}

/**
 * Return the JSON file path tracking active workspaces.
 * @returns {string}
 */
export function getRegistryFile() {
  return path.join(getContribHome(), 'registry.json');
}

/**
 * Load the workspace registry.
 * @returns {Record<string, any>}
 */
export function loadRegistry() {
  const regFile = getRegistryFile();
  if (!fs.existsSync(regFile)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(regFile, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save the workspace registry atomically.
 * @param {Record<string, any>} data
 */
export function saveRegistry(data) {
  const regFile = getRegistryFile();
  const dir = path.dirname(regFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempFile = `${regFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, regFile);
}

/**
 * Remove an entry from the registry by workspace ID.
 * @param {string} id
 */
export function removeRegistryEntry(id) {
  const registry = loadRegistry();
  if (registry[id]) {
    delete registry[id];
    saveRegistry(registry);
  }
}
