---
name: the-algorithm
description: Interactive decision framework adapted from Elon Musk's five-step method. Walks you through discrete AskUserQuestion prompts — one at a time — to find the real bottleneck, reason from first principles, and commit to the simplest reliable approach. Use BEFORE acting on any non-trivial decision — feature request, refactor, migration, new tool/vendor/hire, process change, meeting, policy, roadmap item. Skip for single-line typos or when the user has given explicit "just do it" instructions. Prevents over-engineering, scope creep, and premature automation. Five steps — 1) Question 2) Delete and Simplify 3) Optimise 4) Accelerate (get it working end-to-end) 5) Automate — strictly in order, with Steps 2↔3 looping as needed when Step 4 uncovers failures.
---

# The Algorithm

A gated decision framework adapted from Elon Musk's five-step production method. Instead of synthesizing an answer immediately, walk the user through **one discrete question at a time** using the `AskUserQuestion` tool. Each answer determines whether to proceed, loop back, or cut to the conclusion.

Default bias: **most decisions end at Step 2.** Steps 3, 4, and 5 only run when there are real tradeoffs, real integration risk, and real repetition to justify them.

The five steps:

1. **Question** the requirement — reason from first principles; what's the goal, gap, and the primitives on the critical path?
2. **Delete and Simplify** — remove anything unnecessary, find the minimum version of what remains, and name the tradeoffs.
3. **Optimise what remains** — now that redundant steps are gone, design how the surviving pieces interact; list options, tradeoffs, and a ranked set of experiments to try.
4. **Accelerate** — urgency is the point. Run the top experiment end-to-end as fast as possible (the skill can build and test it in a worktree on request). If it fails, **loop back between Steps 2 and 3** until it runs clean.
5. **Automate** — only after the thing works end-to-end, is as simple as possible, and is optimised.

## When to invoke

| Trigger | Run it? |
|---|---|
| Feature / product request, refactor proposal, "should we migrate" | **Yes** |
| Bug fix >10 lines, process or workflow change | **Yes** |
| New tool, vendor, hire, meeting, policy, roadmap item | **Yes** |
| Multiple feedback points arriving together | **Yes — batch mode** |
| Single-line typo, obvious fix, user said "just do it" | **Skip** |

## Operating rules

- **One question per turn.** Never list all questions up front. Fire one `AskUserQuestion`, read the answer, decide whether to ask the next one or jump ahead.
- **Branch aggressively.** If Step 1 returns "don't do", don't ask Step 2 or 3.
- **Loop freely between Steps 2 and 3.** If Step 4 uncovers a failure, go back — don't push through.
- **Free-text when needed.** Some questions don't have preset options. Ask in plain text — don't force multiple-choice when the answer space is open.
- **Never answer for the user.** If you find yourself guessing, stop and ask.
- **Restate answers back.** After each question, echo the answer in one line so the user can correct a misread before the next question.
- **Keep every prompt crisp.** The Q descriptions below are reference material for you — when you actually fire `AskUserQuestion`, the user-facing text should be one short sentence plus the options. Don't paste rationale, examples, or framing into the prompt. The user should feel like they're in a fast conversation, not filling out a 20-question form.
- **Structured pick + free-text escape.** Whenever you can name 2–4 concrete candidates for a question — even if its spec says "free-text" — fire `AskUserQuestion` with those candidates as options, plus a final "Other — I'll describe it" option. On the "Other" branch, invite a free-text reply in the normal chat. Plain prose with bullet points forces the user to type everything and loses the one-click pick UX. Rule of thumb: if you find yourself writing *"- A. … - B. … - C. … - D. Something else"* in prose, stop and re-emit as `AskUserQuestion`.

---

## Step 1 — Question the requirement (first principles)

Musk's framing: *requirements are always wrong, no matter how smart the source.* Force the user to reason from first principles — name the goal, name the gap, name the primitives on the critical path — and only *then* decide whether this request moves an actual primitive.

**Primitives** are the atomic, irreducible building blocks of the system at the relevant abstraction layer — things that cannot be decomposed further without changing what the system is. Examples: the data structure a feature needs, the network hop it depends on, the human step that can't be skipped. Everything else is composition and can be re-derived.

Run these in sequence. Stop as soon as a "don't do" or "record" verdict triggers.

### Q1.1 — What is the goal?

