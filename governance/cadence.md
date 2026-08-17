# Review cadence

A monthly walk of the registry against promotion criteria. Replaces habit with decision.

- **First review date:** [set it]
- **Frequency:** monthly (or quarterly once stable)

## Promotion & demotion

The written test for every hop, and the per-agent rules, live in **`trust-levels.md`**.
Each review: walk the registry against those criteria, and write one ADR line in `decisions/`
the day you promote or demote. That is the whole discipline.

Fast version:
- **Promote** an agent one rung only when it meets *every* criterion for that hop in `trust-levels.md`.
- **Demote** immediately on a verifier miss that reached production, a noisy false-positive, or a
  30-day pattern of bad merges. Demotion is a reset — fix the verifier, tighten scope, re-promote.
