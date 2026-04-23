#!/usr/bin/env node
/**
 * the-algorithm — installer CLI
 *
 * Copies SKILL.md into ~/.claude/skills/the-algorithm/SKILL.md and (by
 * default) installs a Claude Code SessionStart hook that refreshes the
 * skill to the latest npm version silently on each new session.
 *
 * Flags:
 *   --no-hook          install the skill but do not touch settings.json
 *   --uninstall-hook   remove the auto-upgrade hook from settings.json
 *   --uninstall        remove both the skill directory and the hook
 *   --quiet            suppress success output (used by the hook itself)
 *
 * Env:
 *   THE_ALGORITHM_DEST override the install directory
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const quiet = flag('--quiet');
const log = quiet ? () => {} : (...msgs) => console.log(...msgs);
const warn = (...msgs) => console.warn(...msgs);

const dest = process.env.THE_ALGORITHM_DEST || path.join(os.homedir(), '.claude', 'skills', 'the-algorithm');
const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
const HOOK_MARKER = 'the-algorithm@latest';
const HOOK_COMMAND = 'npx --yes the-algorithm@latest --quiet --no-hook >/dev/null 2>&1 &';

if (flag('--uninstall')) {
  uninstallSkill();
  uninstallHook();
  log('✓ the-algorithm fully removed.');
  process.exit(0);
}

if (flag('--uninstall-hook')) {
  uninstallHook();
  log('✓ Auto-upgrade hook removed. The installed SKILL.md is untouched.');
  process.exit(0);
}

// Install SKILL.md
const src = path.resolve(__dirname, '..', 'SKILL.md');
if (!fs.existsSync(src)) {
  console.error(`✗ SKILL.md not found at ${src}`);
  process.exit(1);
}
fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(src, path.join(dest, 'SKILL.md'));
log(`✓ Installed SKILL.md → ${path.join(dest, 'SKILL.md')}`);

// Install auto-upgrade hook unless opted out
if (!flag('--no-hook')) {
  try {
    const changed = installAutoUpgradeHook();
    if (changed) {
      log(`✓ Auto-upgrade hook installed → ${settingsPath}`);
      log('  Future Claude Code sessions will refresh the-algorithm silently on start.');
      log('  Opt out: `npx the-algorithm --uninstall-hook`.');
    } else {
      log('✓ Auto-upgrade hook already present.');
    }
  } catch (err) {
    warn(`⚠ Could not install auto-upgrade hook: ${err.message}`);
    warn('  The skill still works; it just won\'t auto-update between sessions.');
  }
}

log('');
log('the-algorithm is ready. Invoke it in Claude Code with:');
log('  /the-algorithm');
if (!quiet) {
  log('');
  log('It will also auto-trigger on decision-shaped prompts — feature requests,');
  log('refactors, migrations, new tools/vendors/hires, process changes.');
}

// ────────────────────────────────────────────────────────────────────────────

function readSettings() {
  if (!fs.existsSync(settingsPath)) return {};
  const raw = fs.readFileSync(settingsPath, 'utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${settingsPath} is malformed JSON: ${err.message}`);
  }
}

function writeSettings(settings) {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

function installAutoUpgradeHook() {
  const settings = readSettings();
  settings.hooks = settings.hooks || {};
  settings.hooks.SessionStart = settings.hooks.SessionStart || [];

  const hasHook = settings.hooks.SessionStart.some((entry) =>
    Array.isArray(entry.hooks) && entry.hooks.some((h) => typeof h.command === 'string' && h.command.includes(HOOK_MARKER))
  );
  if (hasHook) return false;

  settings.hooks.SessionStart.push({
    hooks: [{ type: 'command', command: HOOK_COMMAND }],
  });
  writeSettings(settings);
  return true;
}

function uninstallHook() {
  if (!fs.existsSync(settingsPath)) return;
  let settings;
  try {
    settings = readSettings();
  } catch (err) {
    warn(`⚠ ${err.message}`);
    return;
  }
  const list = settings.hooks && settings.hooks.SessionStart;
  if (!Array.isArray(list)) return;

  const filtered = list
    .map((entry) => {
      if (!Array.isArray(entry.hooks)) return entry;
      const hooks = entry.hooks.filter((h) => !(typeof h.command === 'string' && h.command.includes(HOOK_MARKER)));
      return { ...entry, hooks };
    })
    .filter((entry) => !Array.isArray(entry.hooks) || entry.hooks.length > 0);

  settings.hooks.SessionStart = filtered;
  if (filtered.length === 0) delete settings.hooks.SessionStart;
  if (Object.keys(settings.hooks).length === 0) delete settings.hooks;

  writeSettings(settings);
}

function uninstallSkill() {
  if (!fs.existsSync(dest)) return;
  fs.rmSync(dest, { recursive: true, force: true });
  log(`✓ Removed ${dest}`);
}
