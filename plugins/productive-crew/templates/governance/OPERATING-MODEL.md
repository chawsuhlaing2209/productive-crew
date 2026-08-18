# Agentic Operating Model — Your Design System

> Tools and loops are not an operating model. This is what keeps the fleet running
> after the person who built it leaves the room.
> **The test:** if your best AI user quit tomorrow, would the agents keep working
> safely, and could someone else change them?

Three layers sit on top of the agents built in the crew: **People · Process · Governance.**

---

## Layer 1 — People

| Role | Owns | Does NOT do |
|---|---|---|
| **Orchestrator** — *[you, the design-systems lead], made explicit* | the registry, promotions, kill switches | the agents' actual work |
| **Reviewers** — named humans per area | agent output in their area | sit on a separate team |

Named reviewers:

| Area | Reviewer |
|---|---|
| Tokens | [name] |
| Components | [name] |
| QA verdicts | [name] |
| Deploys | [name] |

**Two rules**
- The orchestrator is the existing design-systems lead made explicit — not a new hire.
- If no human's name is attached to an agent, that agent should not exist.

*The shift: your best people stop producing changes and start producing the system
that produces changes. The agents type.*

---

## Layer 2 — Process

**Every work type has a home**

| Work type | Home | Agent |
|---|---|---|
| tokens.json changes · scheduled | token build | 🎨 token-builder |
| PR (build) | component code | 🔨 Engineer |
| Test + verdict | staging & production | 🔍 QA |
| Deploy | staging→main→prod | 🚀 DevOps |
| Fix flywheel | bounded loop behind a verifier | 🔨 Engineer ↔ 🔍 QA |

**Escalation is defined** — every agent tags a human on failure, so no one is surprised.

| Agent | Escalates to |
|---|---|
| token-builder | Tokens reviewer |
| Engineer | Components reviewer |
| QA | QA reviewer |
| DevOps (prod) | Orchestrator (approval gate) |

**Review altitude ladder** — effort drops as trust rises. This drop is the economic point.

| Trust level | Human review |
|---|---|
| Observer | output gets read |
| Advisor | recommendations read, you apply them |
| Junior | PRs reviewed line by line |
| Senior | merges / records skimmed |
| Autonomous | audited monthly |

Full five-level ladder, per-hop promotion tests, and per-agent rules: **`trust-levels.md`**.

---

## Layer 3 — Governance

Three artifacts, one cadence.

| Artifact | Answers | Skippable? |
|---|---|---|
| **Agent registry** | "What can touch production right now?" | Never |
| **Decision records (ADR)** | "Why is this agent at this level?" | No |
| **Review cadence** | "When do levels change?" | No |

### The agent registry

| Agent | Level | Scope | Verifier | Kill switch |
|---|---|---|---|---|
| 🎨 token-builder | Senior | `tokens.json` (imported) → Style Dictionary build (no Airtable) | token-check | `AGENTS_PAUSED` |
| 🔍 QA | Senior | Storybook-testing tables, Asana comments, verdict | test records + PM verify | `AGENTS_PAUSED` |
| 🔨 Engineer | Junior | `src/components/`, commits, PR→staging | vitest + typecheck/lint + QA | `AGENTS_PAUSED` |
| 🚀 DevOps | Junior · prod human-gated | git staging→main, Pages deploy | build CI + orchestrator approval | `AGENTS_PAUSED` |
| 🧭 PM | Autonomous *(starts Observer)* | verify records + links · sync Asana (daily) | `${CLAUDE_PLUGIN_ROOT}/scripts/verify.js` (deterministic) | `AGENTS_PAUSED` |
| 📄 doc-generator *(optional)* | Senior | `docs/` | docs-build CI | `AGENTS_PAUSED` |

The orchestrator (you) is not in the table — you own the table.

### Decision records (ADR) — starters

- **token-builder → Senior.** Rewrites the built token output, which cascades to every
  component, so it is not autonomous — but `token-check` verifies that output against the
  imported source, so merges are skimmed, not read line by line. It never writes
  `tokens.json` itself.
- **QA → Senior.** Produces no code, but its pass/fail gates deployment, so the verdict is
  skimmed by the PM rather than left unwatched.
- **Engineer → Junior.** Writes production component code; every PR is read line by line
  until a track record is earned.
- **PM → Autonomous (starts Observer).** It is the verifier: daily, it runs the deterministic
  checks in `${CLAUDE_PLUGIN_ROOT}/scripts/verify.js` over every record and link, and mirrors the registry into Asana.
  It writes no code, no status, and gates nothing, and its checks are deterministic — so a wrong
  result is caught by re-running. That earns Autonomous, audited monthly; it begins at Observer
  per *start conservative*. The production gate stays with the human orchestrator.
- **DevOps → Junior, production human-gated.** Staging deploys are skimmed; production
  deploys require explicit orchestrator approval and are never automated.

Write one ADR line the day you promote or demote any agent. That is the whole discipline.

### Review cadence

A monthly walk of the registry against promotion criteria. Replaces habit with decision.

- **First review date:** [set it]
- **Promotion criterion (example):** *N weeks of clean merges at the current level + a
  verifier that has caught at least one real bug* → promote one rung, record an ADR.

---

## Start conservative

A brand-new fleet has no track record. For the first 4–8 weeks, run every agent **one
rung lower** than its target above — output reviewed — then let the cadence promote each
one as its verifier proves out. The jump that matters is **ad hoc → governed**: a named
orchestrator and a written registry. Everything else is maintenance.

| Criterion | Where we are today |
|---|---|
| Who owns agents | → name the orchestrator (you) |
| Registry | → this file |
| Autonomy granted by | → the monthly cadence, not habit |
| If the lead quits | → successor reads this one file |

---

## The operating-model checklist

- [ ] A named orchestrator owns registry, promotions, kill switches
- [ ] Every agent above Observer has a named human reviewer or verifier owner
- [ ] A current registry answers "what can touch production right now"
- [ ] Promotions and demotions run on a cadence, not habit
- [ ] Decision records explain each agent's level
- [ ] A successor could take over from the registry alone

---

## Kill switch

`AGENTS_PAUSED` is the fleet-wide stop. When set, every agent above Observer halts before
its next write. Anyone on the team — not just the orchestrator — must be able to set it
with confidence. Test it like a fire drill.
