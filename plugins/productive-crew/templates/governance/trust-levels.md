# Trust levels — how each agent earns autonomy

Five rungs. Every agent starts at **Observer** and climbs on a written test, never a vibe.
*Autonomous ≠ unsupervised* — it means supervision became **structural** (verifier + kill
switch) instead of **manual** (review every PR).

## The ladder

| Level | Can do | Cannot do |
|---|---|---|
| L0 Observer | read, audit, report, answer | suggest specific changes, open PRs, edit |
| L1 Advisor | recommend fixes, draft PR text | open the PR, edit any file |
| L2 Junior | open scoped PRs, run in CI, tag a reviewer | merge, touch protected paths |
| L3 Senior | merge approved low-risk PRs, ship behind flags | touch governance/brand, override verification |
| L4 Autonomous | run end-to-end loops, self-correct, use sub-agents | override the verifier, bypass the kill switch |

## Promotion criteria — the written test

| Hop | Criteria |
|---|---|
| Observer → Advisor | ≥2 weeks on the real system · reports ≥90% accurate · you can name 2–3 blind spots |
| Advisor → Junior | ≥80% of suggestions right over 4 weeks · wrong ones small/rejectable · CI would catch a bad PR · has a scoped path |
| Junior → Senior | ≥95% of PRs merged unchanged over 8 weeks · rejections documented here · verification on every PR · a clear low-risk subset |
| Senior → Autonomous | Senior ≥1 quarter · verification caught a real bug and the agent listened · a working kill switch · bounded category · a bad merge recoverable in <1 hr |

## Demotion (Autonomous → Senior) — the first time any occurs

| Trigger | Meaning |
|---|---|
| Ships drift the verifier missed | the gate has a hole |
| A verifier false-positive costs >1 hr | the gate is noisy |
| A human spots a pattern of bad merges in 30 days | the track record broke |

Demotion is a reset, not a failure. Fix the verifier, tighten the scope, re-promote on criteria.

## Per-agent rules

Copy the matching line into your review note the day you promote or demote.

- 🎨 **token-builder** — start Observer → target **Senior**, scope: the built token output and the
  build config. Never `tokens.json` itself — that is imported. No Airtable.
  Junior once ≥80% of its token builds are right over 4 weeks with `token-check` catching the bad
  ones; Senior at ≥95% merged-unchanged over 8 weeks. **Demote** if a build breaks a component.
- 🔨 **Engineer** — start Observer → target **Junior**, scope `src/components/`.
  Advisor→Junior on ≥80% good scoped PRs over 4 weeks with CI + QA catching failures. Stays Junior —
  it writes production code, so every PR is read. **Demote** if a merged component breaks the build.
- 🔍 **QA** — start Observer → target **Senior**, scope testing tables + Asana comments.
  Senior at ≥95% of its verdicts standing unchanged over 8 weeks. Not Autonomous — a wrong "pass"
  gates a deploy. **Demote** if a passed component fails in production.
- 🚀 **DevOps** — start Observer → target **Junior**; production **human-gated, always**.
  Staging promotion can reach Junior; production deploy never rises above a human gate, whatever the
  record. **Demote** if it ever merges a component with a failing staging case.
- 🧭 **PM** — start Observer → target **Autonomous**, scope read-registry + Asana.
  Autonomous once `verify.js` has run a clean quarter **and** caught a real bad record that was
  then corrected — evidence in `.crew/verify-log.jsonl`. A quarter with no catches does not count:
  a verifier that never caught anything is untested, not proven.
  **Demote** if it marks a broken link verified — auditable at any time by re-running `verify.js`
  over every evidence column on the board. It is the only agent that both writes the board and
  verifies it, so it is the one that most needs checking from outside.
- 📄 **doc-generator** — start Observer → target **Senior**, scope `docs/`.
  Senior once docs-build CI is green on ≥95% of its auto-merges over 8 weeks. **Demote** if it
  publishes docs for a component that isn't Completed.

## Two axes: level and scope

Trust is **level** (how much authority) × **scope** (where it applies). The same agent can be
Senior in `tokens/` and Observer in a path it must never touch. Path-scoped rules live in
`.claude/rules/`.

## Kill switch — required above Observer

`AGENTS_PAUSED` at the repo root halts the fleet (enforced by the hook in `.claude/settings.json`).
Speed of stopping is what makes autonomy responsible — test it at least once a quarter.
