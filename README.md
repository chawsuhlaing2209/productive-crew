# Sunim Design System — agentic crew

A local design-system crew you run from your editor's chat, on your Pro plan. No API key.
Figma → code → test → ship, with a fleet of agents you can watch, verify, and govern.

## New here?

Read **`getting-started.md`**, then run **`/setup`** — it interviews you, creates your new
Airtable base + Asana project, and writes your `.env` and `sunim.config.json`. No manual setup.

## Run it (after setup)

1. Open this repo in the Claude Desktop **Code** tab (or Cursor / Codex). `npm install`.
2. Drive the crew from chat:

| Type | Does |
|---|---|
| `/tokens` | 🎨 audit + rebuild tokens.json (Style Dictionary) from Figma |
| `/parity` | 🔁 check Figma ↔ code token parity |
| `/build <Component>` | 🔨 Figma → code + stories + vitest → staging |
| `/test <Component>` | 🔍 test the deployed preview, log findings |
| `/deploy <Component>` | 🚀 promote to production (needs your approval) |
| `/sweep` | 🧭 verify the board + sync Asana |

## How it's built

- **`AGENTS.md`** — the rules every AI IDE reads. `CLAUDE.md` imports it.
- **`.claude/agents/`** — the fleet (subagents). **`.claude/skills/`** — the slash workflows.
- **`.claude/rules/`** — stack + token + component conventions, loaded when relevant.
- **`governance/`** — the operating model, the **agent registry**, ADRs, review cadence.
- **`scripts/`** — deterministic verifiers. Evidence only counts once these pass.
- **`.github/workflows/`** — free CI: tests → deploy staging & production to GitHub Pages.

## The rules that keep it safe

- **Nobody writes status.** Agents write evidence; a script verifies it; Airtable's formula derives the stage.
- **Every agent has a level and a scope** — see `governance/registry.md`.
- **Kill switch:** create a file named `AGENTS_PAUSED` at the root to halt the fleet. Delete it to resume.
- **Public repo** so GitHub Actions + Pages are free. Claude runs on your Pro login — no `ANTHROPIC_API_KEY`.

## Still to fill in

- The **semantic token naming hierarchy** in `.claude/rules/tokens.md` (unblocks token-audit step 6).
- Your **orchestrator name** + first review date in `governance/registry.md` and `cadence.md`.
