/**
 * @license MIT
 * Copyright (c) 2026 Anand
 *
 * Shell integration handlers: 'shell-init' and 'alias'.
 * Provides 'gcd' shell function for instant workspace jumping and auto-completion.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { logger } from '../utils/logger.js';

/**
 * Detect user's current or preferred shell.
 * @param {string | undefined} requestedShell
 * @returns {'bash' | 'zsh' | 'fish' | 'powershell'}
 */
export function detectShell(requestedShell) {
  if (requestedShell && typeof requestedShell === 'string') {
    const s = requestedShell.toLowerCase().trim();
    if (s.includes('zsh')) return 'zsh';
    if (s.includes('fish')) return 'fish';
    if (s.includes('power') || s === 'pwsh' || s === 'ps') return 'powershell';
    if (s.includes('bash')) return 'bash';
  }

  const envShell = process.env.SHELL || '';
  if (envShell.endsWith('/zsh')) return 'zsh';
  if (envShell.endsWith('/fish')) return 'fish';
  if (envShell.endsWith('/bash')) return 'bash';

  if (process.platform === 'win32') {
    return 'powershell';
  }

  return 'bash';
}

/**
 * Generate the shell integration script for a specific shell.
 * @param {'bash' | 'zsh' | 'fish' | 'powershell'} shell
 * @returns {string}
 */
export function getShellIntegrationScript(shell) {
  switch (shell) {
    case 'zsh':
    case 'bash':
      return [
        '# >>> gsoc-contrib shell integration >>>',
        'gcd() {',
        '  if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then',
        '    echo "Usage: gcd [workspace-id]"',
        '    echo "Instant workspace jumping for gsoc-contrib"',
        '    return 0',
        '  fi',
        '  local target_dir',
        '  target_dir="$(contrib open "$@" -p 2>/dev/null)" || target_dir="$(gsoc-contrib open "$@" -p 2>/dev/null)"',
        '  if [ -n "$target_dir" ] && [ -d "$target_dir" ]; then',
        '    cd "$target_dir" || return 1',
        '  else',
        '    echo "Workspace not found. Active workspaces:" >&2',
        '    contrib status 2>/dev/null || gsoc-contrib status 2>/dev/null',
        '    return 1',
        '  fi',
        '}',
        '',
        '_contrib_complete() {',
        '  local cur="${COMP_WORDS[COMP_CWORD]}"',
        '  local workspaces',
        '  workspaces="$(contrib status --ids 2>/dev/null || gsoc-contrib status --ids 2>/dev/null)"',
        '  COMPREPLY=($(compgen -W "$workspaces" -- "$cur"))',
        '}',
        'complete -F _contrib_complete gcd 2>/dev/null || true',
        '# <<< gsoc-contrib shell integration <<<',
      ].join('\n');

    case 'fish':
      return [
        '# >>> gsoc-contrib shell integration >>>',
        'function gcd --description "Instant workspace jumping for gsoc-contrib"',
        '  if test "$argv[1]" = "-h" -o "$argv[1]" = "--help"',
        '    echo "Usage: gcd [workspace-id]"',
        '    return 0',
        '  end',
        '  set -l target_dir (contrib open $argv -p 2>/dev/null)',
        '  if test -z "$target_dir"',
        '    set target_dir (gsoc-contrib open $argv -p 2>/dev/null)',
        '  end',
        '  if test -n "$target_dir" -a -d "$target_dir"',
        '    cd "$target_dir"',
        '  else',
        '    echo "Workspace not found. Active workspaces:" >&2',
        '    contrib status 2>/dev/null || gsoc-contrib status 2>/dev/null',
        '    return 1',
        '  end',
        'end',
        '',
        'complete -c gcd -f -a \'(contrib status --ids 2>/dev/null || gsoc-contrib status --ids 2>/dev/null)\'',
        '# <<< gsoc-contrib shell integration <<<',
      ].join('\n');

    case 'powershell':
    default:
      return [
        '# >>> gsoc-contrib shell integration >>>',
        'function gcd {',
        '  param([string]$Workspace)',
        '  if ($Workspace -eq "-h" -or $Workspace -eq "--help") {',
        '    Write-Host "Usage: gcd [workspace-id]"',
        '    Write-Host "Instant workspace jumping for gsoc-contrib"',
        '    return',
        '  }',
        '  $targetDir = $null',
        '  try {',
        '    $targetDir = (contrib open $Workspace -p 2>$null)',
        '  } catch {}',
        '  if (-not $targetDir) {',
        '    try {',
        '      $targetDir = (gsoc-contrib open $Workspace -p 2>$null)',
        '    } catch {}',
        '  }',
        '  if ($targetDir -and (Test-Path -Path $targetDir)) {',
        '    Set-Location -Path $targetDir',
        '  } else {',
        '    Write-Error "Workspace not found. Active workspaces:"',
        '    contrib status',
        '  }',
        '}',
        '',
        'Register-ArgumentCompleter -CommandName gcd -ScriptBlock {',
        '  param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)',
        '  $ids = (contrib status --ids 2>$null)',
        '  if (-not $ids) { $ids = (gsoc-contrib status --ids 2>$null) }',
        '  $ids -split "\\s+" | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {',
        '    [System.Management.Automation.CompletionResult]::new($_, $_, "ParameterValue", $_)',
        '  }',
        '}',
        '# <<< gsoc-contrib shell integration <<<',
      ].join('\n');
  }
}

