---
name: review
description: The monthly governance review — walk the agent registry against the promotion criteria and propose promote / hold / demote, with evidence. Usage: /productive-crew:review.
---

# /productive-crew:review

Delegate to the **governance-review** agent.

It reads `governance/registry.md`, `governance/trust-levels.md` and `governance/cadence.md`, gathers
what evidence actually exists for each criterion, and returns a card proposing **promote / hold /
demote** per agent — plus an explicit list of what it could not measure.

**It changes nothing.** `governance/` is read-only for every agent, always. You get a
recommendation and a drafted ADR line; you edit the registry.

Run it on the review date in `cadence.md`, or any time you suspect a demotion trigger — a ship the
verifier missed, a costly false positive, a component that passed staging and failed in production.
Demotion doesn't wait for the calendar.
