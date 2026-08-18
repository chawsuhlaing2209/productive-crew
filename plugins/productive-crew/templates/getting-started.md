# Getting started — build your design system

You have a Figma library. By the end of this you have a running crew that turns it into a
tested, documented, deployed design system — driven from chat, on your Claude plan.

## 0 · Prerequisites (once per machine)

Node · Git · Cursor · Claude Desktop · a Figma **Education/Pro** account with Dev Mode.
Full walkthrough: see your course's **Set up your AI workspace** page.

## 1 · Open the repo

Open your repo in the Claude Desktop **Code** tab (Local) and `npm install`. The crew itself
arrives with the **productive-crew** plugin — install it and its agents, skills, and rules are
available in every session here.

## 2 · Run `/productive-crew:setup` — the crew interviews you

Type **`/productive-crew:setup`**. It asks you the questions below, then **creates your new
Airtable base and new Asana project for you**, and writes your `productive.config.json`.
Nothing by hand.

**What it asks:**

| # | Question | Example |
|---|---|---|
| 1 | Design-system name | Pineapple DS |
| 2 | Your Figma file(s) — **one file? just give that.** Separate? tokens + components | one: …/AbC  ·  or tokens + components |
| 3 | GitHub repo (public, for free hosting) | yourname/pineapple-ds |
| 4 | Airtable — **create a new base for me?** | yes → it builds the tables + formula |
| 5 | Asana — **create a new project for me?** | yes → it builds the board + subtasks |
| 6 | token-builder schedule | daily · weekly · manual |
| 7 | Generate Astro docs? | yes / no |
| 8 | Orchestrator name (you) | for the registry |

**What it creates in Airtable** (the new base): `Components`, `Base Tokens`, `Semantic Tokens`,
`Staging Testing` — with the derived **Development** formula wired up
(*nobody sets status by hand*).

**What it creates in Asana** (the new project): one task per component + lifecycle subtasks
(Implementation · Test · Fix · Deploy).

**What it writes locally:** `productive.config.json` — names and the new ids it just made.
**Never a secret.** Your Airtable and Asana tokens live in the plugin's own config, entered once
when you installed it, not in this repo. If one is missing the MCP server says so — set it from
`/plugin`, never by pasting it into a file.

## 3 · Bring your tokens in

- **`/productive-crew:tokens`** — 🎨 audits your Figma variables and builds them into code tokens (`tokens.json` → CSS variables, themed per Figma mode).

## 4 · Build your first component

- **`/productive-crew:build <Component>`** — 🔨 Figma → code + stories + vitest → staging.
- **`/productive-crew:test <Component>`** — 🔍 tests the staging preview, logs findings (token names, never raw values).
- Fix loop until green → **`/productive-crew:deploy <Component>`** — 🚀 (your approval) → production.
- **`/productive-crew:sweep`** — 🧭 the PM verifies the board and syncs Asana any time.

## 4b · Turn on branch protection

Once your GitHub repo exists, protect **`staging`** and **`main`** (Settings → Branches):
PR-only, no direct pushes, required checks. Main takes PRs from `staging` only. This is what makes
`component → staging → main` a rule and not a suggestion. See the productive-crew plugin (`rules/git.md`).

## 5 · Govern it

`governance/registry.md` is the one file that says what each agent may touch. Name yourself the
orchestrator, set a first review date in `governance/cadence.md`, and you have a real operating model.

---

Stuck? Everything the crew knows is in `AGENTS.md`. The kill switch is a file named
`AGENTS_PAUSED` at the root — create it to stop the fleet, delete it to resume.
