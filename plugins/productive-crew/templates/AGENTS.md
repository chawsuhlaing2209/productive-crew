# Productive Crew — agent rules

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
platforms in `tokens.platforms`. If that setup is missing, the PM assigns 🎨 token-builder to set up
the token configuration first. Components are never built on unconfigured tokens.

## Front door — every request starts here

Any component request (e.g. "build Button") goes to the **PM** first. Never skip to building,
and **never ask the user for a Figma node** — it lives in the Airtable row.

1. **Config check.** Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/preflight.js"`. If config isn't set up
   (missing `productive.config.json`, or placeholder ids), run `/productive-crew:setup` and stop.
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
| 🎨 token-builder | tokens.json (imported) → Style Dictionary build (no Airtable) | Senior |
| 🔨 Engineer | Figma → code + vitest → PR to staging | Junior |
| 🔍 QA | test staging → findings + verdict | Senior |
| 🚀 DevOps | staging → main → production deploy | Junior (prod gated) |
| 🧭 PM | verify records + links · sync Asana (daily) | Autonomous |
| 📄 doc-generator | docs/ | Senior (optional) |
| ⚖️ governance-review | proposes trust promotions — read-only | Advisor |

The human orchestrator (you) owns the registry — see `governance/registry.md`. The agents themselves
ship with the plugin; install or update it to change them.

## The loop

```
To-do → 🔨 build + vitest → staging published → 🔍 QA staging → 🚀 deploy → ✅ Completed
        ↕ fix loop (Engineer ↔ QA) at the test stage
```

A human approves before production. Publishing is CI or a deploy command — see `deploy.provider`
below — never an agent inventing a URL.

## Git — three tiers

`component/<name> → staging → main`. Every PR targets **staging** — never main. Main accepts PRs
from **staging only**, opened by DevOps with the human's approval. **The merge to staging deploys
the staging Storybook — that deploy is the evidence.** Branch protection (PR-only, no direct pushes,
required checks) makes the rule real, not just written. Full rule: `rules/git.md` in the productive-crew plugin.

## Who publishes is configurable (`deploy.provider`)

The crew needs a **staging URL it can verify**. It does not care who produced it.

- **`github-pages`** — the bundled `.github/workflows/pages.yml` builds and publishes on push.
- **`command`** — you publish. Set `deploy.stagingCommand` / `deploy.productionCommand` to anything
  that deploys a static Storybook and **prints the deployed URL as its last line of stdout**:
  Vercel, Netlify, Cloudflare Pages, surge, an internal host. Use this whenever GitHub Actions
  isn't available to you — a locked account, a private runner policy, an org that disables it.

## Deployment is optional (`deploy.enabled`, asked at /productive-crew:setup)

- **true** (default) — the full pipeline above: Engineer → staging → CI deploys the staging
  Storybook → QA tests the live staging URL → DevOps → production.
- **false** — **not wired yet, rather than a supported end state.** No CI, no Pages, no DevOps,
  and so no staging link — which means **no QA stage and no Staging Testing rows.** The Engineer's
  own checks are the only gate and the board tracks the commit alone. QA will refuse to run: a
  local Storybook is not the deployed build, and recording local results as staging evidence is
  the one thing the board must never contain. Turn it on as soon as the repo has a remote and
  Pages is enabled.

## Status ladder (Airtable formula derives each)

`To-do → Ready for Testing → To be fixed / Fixing / Fixed → To be deployed → Completed`

Testing happens on staging only — there is no production-testing (TIP) loop. `Completed` means the
production Storybook is deployed.

## Stack (summary — full detail in the productive-crew plugin (rules/stack.md))

React + TypeScript strict · tokens as CSS variables from `tokens.json` (never a raw value) ·
Storybook for states · **vitest** for units · Astro Starlight for docs · GitHub Pages for hosting ·
Airtable dashboard · Asana tasks.

## Config

- Names + ids live in `productive.config.json` (this repo). **Secrets live in the plugin config**
  — set at install time, never in this repo.
- Claude runs on your Pro login — never set `ANTHROPIC_API_KEY`.

## Kill switch

`AGENTS_PAUSED` at the repo root halts every agent above Observer before its next write.
Create the file to stop the fleet; delete it to resume. A hook enforces it — the plugin ships it.
