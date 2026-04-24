---
name: the-algorithm
description: Interactive decision framework adapted from Elon Musk's five-step method. Walks you through discrete AskUserQuestion prompts — one at a time — to find the real bottleneck, reason from first principles, and commit to the simplest reliable approach. Use BEFORE acting on any non-trivial decision — feature request, refactor, migration, new tool/vendor/hire, process change, meeting, policy, roadmap item. Skip for single-line typos or when the user has given explicit "just do it" instructions. Prevents over-engineering, scope creep, and premature automation. Five steps — 1) Question 2) Minimize (delete + simplify as one — smallest version that still closes the gap) 3) Optimise how the surviving pieces fit together 4) Accelerate (get it working end-to-end) 5) Automate — strictly in order, with Steps 2↔3 looping as needed when Step 4 uncovers failures.
---

# The Algorithm

A gated decision framework adapted from Elon Musk's five-step production method. Instead of synthesizing an answer immediately, walk the user through **one discrete question at a time** using the `AskUserQuestion` tool. Each answer determines whether to proceed, loop back, or cut to the conclusion.

Default bias: **most decisions end at Step 2.** Steps 3, 4, and 5 only run when there are real tradeoffs, real integration risk, and real repetition to justify them.

The five steps:

1. **Question** the requirement — reason from first principles; what's the goal, gap, and the primitives on the critical path?
2. **Minimize** — find the smallest version of this that still runs end-to-end. Delete is the aggressive end of that spectrum; replacing something with a smaller form is the rest. If the minimized version fully closes the gap, you stop here.
3. **Optimise how the surviving pieces fit together** — design interactions, generate workflow variants, rank them as experiments.
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
- **Never answer for the user.** If you find yourself guessing, stop and ask.
- **Restate answers back.** After each question, echo the answer in one line so the user can correct a misread before the next question.
- **Keep every prompt crisp.** The Q descriptions below are reference material for you — when you actually fire `AskUserQuestion`, the user-facing text should be one short sentence plus the options. Don't paste rationale, examples, or framing into the prompt. The user should feel like they're in a fast conversation, not filling out a 20-question form.
- **Hard rule — every question is an `AskUserQuestion` with options. No pure free-text prompts, ever.** The final option is always **"Other — I'll describe"**, which on selection invites a plain-text reply in the next turn. Zero exceptions: goals, gaps, primitives, delete candidates, workflow shapes, tradeoffs, experiments — all of them get 3–4 candidate picks plus the Other escape. If the answer space is genuinely open, *you* generate the candidates from the context the user has already given you (invocation text, prior Q answers, files in the repo). Pure free-text means the user stares at a wall of prose and has to type — that's too much cognitive load when 3 clicks plus an escape hatch work better. If you truly cannot propose candidates, ask one narrow clarifying question that itself has options (e.g. "Is this about [domain A], [domain B], or [domain C]?") — don't fall back to a blank prompt.
- **Always make the first option your recommendation.** Every `AskUserQuestion` must order candidates so that the one *you* would pick — based on Step 1 goal, primitives, and prior answers — is option **A**, and the label reads like "A. **(recommended)** …". The user accepts with one click, scans the alternatives, or picks "Other". Never show a neutral list where the user has to infer your view — being opinionated up front is what makes the skill fast. The rule applies even when the user ultimately disagrees; the goal is to surface your judgment so they can react to it, not to hide behind balance.
- **Skip obvious answers in Steps 2–4.** When a question in Step 2, 3, or 4 has a single clearly correct answer — one obvious minimization pick with no real competitors, one obvious workflow shape, one obvious way to verify E2E — do NOT fire the `AskUserQuestion`. State the answer as an assumption inline and proceed: *"**Assuming Q2.1 = A. No-deletion minimum implementation** (`useNotion` flag flip). Proceeding unless you stop me."* The user can interrupt at any time; this just saves click-fatigue on non-decisions. The bar for skipping is high: *no meaningful alternatives exist*. If there are two plausible answers, always ask. **Step 1 never auto-advances** — the thinking layer always fires; that's where the skill's value lives. Steps 2–4 are for executing on Step 1's thinking, and executing should be fast when the path is clear.
- **Complete the work when you can — do not hand it back.** Once Steps 1–3 have produced a clear goal, primitive list, minimization pick, and chosen experiment, the default behaviour in Step 4 is *you build it*. Do not ask the user to implement the change themselves unless (a) the tools available to this session genuinely cannot make the edit (e.g. no write access, no shell, no browser for the specific surface), or (b) the user has explicitly asked to drive manually. "I could build it but asking is safer" is not a reason — it's friction. If Steps 1–3 left ambiguity that makes it impossible to execute without further decisions, loop back to Step 3 and resolve the ambiguity; do not push the execution onto the user as a workaround for your own uncertainty. The skill exists to produce an outcome, not a shopping list.

