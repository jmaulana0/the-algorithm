#!/usr/bin/env bash
# the-algorithm — install script
# Installs the-algorithm + auto-algorithm sister skill into ~/.claude/skills/.
# Works both locally (run from cloned repo) and via `curl | bash`.

set -euo pipefail

SKILLS_ROOT_DEFAULT="$HOME/.claude/skills"
if [ -n "${THE_ALGORITHM_DEST:-}" ]; then
  DEST_DIR="$THE_ALGORITHM_DEST"
  SKILLS_ROOT="$(dirname "$DEST_DIR")"
else
  SKILLS_ROOT="$SKILLS_ROOT_DEFAULT"
  DEST_DIR="$SKILLS_ROOT/the-algorithm"
fi
AUTO_DIR="$SKILLS_ROOT/auto-algorithm"

SKILL_URL="https://raw.githubusercontent.com/jmaulana0/the-algorithm/main/SKILL.md"
AUTO_SKILL_URL="https://raw.githubusercontent.com/jmaulana0/the-algorithm/main/auto-algorithm/SKILL.md"

mkdir -p "$DEST_DIR" "$AUTO_DIR"

SCRIPT_DIR="$(dirname "$0")"

# the-algorithm
if [ -f "$SCRIPT_DIR/SKILL.md" ]; then
  cp "$SCRIPT_DIR/SKILL.md" "$DEST_DIR/SKILL.md"
  echo "✓ Installed the-algorithm (local) → $DEST_DIR/SKILL.md"
elif [ -f "./SKILL.md" ]; then
  cp "./SKILL.md" "$DEST_DIR/SKILL.md"
  echo "✓ Installed the-algorithm (cwd) → $DEST_DIR/SKILL.md"
else
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$SKILL_URL" -o "$DEST_DIR/SKILL.md"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$SKILL_URL" -O "$DEST_DIR/SKILL.md"
  else
    echo "error: need curl or wget to fetch SKILL.md" >&2
    exit 1
  fi
  echo "✓ Downloaded the-algorithm → $DEST_DIR/SKILL.md"
fi

# auto-algorithm
if [ -f "$SCRIPT_DIR/auto-algorithm/SKILL.md" ]; then
  cp "$SCRIPT_DIR/auto-algorithm/SKILL.md" "$AUTO_DIR/SKILL.md"
  echo "✓ Installed auto-algorithm (local) → $AUTO_DIR/SKILL.md"
elif [ -f "./auto-algorithm/SKILL.md" ]; then
  cp "./auto-algorithm/SKILL.md" "$AUTO_DIR/SKILL.md"
  echo "✓ Installed auto-algorithm (cwd) → $AUTO_DIR/SKILL.md"
else
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$AUTO_SKILL_URL" -o "$AUTO_DIR/SKILL.md"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$AUTO_SKILL_URL" -O "$AUTO_DIR/SKILL.md"
  else
    echo "error: need curl or wget to fetch auto-algorithm SKILL.md" >&2
    exit 1
  fi
  echo "✓ Downloaded auto-algorithm → $AUTO_DIR/SKILL.md"
fi

echo ""
echo "Ready. Invoke in Claude Code with:"
echo "  /the-algorithm         # interactive"
echo "  /auto-algorithm        # autonomous Steps 2–5"
echo ""
echo "the-algorithm auto-triggers on decision-shaped prompts. auto-algorithm is opt-in."
