---
name: auto-algorithm
description: Autonomous variant of the-algorithm. Runs Step 1 (Question the requirement) interactively with the user — because goal, gap, and primitives are where human judgment is load-bearing — then executes Steps 2 (Minimize — delete + simplify), 3 (Optimise how pieces fit together), 4 (Accelerate / build end-to-end), and 5 (Automate) autonomously, making every decision itself based on the Step 1 answers and the surrounding context. Use when the user wants the full five-step treatment but doesn't want to click through Q2.1–Q5.1. Same gates, same loop-backs, same three-gate automation rule as the-algorithm — the only difference is who answers Steps 2–5.
---

# Auto Algorithm

The autonomous cousin of [the-algorithm](../SKILL.md). Same five steps, same gates, same loop-back logic, same Conclusion block — the only difference is **who makes the decisions in Steps 2–5**.

- **Step 1 — Question:** fully interactive. Every question fires as `AskUserQuestion`, exactly as in the-algorithm. The user's goal, primitives, and on-path verdict cannot be inferred; they must be stated.
- **Steps 2–5 — Minimize, Optimise, Accelerate, Automate:** fully autonomous. No `AskUserQuestion` calls. You pick the answer for every question based on the Step 1 output plus the repo / conversation context, narrate the pick in one line, and move forward. You also execute Step 4 — build the change, run it E2E — without asking permission.

Default bias remains: **most decisions end at Step 2.** You are still allowed — and encouraged — to short-circuit to the Conclusion the moment the minimization closes the Q1.2 gap.

## When to invoke

Same triggers as the-algorithm. Prefer `auto-algorithm` when:

- The user explicitly asks for it (`/auto-algorithm`, "run it autonomously", "don't ask me each step").
- Step 1 has already been done in this session and the user wants the remaining steps executed.
- The decision is small enough that interactive Steps 2–5 would be click-fatigue, but large enough that the five-step discipline still matters.

Prefer `the-algorithm` instead when:

- The user is making a product-shaping call and wants to be in every decision.
- The stakes include shared infrastructure, destructive operations, or anything that would be hard to reverse.
- Steps 2–5 contain real trade-offs where the user's preference isn't inferable from Step 1.

If you start with `auto-algorithm` and hit a decision where you genuinely can't choose — two plausible answers with different downstream shapes and no signal from Step 1 or the repo — stop, switch to interactive mode for that one question, then resume autonomously.

## Operating rules

- **Step 1 is sacred and interactive.** Ask Q1.1 through Q1.5 exactly as the-algorithm does. Never infer goal, gap, or primitives. Never auto-advance Step 1. The sharpening test on Q1.3 (role, not tool) still applies — push back once if the user names specific vendors/files/repos.
- **Steps 2–5 are autonomous.** Do not fire `AskUserQuestion` for any of Q2.x, Q3.x, Q4.x, or Q5.x. Instead, for each question:
  1. State the question in one line.
  2. State your chosen answer with a one-line rationale grounded in Step 1 answers + repo context.
  3. Proceed to the next question or step.
- **Narrate, don't dump.** After each step, emit a 3–5 line summary: which answer you picked for each question, why, and what the step output is (minimization pick / ranked experiments / E2E result / automation plan). No walls of prose.
- **Complete the work, don't hand it back.** Step 4 defaults to auto-build — create a worktree or branch, implement the minimized change from Q2.1, commit, run E2E, report the result. The "complete the work when you can" rule from the-algorithm applies with extra force here; `auto-algorithm` only defers execution when the session genuinely cannot make the edit (no write access, no shell, wrong surface).
- **Loop back autonomously.** If Step 4's E2E run fails, loop back between Steps 2↔3 yourself — pick the next-ranked experiment, or cut scope further, or drop a primitive that turned out not to be on-path. Only break the autonomous loop if three iterations in a row fail for different reasons — that's a Step 1 problem, stop and re-ask the user.
- **Three-gate automation still holds.** Step 5 refuses unless Q4.1 = A (genuine E2E pass with user-observed final outcome), Step 2 ran, and Step 3 ran or was intentionally skipped. You do not relax these gates just because you're in autonomous mode — the point of the gates is to prevent automation of unstable flows, and the flow is no more stable because *you* decided instead of the user.
- **The user owns the final E2E confirmation.** Q4.1 is the one question in Steps 2–5 that you cannot answer for the user. The "user's eyes on the goal = pass" rule from the-algorithm is absolute. Print the Q1.3 primitive checklist with evidence filled in, then ask the user for the final yes/no — this is the single `AskUserQuestion` allowed outside Step 1.
- **Break autonomy if the stakes demand it.** Before Step 4's auto-build, check: does this change touch production, destructive operations, or anything the user would want to gate? If yes, fall back to `AskUserQuestion` for Q4.0 only — get explicit consent to build — then resume autonomously. Examples that warrant the break: `git push --force`, production deploys, dropping tables, sending emails/messages, modifying shared infrastructure.