---

## Step 1 — Question the requirement (first principles)

Musk's framing: *requirements are always wrong, no matter how smart the source.* Force the user to reason from first principles — name the goal, name the gap, name the primitives on the critical path — and only *then* decide whether this request moves an actual primitive.

**Primitives** are the atomic, irreducible building blocks of the system at the relevant abstraction layer — things that cannot be decomposed further without changing what the system is. Examples: the data structure a feature needs, the network hop it depends on, the human step that can't be skipped. Everything else is composition and can be re-derived.

Run these in sequence. Stop as soon as a "don't do" or "record" verdict triggers.

### Q1.1 — What is the goal?

`AskUserQuestion` with 3–4 candidate goals you've inferred from the user's invocation, each phrased as a one-sentence end-state (not a task). Plus an **"Other — I'll describe"** option. If the user says "to fix X", flag in your candidates that fixing X is a task — and propose what end-states that fix enables.

### Q1.2 — What is the current state, and what's the gap to the goal?

`AskUserQuestion` with 3–4 candidate "current state + gap" descriptions you've inferred from the repo / context, each a single sentence pair. Plus **"Other — I'll describe"**.

### Q1.3 — What primitives sit on the critical path from current state → goal?

`AskUserQuestion` offering 3–4 candidate primitive sets (each set is a short list of 3–7 items). The prompt to fire: *"Primitives = the irreducible things on the critical path (data model, network hop, human consent step, etc.). Everything else is composition and can be deleted or re-derived."* Plus **"Other — I'll describe"**.

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

## Step 2 — Minimize (delete + simplify as one)

Musk's original labels the second and third steps "delete" and "simplify" separately. In practice they answer one question: **what's the smallest version of this that still runs end-to-end?** Delete is the aggressive end of that spectrum; replacing something with a smaller form is the rest of it. Treat them as one loop.

**Anchor:** the primitives named in Q1.3 are load-bearing. Never delete a primitive. Anything composed *on top of* the primitives is a candidate for removal OR for replacement with a smaller form.

**Default bias:** most decisions end here. Steps 3, 4, and 5 only run when minimization didn't fully close the Q1.2 gap AND the surviving scope has real tradeoffs, integration risk, or repetition to justify continuing.

### Q2.1 — What's the smallest version that still closes the Q1.2 gap?

`AskUserQuestion` with 3–4 candidates ordered delete-first. The spectrum to cover, in this order:

1. **Biggest safe deletion cluster** — the largest root + dependents you can justify from Step 1 + repo context. Frame as a cluster (files, branches, env vars, call sites that only exist to support the root) so the user sees the full scope of what a pick removes.
2. **Smaller deletion + tiny replacement** — delete cluster Y, one-config-flip what remains.
3. **No deletion, minimum implementation** — one config line / env var / flag flip, OR a small function (<30 lines) in an existing file.
4. **No deletion, larger implementation** — new module / service / refactor. Only include as a candidate if the smaller options visibly can't close the gap.

Plus **"Other — I'll describe"**.

**Rules:**

- Candidate A is always your recommendation, labelled **A. (recommended)**.
- If you cannot justify any deletion cluster from the repo + Step 1 context, say so explicitly in the prompt: *"no safely removable cluster found; smallest viable implementation is X"* — and make that option A. This is a first-class answer, not a pushback trigger.
- Frame every candidate as a concrete change — specific files, specific config keys, specific call sites. Never abstract.
- One cluster per pass. Aggressive *within* a cluster, conservative *across* clusters. If the first pick doesn't fully close the gap, the Step 2↔3 loop brings us back here for the next cluster in the next pass.

### Q2.2 — Does the minimized version still exercise every Q1.3 primitive that sits on the path to the goal?

`AskUserQuestion`:
- **A. (recommended)** Yes — every primitive on the path to the goal is still reachable
- **B.** Partially — it drops a primitive I had listed in Q1.3
- **C.** No — it removes something from Q1.3 that is genuinely on-path

Branch:
- **A** → proceed to Q2.3
- **B** → either the primitive wasn't actually on-path (loop back to Q1.3 and sharpen), OR the minimization went too far (loop back to Q2.1 with a less aggressive candidate). Ask the user which.
- **C** → reject the pick. Loop back to Q2.1 with different candidates. Never delete a Q1.3 primitive.

