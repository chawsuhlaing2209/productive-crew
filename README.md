# Productive Crew

A design-system crew for Claude Code, installable into any project.

Figma → tokens → component → tested, deployed Storybook — run from your editor's chat.
**Nobody types a status.** Agents write evidence (a commit URL, a staging link, a test result),
a script verifies the evidence is real, and Airtable's formula derives the stage from it.

## Install

```
/plugin marketplace add chawsuhlaing2209/productive-crew
/plugin install productive-crew@productive
```

You'll be asked for an Airtable token (required) and an Asana token (optional) at install time.
They're stored in Claude Code's plugin config — never in your repo.

Then, in the project you want a design system in:

```
/productive-crew:setup
```

Setup detects what your repo already has — framework, branches, token pipeline, CI — confirms it,
and scaffolds only what's missing. It never overwrites.

## The crew

| Agent | Owns | Level |
|---|---|---|
| 🎨 token-builder | tokens.json (imported) → Style Dictionary build | Senior |
| 🔁 token-parity | Figma ↔ code token parity | Autonomous |
| 🔨 engineer | Figma → code + vitest → PR to staging | Junior |
| 🔍 qa | test staging then production → findings + verdict | Senior |
| 🚀 devops | staging → main → production deploy | Junior (prod gated) |
| 🧭 pm | verify records + links · sync Asana | Autonomous |
| 📄 doc-generator | docs/ | Senior (optional) |

## Commands

| Command | Does |
|---|---|
| `/productive-crew:setup` | onboard a repo — interview, create the board, scaffold the gaps |
| `/productive-crew:build <Component>` | PM intake → Engineer builds → staging |
| `/productive-crew:test <Component>` | QA tests it against Figma, logs findings |
| `/productive-crew:deploy <Component>` | DevOps promotes staging → production (human-gated) |
| `/productive-crew:tokens` | token audit — rebuild from Figma |
| `/productive-crew:parity` | Figma ↔ code token parity check |
| `/productive-crew:sweep` | PM sweep — verify the whole board |

## What lands in your repo

Only `productive.config.json` (names and ids, never a secret), `AGENTS.md` + `CLAUDE.md` (so Cursor and
Codex read the same law), `governance/`, and whatever scaffolding you didn't already have.
The agents, skills, rules, and scripts stay in the plugin — update the plugin to change them.

## Kill switch

Create `AGENTS_PAUSED` at your project root. A PreToolUse hook halts every agent before its next
write. Delete the file to resume.

## Repo layout

```
.claude-plugin/marketplace.json    the catalog
plugins/productive-crew/
├── .claude-plugin/plugin.json     manifest — incl. the token prompts
├── agents/                        the seven crew members
├── skills/                        the slash commands
├── rules/                         git tiers, status ladder, stack, trust levels, the law
├── scripts/                       preflight · verify · record · parity-check
├── hooks/hooks.json               kill switch + session-start law injection
├── .mcp.json                      figma · airtable · asana
├── settings.json                  default permissions
└── templates/                     what /setup scaffolds into a project
```

## Local development

```
/plugin marketplace add ./path/to/productive-crew
/plugin install productive-crew@productive
/reload-plugins
```

MIT.