Free-text. Force a single clear sentence. If the user says "to fix X", push back: "*Fixing X* is a task, not a goal. What does fixing X enable?" Goals describe an end-state, not a task list.

### Q1.2 — What is the current state, and what's the gap to the goal?

Free-text. Two sentences: where things are now, and the specific gap between now and the goal. Not "it's broken" — *what exactly is missing or misaligned?*

### Q1.3 — What primitives sit on the critical path from current state → goal?

Free-text; ask for a short list (3–7 items). The prompt to fire: *"Primitives = the irreducible things on the critical path (data model, network hop, human consent step, etc.). Everything else is composition and can be deleted or re-derived. What are yours?"*

**Sharpening test — apply silently before accepting the answer.** A primitive must be generic enough that it would appear in *any valid implementation* of the goal, not just the current one. If an item names a specific vendor, tool, file path, repo, API, or library (e.g. "the valis-obsidian-sync GitHub repo", "the Telegram bot token", "the Postgres users table"), it is composition — the *role* that thing plays (transport, capture surface, data store) is the actual primitive.

If the list fails the test, push back **once** with a reframe prompt:

> That sounds like the current implementation. What role does each item play — what would any working version of the goal still need? Name the role, not the tool.

Then accept the corrected list.

**Why this matters.** Anchoring on "GitHub repo + sync script" as primitives locks Step 2 into tweaking them. Anchoring on "phone→Mac transport" opens up "skip GitHub entirely, write straight to iCloud" as a legitimate delete candidate. The abstraction level of your primitives determines what Step 2 can reach — too specific and Step 2 is handcuffed; too vague and you can't evaluate whether a request moves a primitive at all. Aim for the smallest set of roles that any valid implementation would require.

These are the things you will NOT delete in Step 2.

### Q1.4 — Does the request in front of us move one of those critical-path primitives?

`AskUserQuestion`:
- **A.** Now — it unblocks a primitive that is currently blocking progress
- **B.** Later — it's downstream of an on-path primitive but not blocking yet
- **C.** Off-path — adjacent / nice-to-have / not tied to any primitive in Q1.3
- **D.** Not sure

Branch:
- **A** → ask Q1.5
- **B** → **Verdict: Record for later.** "On-path but not blocking. Log in the backlog; revisit when an earlier primitive is unblocked."
- **C** → **Verdict: Don't do.** "Off-path work is the definition of scope creep — if it doesn't map to a primitive, deleting the request costs nothing." Skip to Conclusion.
- **D** → the skill cannot proceed until Q1.3 is sharp enough to map this request against. Loop back to Q1.3.

### Q1.5 — How often does this blocker actually hit?

`AskUserQuestion`:
- **A.** Common — daily or every user hits it
- **B.** Occasional — weekly or a subset of users
- **C.** Rare — a few times total, or one user
- **D.** One-time incident

Branch:
- **A / B** → proceed to Step 2
- **C / D** → **Verdict: Record for later.** "Rare problems don't justify permanent code/process, even on-path. Log and revisit if it recurs."

---

## Step 2 — Delete and Simplify

Delete anything unnecessary, find the smallest version of what remains, and name the tradeoffs *now* — not later. Tradeoffs surface here so Step 3 has something concrete to optimise against.

**Anchor:** the primitives named in Q1.3 are load-bearing. Never delete them. Everything composed *on top of* primitives is a candidate.

### Q2.1 — What existing thing, if removed, would make this problem disappear?

Push for aggressive candidates. If you have enough context to name 2–4 concrete delete candidates yourself, fire `AskUserQuestion` with them as options plus an "Other — I'll describe it" escape (per the Structured-pick operating rule). Otherwise ask free-text with these category prompts if the user is stuck:

- A fallback, a legacy code path, an auto-detection routine
- A config option nobody uses, a feature flag that's permanently on/off
- A process step, a meeting, an approval gate
- A vendor or tool used for one corner case

### Q2.2 — If you delete that thing, does the original problem still need solving?

`AskUserQuestion`:
- **A.** No — deleting solves it entirely
- **B.** Partially — it shrinks the problem
- **C.** Yes — the problem remains
- **D.** Nothing comes to mind

Branch:
- **A / B** → ask Q2.3
- **C** → skip to Q2.4 (nothing to delete; move straight to simplification)
- **D** → push back once: "Re-read your Q1.3 list — anything composed *on top of* those primitives is a candidate." Ask Q2.1 again. If still D → skip to Q2.4.

