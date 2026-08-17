# Sunim Crew — agent rules

Vendor-neutral instructions for every AI IDE (Claude Code, Cursor, Codex).
A local design-system crew you drive from your editor's chat, on your Pro plan. No API key.

## The one law: nobody writes status

Status is *derived*, never typed.

- Agents write **evidence** — a commit URL, a staging link, a test result.
- A script **verifies** the evidence is real.
- Airtable's formula reads the evidence and shows the stage.

If an agent sets a status field directly, it is a bug. Evidence in, status out.

## Tokens are configured first

Every project must have its tokens set up **for its platform** before any component is built:
`tools.md` generated (the stack), **Style Dictionary** configured, and tokens built for the
platforms in `tokens.platforms`. If that setup is missing, the PM assigns 🎨 token-audit to set up
the token configuration first. Components are never built on unconfigured tokens.

## Front door — every request starts here

Any component request (e.g. "build Button") goes to the **PM** first. Never skip to building,
and **never ask the user for a Figma node** — it lives in the Airtable row.

1. **Config check.** Run `node scripts/preflight.js`. If config isn't set up (placeholder ids
   or no `.env`), run `/setup` and stop.
2. **Registry check — Airtable first.** Airtable is the registry. Look the component up in the
   Components table.
   - **Not there** → tell the designer it isn't registered, and offer to add it (only *then*
     do you need its Figma node, to create the row).
   - **There** → read its status and its Figma node link from the row.
3. **Ticket.** Create the Asana task for the component (+ lifecycle subtasks), assign the
   Engineer, then hand off — passing the Figma node you read from Airtable.

> The designer registers a component in Airtable with its Figma node. Agents read it from the
> registry; they never invent a component or ask for a raw node in chat.

## How agents talk

Short cards a designer can scan. Never a wall of text.

```
🔨 Engineer · Button
Figma ✓  Button.tsx ✓  Stories 5 ✓  vitest 8/8 ✓  Commit a1b2c3 ✓
Handoff → 🔍 QA
```

Rules: one card per hand-off · say what changed, not how · link, don't paste ·
a blocker is a card too — what broke + one thing to try.

## The crew

| Agent | Owns | Level |
|---|---|---|
| 🎨 token-audit | Figma → tokens.json + Style Dictionary build (no Airtable) | Senior |
| 🔁 token-parity | Figma ↔ code token parity → Parity Status | Autonomous |
| 🔨 Engineer | Figma → code + vitest → PR to staging | Junior |
| 🔍 QA | test staging then production → findings + verdict | Senior |
| 🚀 DevOps | staging → main → production deploy | Junior (prod gated) |
| 🧭 PM | verify records + links · sync Asana (daily) | Autonomous |
| 📄 doc-generator | docs/ | Senior (optional) |

The human orchestrator (you) owns the registry — see `governance/registry.md`.

## The loop

```
To-do → 🔨 build + vitest → CI deploys staging → 🔍 QA staging → 🚀 deploy
     → 🔍 QA production (TIP) → 🚀 redeploy → ✅ Completed
        ↕ fix loops (Engineer ↔ QA) at each test stage
```

A human approves before production. Deploy is CI (GitHub Actions + Pages), never an agent acting alone.

## Git — three tiers

`component/<name> → staging → main`. Every PR targets **staging** — never main. Main accepts PRs
from **staging only**, opened by DevOps with the human's approval. **The merge to staging deploys
the staging Storybook — that deploy is the evidence.** Branch protection (PR-only, no direct pushes,
required checks) makes the rule real, not just written. Full rule: `.claude/rules/git.md`.

## Deployment is optional (`deploy.enabled`, asked at /setup)

- **true** (default) — the full pipeline above: Engineer → staging → CI deploys the staging
  Storybook → QA tests the live staging URL → DevOps → production.
- **false** — no CI, no Pages, no DevOps. Engineer builds + vitest; QA tests the **local**
  Storybook preview; the lifecycle ends at **Passed**. `/deploy`, the DevOps agent, and
  `.github/workflows/pages.yml` are unused. The trust model is unchanged — evidence is still
  verified, just without a deployed URL.

## Status ladder (Airtable formula derives each)

`To-do → Ready for testing → To be fixed / To be deployed → Fixing / Fixed →
Ready for TIP → To be TIP fixed / To be re-deployed → TIP Fixing / TIP Fixed → Completed`

## Stack (summary — full detail in .claude/rules/stack.md)

React + TypeScript strict · tokens as CSS variables from `tokens.json` (never a raw value) ·
Storybook for states · **vitest** for units · Astro Starlight for docs · GitHub Pages for hosting ·
Airtable dashboard · Asana tasks.

## Config

- Names + ids live in `sunim.config.json`. Secrets in `.env`.
- Claude runs on your Pro login — never set `ANTHROPIC_API_KEY`.

## Kill switch

`AGENTS_PAUSED` at the repo root halts every agent above Observer before its next write.
Create the file to stop the fleet; delete it to resume. A hook enforces it — see `.claude/settings.json`.
