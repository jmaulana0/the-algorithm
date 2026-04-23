---
name: publish-the-algorithm
description: Ship a new release of the-algorithm skill to npm (https://www.npmjs.com/package/the-algorithm) and push tags to GitHub. Use when SKILL.md or any other shipped file has been edited and `npx the-algorithm` should start serving the new version. Walks through repo-state check, version bump choice (patch/minor/major), npm publish with 2FA prompt, tag push, and post-release verification. Triggers on "publish the-algorithm", "release the-algorithm", "ship the-algorithm update", "update the-algorithm on npm", "the-algorithm release".
---

# Publish the-algorithm

A runbook for releasing updates to the `the-algorithm` npm package.

- **npm:** https://www.npmjs.com/package/the-algorithm
- **GitHub:** https://github.com/jmaulana0/the-algorithm
- **npm account:** `jmaulana`

This skill walks through the common case: SKILL.md (or another shipped file) has been edited, committed, and pushed to GitHub — now `npx the-algorithm` needs to serve the new content.

## Prerequisites (verify once)

These are one-time setup. If they're already true, skip ahead.

### npm account + login

```bash
npm whoami
```

Expected: `jmaulana`. If `npm whoami` prints `ENEEDAUTH` or returns a different user, run:

```bash
npm login   # opens browser auth; complete 2FA in your authenticator app
```

### 2FA authenticator ready

`npm publish` requires a one-time code. Have the TOTP entry open in your authenticator (1Password / Authy / Google Authenticator / etc.) before starting Step 5 — codes rotate every 30 seconds.

### Working directory

```bash
cd ~/path/to/the-algorithm   # wherever the clone of jmaulana0/the-algorithm lives
ls SKILL.md package.json     # both must exist; bail if not
```

---

## Release flow

Run these in order. **One question per turn.** Wait for the user's answer before moving on.

### Step 1 — Confirm repo state

```bash
git status --short
git log --oneline -3
```

Verify:
- Working tree is clean, OR all intended changes are staged for the release
- `HEAD` is the commit that should go out

If there are uncommitted changes, ask (one `AskUserQuestion`):

> Working tree has uncommitted changes. How should we handle?
- **A.** Commit them now, then release
- **B.** The changes are intentionally uncommitted — include them in the release as part of the version bump
- **C.** Abort — user will sort out the tree first

### Step 2 — Pick the version bump

`AskUserQuestion`:

> What kind of change is in this release?
- **A.** Patch — wording tweaks, typo fixes, small clarifications (1.0.0 → 1.0.1)
- **B.** Minor — new questions, new branches, new features that don't break existing flows (1.0.0 → 1.1.0)
- **C.** Major — restructured steps, renamed fields, breaking changes to the flow (1.0.0 → 2.0.0)
- **D.** Don't bump — cancel the release

If **D**: stop. Report that no release was made.

Otherwise run exactly one of:

```bash
npm version patch   # A
npm version minor   # B
npm version major   # C
```

This auto-updates `package.json`, creates a release commit, and tags it (e.g., `v1.0.1`). Echo the new version number back to the user in one line before proceeding.

### Step 3 — Dry-run the publish

```bash
npm pkg fix          # catches any package.json format issues
npm publish --dry-run
```

Expected tarball contents — exactly 6 files:
- `LICENSE`
- `README.md`
- `SKILL.md`
- `bin/cli.js`
- `install.sh`
- `package.json`

If anything unexpected appears (e.g., `.git/`, `node_modules/`, `.claude/`, test files), **stop**. Fix the `files` field in `package.json` first — never ship garbage to users.

### Step 4 — Get the 2FA code

Ask in free-text (don't use `AskUserQuestion` — this is a single typed value):

> Enter your 6-digit npm 2FA code from your authenticator.

Store the answer; don't echo it back in logs.

### Step 5 — Publish

Run on **one line** (putting `--otp=...` on a second line causes zsh to treat it as a separate command — silent failure mode that looks like it worked):

```bash
npm publish --access public --otp=<code>
```

Success pattern: `+ the-algorithm@<new-version>` in the output.

Failure modes:
- **`EOTP`** — code was wrong or expired. Loop back to Step 4 for a fresh code.
- **`E403 You do not have permission`** — not logged in as `jmaulana`. Run `npm whoami` and re-login.
- **`403 Cannot publish over previously published version`** — the version already exists on npm (likely Step 2 was skipped). Run another `npm version patch` and retry.
- **Anything else** — surface the error verbatim; do not retry blindly.

### Step 6 — Push tags to GitHub

```bash
git push --follow-tags
```

`--follow-tags` is load-bearing — without it, the tag from `npm version` stays local and the GitHub release is missing.

### Step 7 — Verify the published version

Prove the new version is live AND that `npx`'s cache gets refreshed properly:

```bash
rm -rf /tmp/algo-verify
THE_ALGORITHM_DEST=/tmp/algo-verify npx --yes the-algorithm@latest 2>&1 | tail -6
head -4 /tmp/algo-verify/SKILL.md
rm -rf /tmp/algo-verify
```

Check:
- Install message prints `✓ Installed SKILL.md → /tmp/algo-verify/SKILL.md`
- The first four lines of SKILL.md match what you just published (frontmatter and title)

---

## Conclusion format

Always end with:

```markdown
### Shipped
the-algorithm@<version>

### Links
- npm: https://www.npmjs.com/package/the-algorithm
- GitHub tag: https://github.com/jmaulana0/the-algorithm/releases/tag/v<version>

### Next action
Users running `npx the-algorithm` will pull the new version automatically on their next run.
```

---

## Common failures (quick reference)

| Symptom | Cause | Fix |
|---|---|---|
| `EOTP` | OTP wrong / expired | Fresh code, retry Step 5 |
| `E403 permission` | Wrong npm account | `npm whoami`, re-login |
| `403 over previously published` | Version collision | Another `npm version patch` |
| `bin[the-algorithm] was invalid` warning | `./` prefix in bin path | `npm pkg fix`, commit, retry |
| `npx the-algorithm` still serves old version | npx cache on user's machine | They should run `npx --yes the-algorithm@latest` once |
| Shell split `--otp` onto own line | Line break in pasted command | Re-run with single-line command |

---

## Out of scope

- **First-time setup** (creating npm account, enrolling 2FA). One-off flow — do it manually once, then this skill covers every release after.
- **Migrating to scoped name** (`the-algorithm` → `@jmaulana0/the-algorithm`). Only relevant if there's ever a name dispute; would need a separate skill.
- **Deprecation / unpublish.** npm restricts unpublish to <72 hours after initial release. For "don't use this version" messaging, use `npm deprecate the-algorithm@<version> "<reason>"` instead — that's a separate operation, not a release.

---

## Pre-action checklist (the skill has done its job if all are true)

- [ ] `npm whoami` returned `jmaulana`
- [ ] Repo state was confirmed before Step 2
- [ ] Version bump type was chosen explicitly via `AskUserQuestion` (no default)
- [ ] Dry-run tarball was inspected, exactly 6 files shipped
- [ ] Publish completed with `+ the-algorithm@<version>` line
- [ ] `git push --follow-tags` ran
- [ ] `npx --yes the-algorithm@latest` verified in a clean temp dir
- [ ] Conclusion block printed with version, npm URL, GitHub tag URL