### Q2.3 — Does the delete candidate break any primitive from Q1.3?

`AskUserQuestion`:
- **A.** No — pure overhead sitting on top of the primitives
- **B.** Partially — it supports a primitive but isn't the primitive itself
- **C.** Yes — deleting it removes something in Q1.3

Branch:
- **A** → safe delete. If A from Q2.2 → Verdict: **Delete, don't add.** Skip to Conclusion. Otherwise continue to Q2.4.
- **B** → accept the delete but flag it. Continue to Q2.4.
- **C** → reject. Loop back to Q2.1 and find a different candidate. Never delete a primitive.

### Q2.4 — What's the simplest version of what remains?

`AskUserQuestion`:
- **A.** One config line / env var / flag flip
- **B.** A small function (<30 lines) in an existing file
- **C.** A new file or module in an existing service
- **D.** A new service, platform, or major refactor
- **E.** Not sure yet

Branch:
- **A / B** → minimal scope. Continue to Q2.5 only if there are obvious tradeoffs; otherwise skip Step 3 entirely.
- **C / D** → continue to Q2.5 — scope needs pressure.
- **E** → ask the user to sketch for 5 minutes, then retry.

### Q2.5 — What tradeoffs are on the table?

Free-text. List 2–4 tradeoffs you could make to shrink scope further or change character. Examples to prompt if stuck:
- Handle one case vs both
- Manual config vs auto-detection
- Ship as manual-run vs pre-automate
- Error message vs silent fallback
- Fewer primitives supported vs more

### Q2.6 — What are you NOT going to do?

Free-text. Force the user to name at least one thing being cut. If they can't, the scope is still too big — loop back to Q2.4.

End of Step 2. If Q2.4 = A/B and Q2.5 surfaced no meaningful tradeoffs, go straight to Conclusion — there's nothing to optimise.

---

## Step 3 — Optimise what remains

Step 2 removed redundancy. Step 3 asks: **given what's left, how should the surviving pieces interact?** What's the optimal workflow? What are the handoffs between parts (functions, services, humans)? You're not picking a single answer — you're generating options, naming their tradeoffs, and producing a ranked list of experiments to test.

Skip Step 3 entirely if Step 2 ended with a single atomic change (one config line, one small function) — there are no interactions to design.

### Q3.1 — How do the remaining pieces need to interact?

Free-text. Describe the flow: what runs first, what hands off to what, where humans are in the loop, where async boundaries sit, where state lives. The goal is a concrete picture of *how* the surviving pieces compose, not just *what* they are.

### Q3.2 — What are the options and tradeoffs for that interaction?

Generate 2–4 **alternative workflow variants** (based on Q3.1) — these are competing ways to do the same thing, not sub-questions of one approach. For every option, **explicitly tag it (a) "works now, even if brittle" or (b) "more robust long-term but higher initial effort"** — this works-now-vs-long-term axis is the key tension Step 4 will act on. Emit as an `AskUserQuestion` with each variant as a pick, plus an "Other — I'll describe a different approach" escape.

**Surface sub-questions, don't swallow them.** If after the main variant pick you have meaningful implementation choices (filename format, embed syntax, folder location, etc.), list them for the user with a recommended default for each — but do not skip them on their behalf. The user decides which deserve attention; your job is to make the choice visible and tag your default so they can accept-or-flip quickly.

Common axes if you need to generate genuine variants:
- Sync call vs async queue
- Eager computation vs lazy-on-demand
- Centralised service vs distributed responsibility
- Automated handoff vs human review gate
- Tight coupling vs explicit contract
- Single shared store vs per-component state

### Q3.3 — Rank them as experiments to try

Free-text. Produce a ranked list (2–4 items, most-promising first). Each entry should be:
- **Name:** short label for the variant
- **Hypothesis:** the one thing it assumes will hold true
- **Cheapest test:** the smallest thing you could run to find out if the hypothesis breaks
- **Signal:** what result would invalidate it
- **Mode:** "works-now (brittle)" OR "long-term robust" — which tradeoff this experiment buys

End of Step 3 with: (a) a concrete picture of the surviving workflow, (b) a ranked experiment list, and (c) each experiment tagged with its works-now-vs-long-term mode. Step 4 acts on the top-ranked experiment — pick brittle-but-fast when you need to learn, robust when the cost of rework is higher than the cost of delay.

---

## Step 4 — Accelerate (end-to-end works without fails)

