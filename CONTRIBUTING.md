# Contributing to the-algorithm

Thanks for the interest. The bar for changes is high: this skill is opinionated by design — its value comes from the specific shape of its five steps and discovery questions, not from being maximally accommodating.

## How to propose a change

1. **Open an issue first** for anything beyond a typo or wording fix. Describe the failure mode you've hit on a real decision and the change you're proposing.
2. **Fork, branch, and PR** against `main`. Keep PRs small and self-contained.
3. **Keep the YAML frontmatter intact.** `name` and `description` are the trigger surface — changes there change which prompts invoke the skill.
4. **Test the change before opening the PR.** Drop your edited `SKILL.md` into `~/.claude/skills/the-algorithm/` and run it on a real decision (the more boring the better — production tooling, real refactors). Paste the trace into the PR description.

## What good changes look like

- A failure mode the current procedure misses, with a worked example showing how the change catches it.
- Tightening of `AskUserQuestion` candidate generation — better defaults that get accepted with one click more often.
- Sharpening Steps 2↔3 loop-back logic when Step 4 uncovers failure.
- New worked examples that make a step's intent clearer.

## What probably won't land

- Adding a sixth step. The five-step shape is deliberate.
- Reordering steps. Step order is the constraint that prevents premature automation.
- Softening the "skip-when-obvious" defaults — the skill is meant to be one click for routine cases.
- Free-text prompts where there's currently a multi-choice `AskUserQuestion`.

## Releasing

Releases are cut by the maintainer using the `publish-the-algorithm` Claude Code skill in [`.claude/skills/publish-the-algorithm/`](.claude/skills/publish-the-algorithm/SKILL.md). Contributors don't need to bump versions in PRs — the maintainer handles version + changelog at release time.

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
