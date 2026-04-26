# Changelog

All notable changes to `the-algorithm` are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Added
- `CONTRIBUTING.md`, `CHANGELOG.md`, `.gitignore` for public-launch hygiene.

## [1.3.1]

### Added
- `auto-algorithm` sister skill — runs Step 1 interactively, Steps 2–5 autonomously.
- Trace-feeding block in Step 4 loop-back so failure context flows back into Step 2/3 cleanly.

### Changed
- Step 2 unified as **Minimize** (delete + simplify in one pass) rather than two separate steps.
- Step 3 slimmed to three questions; "Optimise what remains" is sharper and shorter.
- Q2.1 reframed: delete candidates surface as clusters, one per pass.
- Skip-when-obvious defaults extended to Steps 2–4.

### Fixed
- Step 4 now verifies every primitive end-to-end and is user-observed (no agent self-declaring success).
- Hard rule: every question is `AskUserQuestion` — no pure free-text prompts.
- When enumerating candidates, the skill fires `AskUserQuestion`, not prose.

## [1.1.0]

### Added
- `publish-the-algorithm` maintainer skill in `.claude/skills/`.
- Hypothesis filter on Q3.2 against over-asking optimisation sub-questions.
- Sharpened Q1.3 primitives guidance: role, not tool.

## [1.0.0]

### Added
- Auto-upgrade via Claude Code `SessionStart` hook — `npx the-algorithm@latest` runs in the background at session start so the latest `SKILL.md` is always in place.
- `npx the-algorithm` one-command install with the option to skip or remove the hook.
- Curl install path for non-Node setups.

## [0.1.0]

### Added
- Initial release. Five-step interactive decision framework adapted from Elon Musk's production method, packaged as a Claude Code skill.