Hard-gated: Steps 1–3 must have user-confirmed answers in this conversation.

> **Urgency is the point.** Get the simplest version running end-to-end as fast as humanly possible. Maniacal speed beats perfect planning.

Accelerate here means **get the thing running through the full flow with no failures.** Not a perf benchmark — an integration test against reality. Musk's version runs the full production line; yours runs the full flow.

### Q4.0 — How should we accelerate the top experiment?

`AskUserQuestion`:
- **A.** Build it now — create a worktree/branch, implement the minimal change, run E2E, report result
- **B.** I'll build it manually — give me the exact minimal change to make, then I'll come back with the result
- **C.** Not ready — I need to adjust the experiment first

Branch:
- **A** → proceed to the auto-build flow below, then apply Q4.1 to the result
- **B** → emit one concrete paragraph naming exactly what to change (files, lines, config keys), citing the Q1.3 primitives, the Q3.3 hypothesis, and the Q2.6 cut-scope. Then wait at Q4.1.
- **C** → loop back to Step 3. Don't ship an experiment the user isn't confident in.

**Auto-build flow (Q4.0 = A):**
1. Create an isolated workspace. Prefer `git worktree add ../worktrees/accel-<slug>` where `<slug>` is a short kebab-case version of the experiment name; fall back to a branch `accel-<slug>` if worktrees aren't available. Tell the user which you chose.
2. Implement ONLY the minimal change from Q2.4. Do not scaffold, do not add tests beyond what E2E needs, do not pre-build for the losing experiments. If you find yourself writing setup code beyond the change, stop and ask.
3. Commit with a message that references: the primitives from Q1.3, the tradeoff mode from Q3.3 (works-now vs long-term), and the hypothesis the experiment is testing.
4. Run the full E2E flow — test suite, manual run, or integration test as appropriate for the codebase.
5. Surface pass/fail and relevant logs/artifacts immediately.
6. If the run fails, ask whether to delete the branch/worktree before looping back to Step 2↔3.

**Guardrails that MUST hold in branch A:**
- Explicit user consent was captured via Q4.0 = A — do not infer consent from anything else.
- Scope is limited to the minimal change from Q2.4. Enforce this hard — rework-creep kills the urgency that makes this step work.
- Never push the branch, open a PR, or deploy without a separate user confirmation. Auto-build is for local verification, not shipping.
- If the experiment fails, the default offer is to delete the branch and loop back — do not polish a failing approach.

### Q4.1 — Did every Q1.3 primitive get exercised AND did the user confirm the final outcome with their own eyes?

**E2E does NOT mean "the code I shipped ran."** It means every primitive from Q1.3 was traversed end-to-end *and* the final user-observable outcome (the goal stated in Q1.1) is confirmed by the user directly. Intermediate signals — webhook fired, CI green, commit landed, test passed, API returned 200 — are necessary but not sufficient. A pre-existing broken hop downstream of your change still fails Step 4; ownership extends to the whole chain, not just the segment you modified.

**Before firing the AskUserQuestion**, print a verification checklist back to the user: one row per Q1.3 primitive, with "Verified how?" filled in for each. A primitive is only ticked if there is explicit evidence it ran *in this run* — never inferred from upstream success, never "should be fine", never "worked yesterday". If any row reads "assumed" or "not checked" — stop and go verify it (or ask the user to) before firing Q4.1.

Only once the checklist is complete, fire `AskUserQuestion`:

- **A.** Yes — every primitive ticked with direct evidence, AND I confirmed the final outcome with my own eyes
- **B.** Some segments passed but the final outcome isn't observable yet / a hop broke / a primitive wasn't verified
- **C.** Not yet — haven't run the full flow

Branch:
- **A** → proceed to Step 5
- **B** → **LOOP BACK between Steps 2 and 3.** A broken hop IS the experiment's result — do not paper over it. Even if the break is pre-existing or downstream of the change you made, it still fails E2E. Delete/simplify what's blocking the chain, re-optimise, re-run. If the top experiment's hypothesis invalidated cleanly, try the next-ranked one.
- **C** → stop. Run it. Return with the result.

**Hard rule:** the skill NEVER self-declares pass. The confirmation must come from the user's own observation of the final outcome described in Q1.1. "Tests passed" emitted by Claude is not a pass. Telemetry is not a pass. Only the user's eyes on the goal = pass.