---

## Step 1 — Question the requirement (interactive, identical to the-algorithm)

Run Q1.1 → Q1.2 → Q1.3 → Q1.4 → Q1.5 exactly as specified in [the-algorithm](../SKILL.md#step-1--question-the-requirement-first-principles). Every one is an `AskUserQuestion` with 3–4 candidates you've inferred plus "Other — I'll describe". First option is your recommendation.

Stop at the Verdict if Q1.4 = C (Don't do) or Q1.5 = C/D (Record for later). Skip directly to Conclusion in those cases — no need to hand off to autonomous Steps 2–5 for a problem that shouldn't be solved.

Otherwise: output a Step 1 summary — goal, gap, primitives (sharpened), on-path verdict, frequency — then move autonomously into Step 2.

---

## Step 2 — Minimize (autonomous)

For each of Q2.1, Q2.2, Q2.3: state the question, state your chosen answer, state the one-line rationale. Branch per the-algorithm's Step 2 branching rules. No `AskUserQuestion` calls in this step.

**Your Q2.1 answer: the smallest version that still closes the Q1.2 gap, picked from the delete-first spectrum.** Work the ladder top-down:

1. **Biggest safe deletion cluster** you can justify from Step 1 + repo context — root + dependents, framed as a concrete cluster.
2. **Smaller deletion + tiny replacement.**
3. **No deletion, minimum implementation** (one config line, small function).
4. **No deletion, larger implementation** — only if smaller options can't close the gap.

Pick the highest rung that plausibly closes the gap without deleting a Q1.3 primitive. If the repo + Step 1 context does not justify any deletion cluster, say so explicitly (*"no safely removable cluster found; smallest viable implementation is X"*) and pick the minimum implementation instead — this is a first-class answer. If multiple rungs look comparable, prefer the one that most directly closes the Q1.2 gap and flag the runner-up in one line.

**Your Q2.2 answer** checks the Q2.1 pick against every Q1.3 primitive on the path to the goal. If it drops a primitive that was genuinely on-path (C), reject the pick autonomously and drop to the next rung. If it drops a primitive that might not have been on-path (B), call it out — either sharpen Q1.3 with the user or pick less aggressively. Never delete a Q1.3 primitive.

**Your Q2.3 answer is A only if the minimization fully closes the Q1.2 gap.** Otherwise B (shrinks, optimise what remains) or C (minimization didn't help, try a bigger cluster or loop back to Step 1).

**Verdict behaviour:**
- Q2.3 = A → **Apply the minimized change.** Skip to Conclusion. Highest-value outcome — take it whenever genuinely available.
- Q2.3 = B → apply the pick; proceed to Step 3 with what survives.
- Q2.3 = C → loop back to Q2.1 with a bigger cluster, or to Step 1 if primitives are missing.

**Step 2 summary (always print):**

```
Minimized scope: <one-line description of the Q2.1 pick>
Primitives preserved: <comma-separated list from Q1.3>
Out of scope: <2–3 things explicitly not being done this pass>
```

This is the audit trail for Steps 3+ and the Conclusion's auto-decisions trace.

---

## Step 3 — Optimise how the surviving pieces fit together (autonomous)

Three questions: Q3.1 (interactions), Q3.2 (workflow variants + tradeoffs), Q3.3 (rank as experiments). Skip Step 3 entirely if the surviving scope is a one-liner with no interactions to design.

- **Q3.1 interactions:** describe the flow in 2–3 sentences. Name who calls whom, where state lives, where async boundaries are.
- **Q3.2 workflow variants:** generate 2–4 competing variants, tag each (a) works-now brittle or (b) long-term robust. Pick one, state which and why, grounded in the Q1.5 frequency and Q1.1 goal. Surface any sub-questions (filename format, embed syntax, etc.) with recommended defaults and pick them too — do not swallow decisions silently, but do make them.
- **Q3.3 rank as experiments:** produce the ranked list with Name / Hypothesis / Cheapest test / Signal / Mode for each. Pick the top-ranked item; state which and why.

Output a Step 3 summary — chosen workflow, top experiment with its hypothesis and mode, runner-up noted in one line.

---

## Step 4 — Accelerate (autonomous build, user-confirmed outcome)

**Default path: skip Q4.0 and go straight to the auto-build flow.** You are `auto-algorithm`; the whole point is to execute. Ask Q4.0 only if:

- The change touches production / destructive operations / shared infrastructure — fire `AskUserQuestion` for Q4.0 to get explicit consent before touching it.
- The session genuinely cannot make the edit — tell the user what to do manually, citing Q1.3 primitives + Q3.3 hypothesis + Q2.1 out-of-scope list, then wait at Q4.1.
- Three loop-back iterations in a row have failed — stop and ask the user whether to keep trying or rethink Step 1.

**Auto-build flow:**
1. `git worktree add ../worktrees/accel-<slug>` (or branch `accel-<slug>` if worktrees unavailable). Tell the user which.
2. Implement ONLY the minimized change from Q2.1. No scaffolding, no bonus tests, no pre-building losing experiments.
3. Commit with a message referencing: Q1.3 primitives, Q3.3 mode (works-now vs long-term), hypothesis being tested.
4. Run the full E2E flow — test suite, manual run, or integration test as appropriate.
5. Surface logs and pass/fail immediately.
6. If the run fails, loop back autonomously between Steps 2↔3 — pick the next-ranked experiment, or a smaller minimization cluster, or retry with a different tradeoff. Announce the loop: "E2E failed at primitive X. Looping back to Step 3; dropping experiment #1, trying #2." After three consecutive failures, stop and surface to the user.

**Guardrails — unchanged from the-algorithm:**
- Scope is limited to the Q2.1 minimized change.
- Never push, open a PR, or deploy without explicit user confirmation.
- On E2E failure, the default is delete-and-loop, not polish-and-push.

### Q4.1 — final E2E confirmation (this one is NOT autonomous)

Before firing: print the Q1.3 primitive checklist with "Verified how?" filled in for each primitive. Any row that reads "assumed" or "not checked" — you go back and verify it (or tell the user to) before asking Q4.1. A primitive ticked only on upstream inference does not count.

Once the checklist is complete, fire `AskUserQuestion` with the standard Q4.1 options (A full pass with user-observed outcome, B partial / hop broken / not verified, C not yet run). Branch per the-algorithm:

- **A** → Step 5.
- **B** → loop back 2↔3 autonomously. Broken hop IS the experiment's result. Do not paper over.
- **C** → stop. Ask the user to run it.

**Hard rule — unchanged:** the skill NEVER self-declares pass. Only the user's eyes on the Q1.1 goal = pass. "Tests passed" / "CI green" / "webhook fired" / "200 OK" are necessary but not sufficient.

---

## Step 5 — Automate (autonomous, same three-gate enforcement)

Gates — all three must hold:

1. Q4.1 = A (user confirmed final outcome).
2. Step 2 ran — minimization pick made; out-of-scope items named.
3. Step 3 ran or was intentionally skipped because the surviving request had no real tradeoffs.

If any gate fails, refuse autonomously and loop back to the failing gate. Print which gate failed and why.

### Q5.1 — ≥3 flawless E2E runs?

Answer from session history + user confirmation if needed. If you don't have visibility into run history, fall back to `AskUserQuestion` on Q5.1 only — this is the second allowed interactive question outside Step 1.

- **A** ≥3 flawless → produce the automation plan and go to Conclusion.
- **B** <3 or any failure → refuse to automate. State it plainly: "manual version isn't stable yet; automating this would compound failures at machine speed. Run it N more times first."

---

## Conclusion format

Same block as the-algorithm, always ending with:

```markdown
### Decision
[Do | Don't do | Delete instead | Record for later | Loop back to Step N]

### Why (one sentence)
...

### Next action (concrete, one or two bullets)
- ...
```

Also include a one-line **Auto-decisions trace** above the Decision line:

```markdown
### Auto-decisions trace
Q2.1=<minimization pick>, Q2.2=<A|B|C>, Q2.3=<A|B|C>, Q3.2=<variant>, Q3.3=<experiment #1>, Q4=<built|skipped|deferred>, Q5=<automated|refused>
```

This is the audit trail so the user can see every decision you made on their behalf in one glance. If they disagree with any of them, they can loop back with `/the-algorithm` on the same request.

---

## Anti-patterns specific to autonomous mode

| Pattern | Flag / correction |
|---|---|
| Running Step 1 autonomously to "save the user time" | **Never.** Step 1 is the thinking layer. Skipping it defeats the whole skill. |
| Picking a Step 3 variant the user wouldn't have picked because it's "more interesting" | You're executing their Step 1, not expressing your own taste. Choose the simplest variant that satisfies the primitives. |
| Auto-building into production / main / shared state | Fall back to interactive Q4.0. Autonomy applies to decision-making, not to consent on destructive operations. |
| Self-declaring E2E pass to avoid interrupting the user | Absolute violation of the hard rule. Q4.1 always asks. |
| Looping Step 2↔3 indefinitely after repeated failures | Stop at three iterations. That's a Step 1 problem — re-run Step 1 with the user. |
| Swallowing a sub-question ("I just picked the default") without narrating it | State every decision in the summary, even ones you thought were obvious. The trace is the contract. |

---

## Example session (abbreviated)

> User: *"Should we add a caching layer to the API?" — invoked via /auto-algorithm*
>
> **Step 1 (interactive):**
> Q1.1 → **A** "Page renders in <200ms"
> Q1.2 → **B** "At 900ms; DB round-trips dominate"
> Q1.3 → **A** "User model / session store / product list query" (passed sharpening test)
> Q1.4 → **A** Now
> Q1.5 → **A** Common
>
> **Step 2 (autonomous):**
> Q2.1 → smallest version: delete the redundant product-list fetches in the render path (cluster: 3 call sites in `components/Product*`; memoise once at page level). Picked because it's the most aggressive rung the repo supports and directly targets the Q1.2 gap (DB round-trips dominate).
> Q2.2 → **A** Yes — every Q1.3 primitive still reachable (query itself stays; only the redundant calls go).
> Q2.3 → **A** Yes — round-trip count drops 3→1, brings page well under 200ms.
>
> **Verdict: Apply the minimized change.** No caching layer needed. Stopped at Step 2.
>
> ### Auto-decisions trace
> Q2.1=redundant-fetches-cluster, Q2.2=A, Q2.3=A, Q3/Q4/Q5=skipped (minimization solved it)
>
> ### Decision
> Delete instead — remove the redundant fetches from the render path.
>
> ### Why
> The 900ms gap to the 200ms goal is caused by duplicate calls to the existing product query, not by a missing cache; deleting the duplication resolves the goal without adding a primitive.
>
> ### Next action
> - Remove the 2 redundant `fetchProductList` calls in `components/Product*`; memoise once at the page level.

---

## Pre-Action Checklist

- [ ] Step 1 — goal, gap, primitives, on-path, frequency all answered *by the user, interactively*
- [ ] Step 2 — minimization decision narrated with one-line rationale; Q1.3 primitives respected; out-of-scope items named
- [ ] Step 3 — ran only if Step 2 left surviving scope; workflow variant picked with tradeoff mode tagged; ranked experiments narrated; sub-questions not swallowed
- [ ] Step 4 — auto-build executed (or Q4.0 fallback triggered for destructive/shared-state ops); Q4.1 asked interactively with the primitive checklist populated from evidence
- [ ] Step 5 — ran only if all three gates hold; refused autonomously with a clear reason otherwise
- [ ] Auto-decisions trace emitted in the Conclusion
- [ ] Final Conclusion block present with Decision, Why, Next action
