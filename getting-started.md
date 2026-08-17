# Getting started — build your design system

You have a Figma library. By the end of this you have a running crew that turns it into a
tested, documented, deployed design system — driven from chat, on your Claude plan.

## 0 · Prerequisites (once per machine)

Node · Git · Cursor · Claude Desktop · a Figma **Education/Pro** account with Dev Mode.
Full walkthrough: see your course's **Set up your AI workspace** page.

## 1 · Open the repo

Unzip this folder, open it in the Claude Desktop **Code** tab (Local). `npm install`.

## 2 · Run `/setup` — the crew interviews you

Type **`/setup`**. It asks you the questions below, then **creates your new Airtable base and
new Asana project for you**, and writes your `.env` + `sunim.config.json`. Nothing by hand.

**What it asks:**

| # | Question | Example |
|---|---|---|
| 1 | Design-system name | Pineapple DS |
| 2 | Your Figma file(s) — **one file? just give that.** Separate? tokens + components | one: …/AbC  ·  or tokens + components |
| 3 | GitHub repo (public, for free hosting) | yourname/pineapple-ds |
| 4 | Airtable — **create a new base for me?** | yes → it builds the tables + formula |
| 5 | Asana — **create a new project for me?** | yes → it builds the board + subtasks |
| 6 | token-audit schedule | daily · weekly · manual |
| 7 | Generate Astro docs? | yes / no |
| 8 | Orchestrator name (you) | for the registry |

**What it creates in Airtable** (the new base): `Components`, `Base Tokens`, `Semantic Tokens`,
`Staging Testing`, `Production Testing` — with the derived **Development** formula wired up
(*nobody sets status by hand*).

**What it creates in Asana** (the new project): one task per component + lifecycle subtasks
(Implementation · Test · Fix · Deploy).

**What it writes locally:** `.env` (your tokens — gitignored) and `sunim.config.json` (names + the
new ids it just made).

## 3 · Bring your tokens in

- **`/tokens`** — 🎨 reads your Figma variables, builds `tokens.json`, fills the Base + Semantic tables.
- **`/parity`** — 🔁 confirms Figma and code tokens agree.

## 4 · Build your first component

- **`/build <Component>`** — 🔨 Figma → code + stories + vitest → staging.
- **`/test <Component>`** — 🔍 tests the staging preview, logs findings (token names, never raw values).
- Fix loop until green → **`/deploy <Component>`** — 🚀 (your approval) → production.
- **`/sweep`** — 🧭 the PM verifies the board and syncs Asana any time.

## 4b · Turn on branch protection

Once your GitHub repo exists, protect **`staging`** and **`main`** (Settings → Branches):
PR-only, no direct pushes, required checks. Main takes PRs from `staging` only. This is what makes
`component → staging → main` a rule and not a suggestion. See `.claude/rules/git.md`.

## 5 · Govern it

`governance/registry.md` is the one file that says what each agent may touch. Name yourself the
orchestrator, set a first review date in `governance/cadence.md`, and you have a real operating model.

---

Stuck? Everything the crew knows is in `AGENTS.md`. The kill switch is a file named
`AGENTS_PAUSED` at the root — create it to stop the fleet, delete it to resume.
