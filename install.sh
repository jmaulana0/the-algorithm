#!/usr/bin/env bash
# the-algorithm — install script
# Installs the skill into ~/.claude/skills/the-algorithm/SKILL.md
# Works both locally (run from cloned repo) and via `curl | bash`.

set -euo pipefail

DEST_DIR="${THE_ALGORITHM_DEST:-$HOME/.claude/skills/the-algorithm}"
SKILL_URL="https://raw.githubusercontent.com/jmaulana0/the-algorithm/main/SKILL.md"

mkdir -p "$DEST_DIR"

if [ -f "$(dirname "$0")/SKILL.md" ]; then
  cp "$(dirname "$0")/SKILL.md" "$DEST_DIR/SKILL.md"
  echo "✓ Installed SKILL.md from local checkout → $DEST_DIR/SKILL.md"
elif [ -f "./SKILL.md" ]; then
  cp "./SKILL.md" "$DEST_DIR/SKILL.md"
  echo "✓ Installed SKILL.md from current directory → $DEST_DIR/SKILL.md"
else
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$SKILL_URL" -o "$DEST_DIR/SKILL.md"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$SKILL_URL" -O "$DEST_DIR/SKILL.md"
  else
    echo "error: need curl or wget to fetch SKILL.md" >&2
    exit 1
  fi
  echo "✓ Downloaded SKILL.md → $DEST_DIR/SKILL.md"
fi

echo ""
echo "the-algorithm is ready. Invoke it in Claude Code with:"
echo "  /the-algorithm"
echo ""
echo "It will also auto-trigger on decision-shaped prompts — feature requests,"
echo "refactors, migrations, new tools/vendors/hires, process changes."
