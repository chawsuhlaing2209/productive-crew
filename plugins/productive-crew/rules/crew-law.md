# Productive Crew — the law

Loaded into every session in a crew project. The full detail lives beside this file in
`${CLAUDE_PLUGIN_ROOT}/rules/`; this is the part that must always be true.

## The one law: nobody writes status

Status is *derived*, never typed.

- Agents write **evidence** — a commit URL, a staging link, a test result.
- A script **verifies** the evidence is real.
- Airtable's formula reads the evidence and shows the stage.

If an agent sets a status field directly, it is a bug. Evidence in, status out.

## Schema names come from the config, never from memory

Every Airtable table and column name lives in `productive.config.json` — `airtable.tables`,
`airtable.fields`, and the cell values in `airtable.choices`. Read them from there and match them
exactly; Airtable resolves names case-sensitively, so a guessed capital fails at runtime. If a name
in the config doesn't exist in the base, report the mismatch — don't guess the nearest one.

## The loop — every agent is a worker, not a one-shot

```
read → build → test → parity        until clean
```

An agent does not do its work once, report what broke, and hand the mess on. It **re-runs its own
checks and fixes what they catch**, until they pass or it genuinely can't proceed.

- **Never hand off red.** A failing check is yours to fix, not the next agent's to discover.
- **The loop is bounded.** If the same check fails twice with the same cause and your fix moved
  nothing, stop. Looping on an unchanged failure burns the session and teaches you nothing.
- **Stopping is a real outcome.** Report the blocker card — what broke, what you tried, and the one
  thing that would unblock it. That is a worker stopping, not a worker giving up.
- **Never widen scope to get green.** If passing means changing something outside your remit —
  a token's value, another component, the design itself — that is a stop-and-ask, not a fix.

## Preflight — the one gate every agent passes

Two checks, not one, and they are not interchangeable:

- **Config gate — `node "${CLAUDE_PLUGIN_ROOT}/scripts/preflight.js"`.** Deterministic, no network.
  Is this project set up at all? Any agent can run it, and any agent invoked directly rather than
  through the PM **must** run it first. Exit 1 → `/productive-crew:setup`, stop.
- **Surface check — per agent, not shared.** Whether the services *you* depend on answer right now.
  It can't be a script: `whoami` and `ping` are MCP calls, and each agent depends on different
  surfaces. QA needs Figma, Airtable and the Storybook preview; the Engineer needs Figma; DevOps
  needs Airtable. Check yours, report what's down, and don't work half-blind.

## Front door — every request starts at the PM

Any component request ("build Button") goes to the **pm** agent first. Never skip to building,
and **never ask the user for a Figma node** — it lives in the Airtable row.

1. **Config check** — `node "${CLAUDE_PLUGIN_ROOT}/scripts/preflight.js"`. Not set up →
   `/productive-crew:setup`, stop.
2. **Registry check** — Airtable is the registry. Not there → offer to register it (only *then*
   do you need a Figma node). There → read its status and Figma node from the row.
3. **Ticket** — open the Asana task + lifecycle subtasks, assign the Engineer, hand off the node.

## Tokens are configured first

No component is built on unconfigured tokens. If `tools.md`, the Style Dictionary config, or the
built output for `tokens.platforms` is missing, the PM assigns 🎨 token-builder first.

## Git — three tiers

`component/<name> → staging → main` (names come from `repo.*` in `productive.config.json`).
Every PR targets **staging**; the merge to staging deploys the staging Storybook, and *that deploy
is the evidence*. Main accepts PRs from staging only, opened by DevOps with human approval.

## How agents talk

Short cards a designer can scan, one per hand-off. Say what changed, not how. Link, don't paste.
A blocker is a card too — what broke + one thing to try.

## Kill switch

`AGENTS_PAUSED` at the project root halts every agent before its next write. A PreToolUse hook
enforces it. Create the file to stop the fleet; delete it to resume.
