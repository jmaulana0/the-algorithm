# The Algorithm

> Interactive decision framework for AI coding agents, adapted from Elon Musk's five-step production method.

Walks you through **one discrete question at a time** — find the goal, the gap, the primitives on the critical path — then deletes, simplifies, optimises, and accelerates until the thing is running end-to-end. Prevents over-engineering, scope creep, and premature automation.

Designed for Claude Code, works with any agent that supports interactive multi-choice prompts.

## The five steps

1. **Question** — reason from first principles; what's the goal, gap, and primitives on the critical path?
2. **Delete and Simplify** — remove anything unnecessary, find the minimum version of what remains, and name the tradeoffs.
3. **Optimise what remains** — design how the surviving pieces interact; list options, tradeoffs, and a ranked set of experiments to try.
4. **Accelerate** — urgency is the point. Run the top experiment end-to-end as fast as possible (the skill can build and test it in a worktree on request). If it fails, loop back between Steps 2 and 3.
5. **Automate** — only after the thing works end-to-end, is as simple as possible, and is optimised.

**Strictly in order.** Skipping ahead is the #1 Musk anti-pattern.

## Install

### Claude Code — one command

```bash
npx the-algorithm
```

That's it. This:

1. Installs `SKILL.md` into `~/.claude/skills/the-algorithm/`
2. Adds a **Claude Code `SessionStart` hook** that silently refreshes the skill from npm at the start of every future session — so updates flow automatically without you ever re-running the installer.

Claude Code picks up the skill on decision-shaped prompts, or invoke it explicitly:

```
/the-algorithm         # interactive — one AskUserQuestion per turn
/auto-algorithm        # autonomous — Step 1 interactive, Steps 2–5 auto-decided
```

`auto-algorithm` is a sister skill installed alongside `the-algorithm`. It runs Step 1 interactively (goal, gap, primitives — where your judgment is load-bearing) and then executes Steps 2 (Delete), 3 (Optimise), 4 (Accelerate / build E2E), and 5 (Automate) autonomously, making every decision itself based on your Step 1 answers and repo context. Use it when you want the full five-step treatment without clicking through every question. It still refuses to self-declare E2E pass — Q4.1 always comes back to you.

[![npm version](https://img.shields.io/npm/v/the-algorithm.svg?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/the-algorithm)

### Auto-upgrade

By default the installer wires a `SessionStart` hook that runs `npx --yes the-algorithm@latest --quiet --no-hook` in the background at every new Claude Code session. The backgrounded `&` means it never slows session startup; the next session serves the newest `SKILL.md`.

Flags:

```bash
npx the-algorithm                    # install skill + add auto-upgrade hook (default)
npx the-algorithm --no-hook          # install skill only; no hook
npx the-algorithm --uninstall-hook   # remove the hook (skill stays)
npx the-algorithm --uninstall        # remove skill and hook
```

The hook is idempotent — re-running `npx the-algorithm` won't duplicate it.

### Alternatives

**No Node? Use curl:**

```bash
curl -fsSL https://raw.githubusercontent.com/jmaulana0/the-algorithm/main/install.sh | bash
```

**Prefer a manual clone:**

```bash
git clone https://github.com/jmaulana0/the-algorithm.git
cd the-algorithm
./install.sh
```

All paths install the same file to the same place. Override the install location with `THE_ALGORITHM_DEST=/some/path`.

### Other agents (Cursor, Windsurf, Cline, Codex, etc.)

Copy the content of [`SKILL.md`](SKILL.md) (minus the YAML frontmatter) into your agent's custom instructions or rules file:

- **Cursor:** paste into `.cursorrules`
- **Windsurf:** paste into `.windsurfrules`
- **Cline:** paste into `.clinerules`
- **Codex:** paste into `AGENTS.md`
- **Anything else:** paste into the system prompt

### Manual install (any Claude Code setup)

```bash
mkdir -p ~/.claude/skills/the-algorithm
curl -fsSL https://raw.githubusercontent.com/jmaulana0/the-algorithm/main/SKILL.md \
  -o ~/.claude/skills/the-algorithm/SKILL.md
```

## How it works

On invocation, the skill fires **one `AskUserQuestion` per turn**, branching based on your answer. Most runs stop at Step 2 because the answer is "delete the thing, don't add one." Steps 3, 4, and 5 only fire when there are genuine tradeoffs, integration risk, or validated repetition.

Key design choices:

- **Primitives-first.** Step 1 forces you to name the irreducible things on the critical path *before* any proposal is accepted — so "off-path" requests get rejected automatically.
- **Loop between Steps 2 and 3.** When Step 4 reveals an end-to-end failure, the skill loops back to delete/simplify rather than polishing a broken approach.
- **Urgency is the point.** Step 4 offers to auto-build the top experiment in a git worktree, commit it, and run it E2E — maniacal speed beats perfect planning.
- **Three-gate automation.** Step 5 refuses unless Step 4 succeeded, Step 2 simplified, and Step 3 optimised (or was skipped intentionally).

See [`SKILL.md`](SKILL.md) for the full spec.

## When to use it

| Decision | Invoke? |
|---|---|
| Feature / product request, refactor proposal, migration | **Yes** |
| Bug fix >10 lines, process or workflow change | **Yes** |
| New tool, vendor, hire, meeting, policy, roadmap item | **Yes** |
| Multiple feedback points arriving together | **Yes — batch mode** |
| Single-line typo, obvious fix, user said "just do it" | **Skip** |

## Credit

Based on Elon Musk's five-step method (described publicly in 2021 Starbase tours with Everyday Astronaut). Interactive adaptation and skill format iterated in conversation with Claude Code.

## Maintainer notes

Shipping updates to the npm package is handled by the **`publish-the-algorithm`** Claude Code skill, included in this repo under [`.claude/skills/publish-the-algorithm/`](.claude/skills/publish-the-algorithm/SKILL.md). It walks through version bump, 2FA-gated `npm publish`, tag push, and post-release verification. The skill lives in the repo so the process is reproducible on any machine with a clone.

```bash
# from the repo root:
cp -r .claude/skills/publish-the-algorithm ~/.claude/skills/
# then in Claude Code:
/publish-the-algorithm
```

The skill file is excluded from npm releases via the `files` whitelist in `package.json` — end users never see it.

## License

[MIT](LICENSE)