Common failure modes that trigger the 2↔3 loop:
- A component turned out to need more than its simplest form → Q2.4 was too aggressive, pick differently
- A primitive was missing from Q1.3 → loop all the way back to Step 1
- The top experiment's hypothesis broke → drop it, re-rank, try the next-most-promising handoff from Q3.3
- The design works but is too brittle → Step 2 to cut scope, Step 3 to re-generate workflow options
- **A downstream hop you didn't build was already broken** → fix or route around it; your E2E isn't done until the chain runs clean from capture to user-observed outcome

---

## Step 5 — Automate

Three-gate hard-enforcement: automate ONLY if **all three** are true in this conversation:

1. The thing works end-to-end (Q4.1 = A)
2. It's as simple as possible (Step 2 ran; Q2.4 chosen and Q2.6 named a cut)
3. It's optimised (Step 3 ran, OR skipped intentionally because there were no real tradeoffs)

If ANY of the three is unchecked → refuse and loop back to the failing gate.

### Q5.1 — Has the manual version run flawless E2E for at least 3 consecutive runs?

`AskUserQuestion`:
- **A.** Yes — ≥3 flawless runs
- **B.** No — fewer than 3 runs, or at least one failure

If **B**: **do not automate.** Run manually until stable. Automating an unstable flow compounds the failures at machine speed.

If **A**: proceed to Conclusion with the automation plan.

---

## Conclusion format

Always end with exactly this block:

```markdown
### Decision
[Do | Don't do | Delete instead | Record for later | Loop back to Step N]

### Why (one sentence)
...

### Next action (concrete, one or two bullets)
- ...
```

---

## Feedback batch mode

Trigger when the user pastes ≥3 feedback points at once.

1. **Number the points.** Echo them back as a numbered list.
2. **For each point, run Q1.4 + Q1.5 only** — the primitives map from Q1.3 is shared across points.
3. **Build a verdict table:**

   ```
   | # | Point | Verdict | Why |
   |---|-------|---------|-----|
   | 1 | ...   | Do      | ... |
   | 2 | ...   | Don't   | ... |
   ```

4. Only points with verdict **Do** continue to Step 2 (sequentially, one question at a time).
5. Typical result: 5 points → 1–2 actionable.

---

## Anti-patterns to flag during questioning

| Pattern in their answer | Flag |
|---|---|
| "Just in case…" / "for future flexibility" | "No one has asked for this yet — Step 1 verdict should be *Record*, not *Do*." |
| "We need to auto-detect…" | "One config line almost always beats detection. Revisit Q2.4." |
| "Let's automate this" (before Steps 1–4) | "Automate is Step 5. What are the primitives? Has it run end-to-end?" |
| "Add a review/approval step…" | "Reacting to one incident with permanent process. Re-check Q1.5 frequency." |
| "Hire a new role to handle X…" | "Can the work be simplified in Step 2 so it doesn't need a role?" |
| "Switch from Tool A to Tool B…" | "Fix Tool A's config before migrating. Migration cost is almost always underestimated." |

---

## Example session (abbreviated)

> User: *"Should we add a caching layer to the API?"*
>
> Q1.1 Goal → *"Page renders in <200ms."*
> Q1.2 Gap → *"We're at 900ms; the DB round-trips dominate."*
> Q1.3 Primitives → *"User model, session store, product list query."*
> Q1.4 On-path? → **A. Now** (DB round-trips are blocking the goal)
> Q1.5 Frequency → **A. Common**
> Q2.1 Delete candidate → *"We're re-fetching the same product list on every render."*
> Q2.2 Does deletion solve it? → **A. Yes** → Q2.3
> Q2.3 Breaks a primitive? → **A. No** (the re-fetch is overhead on top of the query)
>
> **Conclusion:** Delete the redundant fetches. Caching layer not needed.

---

## Pre-Action Checklist

- [ ] Step 1 — goal, gap, primitives, on-path, frequency all answered
- [ ] Step 2 — delete candidate considered; simplest version chosen; tradeoffs and cuts named
- [ ] Step 3 — ran only if Step 2 left multiple pieces with interactions to design; produced a workflow picture + ranked experiments, or explicitly skipped
- [ ] Step 4 — ran only if reaching for automation or integration; loop-back used if E2E failed
- [ ] Step 5 — ran only if all three gates are satisfied
- [ ] Final Conclusion block present with Decision, Why, Next action
- [ ] No question was batched; no answer was guessed