### Q2.3 — Does the minimized version fully close the Q1.2 gap?

`AskUserQuestion`:
- **A. (recommended if a deletion was picked in Q2.1)** Yes — entirely. No further work needed.
- **B.** Partially — it shrinks the gap; what's left has real tradeoffs or interactions worth designing
- **C.** No — the gap remains largely intact

Branch:
- **A** → **Verdict: apply the minimized change.** Skip to Conclusion. Step 3+ do not run. This is the highest-value outcome of the whole skill — take it whenever it is genuinely available.
- **B** → proceed to Step 3 with the surviving scope. Step 3 designs how the surviving pieces fit together.
- **C** → the minimization didn't help. Loop back to Q2.1 (try a bigger cluster) or to Step 1 (primitives missing from Q1.3).

### Step 2 summary (always print before moving on)

Before firing Q3.1 or skipping to the Conclusion, print exactly:

```
Minimized scope: <one-line description of the Q2.1 pick>
Primitives preserved: <comma-separated list from Q1.3>
Out of scope: <2–3 things explicitly not being done this pass>
```

"Out of scope" is load-bearing — it locks in scope discipline that the old Step 3's Q3.3 used to enforce. Make the cuts concrete (file paths, feature names, platforms).

---

## Step 3 — Optimise how the surviving pieces fit together

Step 2 minimized the scope. Step 3 takes what survived and designs how it connects: **interactions, workflow variants, ranked experiments**. Three questions.

Skip Step 3 entirely if the surviving scope is a one-liner with no interactions to design — there is nothing to optimise. Go straight to Step 4.

### Q3.1 — How do the surviving pieces need to interact?

`AskUserQuestion` with 3–4 candidate flow descriptions you've generated from the surviving pieces — each a short sentence saying who calls whom, where humans are in the loop, where async boundaries are, where state lives. Plus **"Other — I'll describe"**. Candidate A is your recommendation.

### Q3.2 — What are the options and tradeoffs for that interaction?

Generate 2–4 **alternative workflow variants** — competing ways to do the same thing, not sub-questions of one approach. For every option, **explicitly tag it (a) "works now, even if brittle" or (b) "more robust long-term but higher initial effort"** — this works-now-vs-long-term axis is the key tension Step 4 will act on. Emit as an `AskUserQuestion` with each variant as a pick, plus **"Other — I'll describe a different approach"**. Candidate A is your recommendation.

**Surface sub-questions, don't swallow them.** If after the main variant pick you have meaningful implementation choices (filename format, embed syntax, folder location, etc.), list them for the user with a recommended default for each — but do not skip them on their behalf. The user decides which deserve attention; your job is to make the choice visible and tag your default so they can accept-or-flip quickly.

Common axes if you need to generate genuine variants:
- Sync call vs async queue
- Eager computation vs lazy-on-demand
- Centralised service vs distributed responsibility
- Automated handoff vs human review gate
- Tight coupling vs explicit contract
- Single shared store vs per-component state

### Q3.3 — Rank them as experiments to try

Produce a ranked list (2–4 items, most-promising first) as a written draft, then fire an `AskUserQuestion` with ranking choices as picks (**"Go with #1"**, **"Swap #1 and #2"**, **"Drop #N"**, etc.) plus **"Other — I'll re-rank"**. Each entry in the written draft should be:
- **Name:** short label for the variant
- **Hypothesis:** the one thing it assumes will hold true
- **Cheapest test:** the smallest thing you could run to find out if the hypothesis breaks
- **Signal:** what result would invalidate it
- **Mode:** "works-now (brittle)" OR "long-term robust" — which tradeoff this experiment buys

End of Step 3 with: (a) a concrete workflow picture, (b) a ranked experiment list tagged with works-now-vs-long-term mode. Step 4 acts on the top-ranked experiment — pick brittle-but-fast when you need to learn, robust when the cost of rework is higher than the cost of delay.

---

## Step 4 — Accelerate (end-to-end works without fails)

Hard-gated: Steps 1–3 must have user-confirmed answers in this conversation.

> **Urgency is the point.** Get the simplest version running end-to-end as fast as humanly possible. Maniacal speed beats perfect planning.

Accelerate here means **get the thing running through the full flow with no failures.** Not a perf benchmark — an integration test against reality. Musk's version runs the full production line; yours runs the full flow.

### Q4.0 — Proceed to build? (default: yes, skip the ask)