/**
 * Resolve standard RC configuration file for shell.
 * @param {'bash' | 'zsh' | 'fish' | 'powershell'} shell
 * @returns {string}
 */
export function getShellConfigFile(shell) {
  const home = os.homedir();
  switch (shell) {
    case 'zsh':
      return path.join(home, '.zshrc');
    case 'fish':
      return path.join(home, '.config', 'fish', 'config.fish');
    case 'powershell':
      if (process.platform === 'win32') {
        const psCoreProfile = path.join(home, 'Documents', 'PowerShell', 'Microsoft.PowerShell_profile.ps1');
        const winPsProfile = path.join(home, 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');
        if (fs.existsSync(psCoreProfile)) return psCoreProfile;
        if (fs.existsSync(winPsProfile)) return winPsProfile;
        return psCoreProfile;
      }
      return path.join(home, '.config', 'powershell', 'Microsoft.PowerShell_profile.ps1');
    case 'bash':
    default:
      return path.join(home, '.bashrc');
  }
}

/**
 * Handle 'shell-init' command. Outputs shell script to stdout.
 * @param {string | undefined} shellName
 * @returns {Promise<number>}
 */
export async function handleShellInit(shellName) {
  const shell = detectShell(shellName);
  const script = getShellIntegrationScript(shell);
  process.stdout.write(`${script}\n`);
  return 0;
}

/**
 * Handle 'alias' command. Displays or appends gcd alias & completion.
 * @param {{ install?: boolean, shell?: string }} options
 * @returns {Promise<number>}
 */
export async function handleAlias(options = {}) {
  const shell = detectShell(options.shell);
  const configFile = getShellConfigFile(shell);
  const script = getShellIntegrationScript(shell);

  if (options.install) {
    try {
      const configDir = path.dirname(configFile);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      let existing = '';
      if (fs.existsSync(configFile)) {
        existing = fs.readFileSync(configFile, 'utf-8');
      }

      if (existing.includes('gsoc-contrib shell integration')) {
        logger.info(`Shell integration is already installed in: ${configFile}`);
        return 0;
      }

      const appendContent = `\n${script}\n`;
      fs.appendFileSync(configFile, appendContent, 'utf-8');

      logger.success(`Installed 'gcd' shell hook to: ${configFile}`);
      logger.plain('\nTo activate immediately, reload your shell configuration:');
      if (shell === 'powershell') {
        logger.step('  reload:', `. "${configFile}"`);
      } else {
        logger.step('  reload:', `source "${configFile}"`);
      }
      logger.plain('\nNow you can jump directly into workspaces with:');
      logger.step('  gcd', '<workspace-id>');
      return 0;
    } catch (err) {
      logger.error(`Failed to install shell alias: ${err.message}`);
      return 1;
    }
  }

  logger.plain(`gsoc-contrib Shell Integration ('gcd' shortcut)`);
  logger.divider(60);
  logger.plain(`Detected Shell: ${shell}`);
  logger.plain(`Config File:    ${configFile}\n`);

  logger.plain('Option 1: Quick eval in current session:');
  if (shell === 'zsh') {
    logger.step('  eval:', 'eval "$(npx gsoc-contrib shell-init zsh)"');
  } else if (shell === 'bash') {
    logger.step('  eval:', 'eval "$(npx gsoc-contrib shell-init bash)"');
  } else if (shell === 'fish') {
    logger.step('  eval:', 'npx gsoc-contrib shell-init fish | source');
  } else {
    logger.step('  eval:', 'npx gsoc-contrib shell-init powershell | Out-String | Invoke-Expression');
  }

  logger.plain('\nOption 2: Install permanently:');
  logger.step('  run:', 'npx gsoc-contrib alias --install');

  return 0;
}
