#!/usr/bin/env node
/**
 * the-algorithm — installer CLI
 * Copies SKILL.md into ~/.claude/skills/the-algorithm/SKILL.md so Claude Code picks it up.
 * Override the install location with THE_ALGORITHM_DEST.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const dest = process.env.THE_ALGORITHM_DEST || path.join(os.homedir(), '.claude', 'skills', 'the-algorithm');
const src = path.resolve(__dirname, '..', 'SKILL.md');

if (!fs.existsSync(src)) {
  console.error(`✗ SKILL.md not found at ${src}`);
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
fs.copyFileSync(src, path.join(dest, 'SKILL.md'));

console.log(`✓ Installed SKILL.md → ${path.join(dest, 'SKILL.md')}`);
console.log('');
console.log('the-algorithm is ready. Invoke it in Claude Code with:');
console.log('  /the-algorithm');
console.log('');
console.log('It will also auto-trigger on decision-shaped prompts — feature requests,');
console.log('refactors, migrations, new tools/vendors/hires, process changes.');