**Default behaviour: skip this question entirely and go straight to the auto-build flow below.** By the time you reach Step 4, Steps 1–3 have produced a clear goal, primitives list, minimization pick, chosen experiment, and hypothesis. You already have everything you need — executing is your job. Per the "Complete the work when you can" operating rule, ask Q4.0 only when one of these is genuinely true:

- The session **cannot** make the required edits (no write access to the target system, required credentials not available, the work lives in a surface this skill can't reach)
- The user has **explicitly** asked to drive manually this run
- You hit real ambiguity in Steps 1–3 that makes execution impossible without another decision — in which case loop back to Step 3 to resolve, don't push the execution onto the user

If you must ask, `AskUserQuestion`:
- **A. (recommended)** Build it now — create a worktree/branch, implement the minimal change, run E2E, report result
- **B.** I'll build it manually — give me the exact minimal change to make
- **C.** Not ready — loop back to Step 3

Branches:
- **A** (and the default, unasked path) → proceed to the auto-build flow below, then apply Q4.1
- **B** → emit one concrete paragraph naming exactly what to change (files, lines, config keys), citing the Q1.3 primitives, the Q3.3 hypothesis, and the Q2.1 out-of-scope list. Wait at Q4.1.
- **C** → loop back to Step 3. Don't ship an experiment the user isn't confident in.

**Auto-build flow (default path, or Q4.0 = A if asked):**
1. Create an isolated workspace. Prefer `git worktree add ../worktrees/accel-<slug>` where `<slug>` is a short kebab-case version of the experiment name; fall back to a branch `accel-<slug>` if worktrees aren't available. Tell the user which you chose.
2. Implement ONLY the minimized change from Q2.1. Do not scaffold, do not add tests beyond what E2E needs, do not pre-build for the losing experiments. If you find yourself writing setup code beyond the change, stop and ask.
3. Commit with a message that references: the primitives from Q1.3, the tradeoff mode from Q3.3 (works-now vs long-term), and the hypothesis the experiment is testing.
4. Run the full E2E flow — test suite, manual run, or integration test as appropriate for the codebase.
5. Surface pass/fail and relevant logs/artifacts immediately.
6. If the run fails, ask whether to delete the branch/worktree before looping back to Step 2↔3.

**Guardrails that MUST hold in branch A:**
- Explicit user consent was captured via Q4.0 = A — do not infer consent from anything else.
- Scope is limited to the minimized change from Q2.1. Enforce this hard — rework-creep kills the urgency that makes this step work.
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
- A component turned out to need more than its simplest form → Q2.1 was too aggressive, pick differently
- A primitive was missing from Q1.3 → loop all the way back to Step 1
- The top experiment's hypothesis broke → drop it, re-rank, try the next-most-promising handoff from Q3.3
- The design works but is too brittle → Step 2 to cut scope, Step 3 to re-generate workflow options
- **A downstream hop you didn't build was already broken** → fix or route around it; your E2E isn't done until the chain runs clean from capture to user-observed outcome

---

## Step 5 — Automate

Three-gate hard-enforcement: automate ONLY if **all three** are true in this conversation:

1. The thing works end-to-end (Q4.1 = A)
2. It's as simple as possible (Step 2 ran; Q2.1 pick made and out-of-scope items named)
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
| "We need to auto-detect…" | "One config line almost always beats detection. Revisit Q2.1." |
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
> Q2.1 Smallest version → **A.** Delete the redundant product-list fetches in the render path (cluster: 3 call sites in `components/Product*`; memoise once at the page level)
> Q2.2 Primitives preserved? → **A.** Yes (the query itself stays; only the redundant calls go)
> Q2.3 Closes the gap fully? → **A.** Yes (round-trip count drops from 3 to 1; 900ms → <200ms)
>
> **Conclusion:** Delete the redundant fetches. Caching layer not needed.

---

## Pre-Action Checklist

- [ ] Step 1 — goal, gap, primitives, on-path, frequency all answered
- [ ] Step 2 — smallest-version candidate chosen; Q1.3 primitives preserved; out-of-scope items named
- [ ] Step 3 — ran only if Step 2 left surviving scope with interactions worth designing; produced a workflow picture + ranked experiments, or explicitly skipped
- [ ] Step 4 — ran only if reaching for automation or integration; loop-back used if E2E failed
- [ ] Step 5 — ran only if all three gates are satisfied
- [ ] Final Conclusion block present with Decision, Why, Next action
- [ ] No question was batched; no answer was guessed
