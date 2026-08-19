# Productive Crew

A design-system team that works inside your editor's chat.

You point it at a Figma component. It writes the code, builds the stories, tests every variant
against your design in a real browser, publishes a preview link, and keeps a board up to date so you
can see where everything is — without you writing code or updating a tracker.

**Nobody types a status.** The agents produce evidence — a commit, a preview link, a test result —
and the board works out the stage from that. If a status looks wrong, the evidence is wrong, and you
can go and look at it.

---

## What you'll need

| What | What it's for | Notes |
|---|---|---|
| **Claude Code** | where you type the commands | Desktop app, IDE extension, or terminal |
| **Node.js** | runs the build on your machine | [nodejs.org](https://nodejs.org) — the "LTS" version |
| **A Figma file** | your components and variables live here | Any paid tier with Dev Mode |
| **An Airtable base** | the board — what's built, tested, shipped | Free tier. You build it once, by hand — Step 2 |
| **A GitHub repo** | where the code lives | Free |

**Asana is optional.** With it, each component gets a ticket and a comment trail. Without it,
everything still works — you just won't have tickets.

**Claude in Chrome** is worth installing before you start. It's the browser extension that lets QA
test in *your* browser, so you can watch it work and take over when something looks wrong.

---

## Which path are you on?

Everything in **Part 1** is the same either way. Part 2 forks.

| | Start here |
|---|---|
| **Path A** — an empty folder. No code yet, no components. You want the crew to build the whole thing. | [Part 2 · Path A](#path-a--starting-from-an-empty-folder) |
| **Path B** — a repo that already exists, with components in it. You want the crew to join in without breaking anything. | [Part 2 · Path B](#path-b--an-existing-repo-with-components) |

If you're not sure: do you have a `package.json`? That's Path B.

---
---

# Part 1 · Set up

*Same for both paths. About twenty minutes, once.*

## Step 1 · Install the plugin

In Claude Code, type:

```
/plugin marketplace add chawsuhlaing2209/productive-crew
```

```
/plugin install productive-crew@productive
```

**You'll be asked for one token: Asana.** It's optional — skip it and the crew runs without
ticketing. It's a *personal access token*, not a login: there is no "Sign in with Asana" button
here, so if you're waiting for one, that's why it never appears. Get it from
[Asana's token page](https://developers.asana.com/docs/personal-access-token).

**Figma** authorizes by login instead, the first time something needs it. If Figma reads fail later,
type `/mcp` and authorize it there.

**Airtable is not asked for here** — it's Step 3, and it's deliberately different. See below.

Restart Claude Code after installing.

---

## Step 2 · Build the board in Airtable

The crew can't build this for you reliably, so you build it once and it verifies it. Ten minutes.

Create a new base with **two tables**. Every name is Title Case, and **Airtable is case-sensitive** —
`Staging storybook` is a different field from `Staging Storybook`, and the crew will simply not find
it. Setup checks this for you and tells you exactly what's off.

**Table 1 — `Components`**

| Field | Type |
|---|---|
| `Components` | single line text *(the primary field)* |
| `Category` | single select |
| `Figma` | URL |
| `Design` | single select: `Not started` · `In progress` · `Done` |
| `Commit` | URL |
| `Staging Storybook` | URL |
| `Production Storybook` | URL |
| `Astro Link` | URL |
| `[Staging] Test Records` | link to *Staging Testing* |
| `Staging Testing Results Summary` | rollup over `[Staging] Test Records` → `Testing Results`, using `ARRAYJOIN(values)` |
| `Development` | **formula** — below |

**Table 2 — `Staging Testing`**

| Field | Type |
|---|---|
| `Component/Sub Component` | single line text |
| `Testing Results` | single select: `Passed` · `Failed` · `Fixed (To re-test)` |
| `Expected Results` | long text |
| `Attachment` | attachment |
| `Suggestion for Improvement` | long text |
| `Composed In` | link to *Components* |
| `Variants` | single select — e.g. `Primary` |
| `Size` | single select — e.g. `sm` · `md` · `lg` |
| `State` | single select — e.g. `default` · `hover` · `focus` · `disabled` |
| `Context` | single line text — e.g. `Chrome 141 · 1440×900` |

**Variants, Size and State are their own columns, not folded into the case name.** They're what
makes the board sliceable — *every hover state that failed*, *everything at `sm`* — and a row named
`Button/Primary hover sm` answers none of those.

Then paste this into the `Development` formula field:

```
IF(
  AND(
    FIND("Failed", {Staging Testing Results Summary} & "") > 0,
    FIND("re-test", {Staging Testing Results Summary} & "") > 0
  ),
  "Fixing",
IF(
  FIND("Failed", {Staging Testing Results Summary} & "") > 0,
  "To be fixed",
IF(
  FIND("re-test", {Staging Testing Results Summary} & "") > 0,
  "Fixed",
IF(
  {Production Storybook},
  "Completed",
IF(
  {Staging Testing Results Summary} != "",
  "To be deployed",
IF(
  {Staging Storybook},
  "Ready for Testing",
IF(
  AND({Figma}, {Design} = "Done"),
  "To-do",
  ""
)))))))
```

> **Prove the formula before you trust it — sixty seconds.** Take any component, add one row to
> Staging Testing linked to it with `Testing Results` = **Failed**. `Development` should immediately
> read **To be fixed** — even if that component was already `Completed`. If it still says Completed,
> the order is wrong and a regression on a shipped component will never surface. Fix that before
> building anything on this base.

The full contract, including why the order matters, lands in your project at
`governance/airtable-schema.md` after setup.

---

## Step 3 · Store your Airtable token

This is the one step you do in **Terminal** rather than in chat, and there's a reason: anything you
type in a chat is kept in the conversation transcript, and a token in a transcript has to be treated
as leaked.

1. Create a [personal access token](https://airtable.com/create/tokens) with these three scopes on
   your base: **`data.records:read`**, **`data.records:write`**, **`schema.bases:read`**.

2. Open **Terminal** and paste this exactly — it finds the plugin wherever it installed itself:

   ```bash
   node "$(find ~/.claude/plugins/cache -path '*productive-crew*/scripts/credentials.js' | sort -V | tail -1)" store airtable
   ```

3. Paste your token at the prompt and press Enter. **Your typing is hidden** — that's expected, not
   a frozen screen.

It's saved to `~/.claude/productive-crew/credentials.json`, readable only by you. No shell config to
edit, no restart, and you never do it again.

Check it landed:

```bash
node "$(find ~/.claude/plugins/cache -path '*productive-crew*/scripts/credentials.js' | sort -V | tail -1)" check airtable
```

> Running in CI, or you'd rather use an environment variable? `AIRTABLE_API_KEY` works too, and
> takes precedence over the stored file.

---

## Step 4 · Export your tokens from Figma

This is the one step the crew can't do for you, and it's worth understanding why: Figma's live
connection only reports variables that are **actually used** somewhere in the file. Anything you
defined but haven't applied yet would silently go missing. So the tokens come from a proper export.

The crew is set up for the free Figma plugin
**[Design Tokens](https://www.figma.com/community/plugin/888356646278934516/design-tokens)**
by Lukas Oppermann.

1. Install it in Figma and run it on your design system file.
2. Export as **a single JSON file**, including both your **variables** and your **styles** — the
   styles are where your text and shadow definitions live, and you want them too.
3. Save it as **`tokens/tokens.json`** in your project folder. That exact name and place —
   everything downstream looks for it there. *(Path A: create the folder first, in Step A1.)*

From then on, whenever your variables change, re-export over the same file and run
`/productive-crew:tokens`.

**You don't have to configure anything for this.** Setup installs a build config already tuned for
that plugin's output.

<details>
<summary>What it handles for you, if you're curious</summary>

Four things about this export would silently produce the wrong result with a default setup:

- **A variable with several modes** exports as one token per mode, with the mode baked into the
  name. Left alone you'd get `--color-day-surface-page` and `--color-night-surface-page` as separate
  variables instead of one name that changes value per theme.
- **Shadows and text styles** come through with non-standard type names, so the usual handling never
  fires and they render as `[object Object]`.
- **Multi-stop shadows** arrive as separate numbered pieces rather than one shadow.
- **Spacing values** arrive as plain numbers, and the usual handling reads `4` as `4rem` — 64px.

</details>

> **Don't hand-edit `tokens/tokens.json`.** It's a copy of what's in Figma. Change it in Figma and
> re-export, or your next export will quietly wipe your edit.

---
---

# Part 2 · Point the crew at your project

## Path A · Starting from an empty folder

*No code yet. Setup will scaffold the whole thing.*

### A1 · Make the folder and the repo

Create an empty folder, and a matching **empty** GitHub repo (no README, no .gitignore — setup adds
those). Then, in Terminal:

```bash
cd ~/your-design-system && git init && git remote add origin https://github.com/YOU/your-design-system.git
```

Create the tokens folder while you're here, and put your Step 4 export in it:

```bash
mkdir -p tokens
```

### A2 · Run setup

Open the folder in Claude Code and type:

```
/productive-crew:setup
```

It looks at the folder first, finds it empty, and asks you the things it can't work out. Expect:

- **What's this design system called?**
- **Which framework and language?** — React · Angular · Vue · Svelte · Web Components · SwiftUI · Compose
- **Which token outputs?** — CSS, SCSS, JS, TS, iOS, Android
- **Your Figma file** — paste the link. One file for everything, or separate files for tokens and components
- **Your GitHub repo** — `owner/repo`
- **Your branch flow** — it offers `main` for production and a `staging` branch for previews
- **Your Airtable base id** — the `app…` string in your base URL
- **Your Asana project id** — or skip
- **Where should the preview live?** — see [below](#where-should-the-preview-live)
- **Your name**, for the governance record

Then it scaffolds: `package.json`, Storybook, vitest, the Style Dictionary config, `src/`,
`governance/`, `AGENTS.md`, `CLAUDE.md`, a GitHub Pages workflow, and `productive.config.json`.

### A3 · Build your tokens

```
/productive-crew:tokens
```

This turns `tokens/tokens.json` into the CSS and JS your components will use, one theme per Figma
mode, and tells you if anything is missing. **Do this before your first component** — a component
built on unbuilt tokens is built on nothing.

### A4 · Register your first component

The board is the to-do list, so a component has to be on it before anyone builds it. In Airtable,
add a row to **Components**:

- **Components** — the name, e.g. `Button`
- **Figma** — the node link. In Figma, right-click the component set → **Copy link to selection**
- **Design** — set it to **Done**

`Development` should now read **To-do**. That's the crew's signal that it's ready to be built.

> Don't want to open Airtable? Just say `/productive-crew:build Button` — the PM will notice it
> isn't registered and offer to add it.

**→ Now go to [Part 3 · The loop](#part-3--the-loop).**

---

## Path B · An existing repo with components

*You already have code. The rule for this whole path: setup **adopts**, it never overwrites.*

### B1 · Read this first — the one thing that can bite you

Setup is safe. It reads your repo, adopts what's there, and copies in only files you don't already
have. It will not touch `package.json`, your token pipeline, your CI, or your component structure.

**`/productive-crew:build <Component>` is different.** It builds a component *from the Figma design*,
and if a component of that name already exists it will rewrite it. That's the right behaviour when
you want the crew to take a component over. It is the wrong behaviour when you just wanted it tested.

So for anything already built, decide which you're doing:

| You want | Do this | What happens to your code |
|---|---|---|
| The crew to **take over** a component and rebuild it from Figma | register it, then `/productive-crew:build` | rewritten from the design |
| The crew to **test** what you already have | register it, publish a preview, then `/productive-crew:test` | untouched |

Work on a branch for the first one either way, so you can see the diff before you keep it.

### B2 · Run setup

Open your repo in Claude Code and type:

```
/productive-crew:setup
```

It reads the repo before asking anything, and shows you what it found:

```
🔎 Detected · existing repo
React + TypeScript · vitest · components in src/ui/ · default branch main · no token pipeline · 1 deploy workflow
→ confirm stack · adopt branch flow · scaffold tokens · keep your workflow
```

Everything it detected is a **one-line confirmation**, not a question. It only asks you fresh for
what your repo doesn't answer — usually just your Figma file, your Airtable base id, your Asana
project id, and where previews should live.

What it does with what you already have:

| You have | What setup does |
|---|---|
| A token pipeline (Style Dictionary or otherwise) | **Adopts it.** No second pipeline, no config overwritten |
| Storybook | Uses yours |
| A test runner | Uses yours |
| CI / a deploy workflow | **Keeps it.** It asks whether to adapt it or add alongside — never clobbers |
| A `staging`, `develop` or `preview` branch | Adopts it as the preview branch |
| `AGENTS.md` or `CLAUDE.md` | Appends the crew section — never replaces |
| A `governance/` folder | Leaves it, but always adds `airtable-schema.md` |

The only file it *always* writes is `productive.config.json`, which holds names and ids and
**never a token**.

### B3 · Build your tokens

If setup adopted your existing pipeline, keep using it — skip this.

If it scaffolded one, put your Step 4 export at `tokens/tokens.json` and run:

```
/productive-crew:tokens
```

It reports what it built and what's missing. Existing components keep working; nothing is rewired
until you rebuild a component.

### B4 · Start with one component

Not the whole library. Pick one, register it in Airtable — add a row to **Components** with the name,
the **Figma** node link (right-click the component set → **Copy link to selection**), and **Design**
set to **Done**.

Then run the one you chose in B1: `build` to have it rebuilt from Figma, or publish a preview and
run `test` to check what you already have.

Look at the result properly before you register a second one. The point of starting with one is that
you find out what the crew does to *your* code while the blast radius is a single file.

**→ Now go to [Part 3 · The loop](#part-3--the-loop).**

---

### "Where should the preview live?"

QA tests the **published preview**, not your laptop — so a component isn't testable until it's
deployed somewhere. Setup asks where.

| You say | What it sets up | You do once |
|---|---|---|
| **GitHub Pages** | The bundled workflow publishes on push | Settings → Pages → Source = GitHub Actions |
| **Vercel** | A deploy command | `vercel login` |
| **Netlify** | A deploy command | `netlify login` |
| **Cloudflare Pages** | A deploy command | `wrangler login` |
| **Something else** | Your command | tell setup what it is |

If GitHub Actions is unavailable to you — a locked account, an org policy — pick one of the others.
That was a real blocker for this project once, and it's why the crew doesn't assume Actions.

The one rule that makes any of them work: **the deploy command's last line of output must be the
URL.** Run it by hand once and check, before it becomes load-bearing.

---
---

# Part 3 · The loop

*The same for both paths, and the same every day.*

## Build

```
/productive-crew:build Button
```

What happens:

1. **🧭 PM checks the ground** — is the project set up, are the tokens built, is Button on the board.
   It opens a ticket before anyone starts work.
2. **🔨 Engineer reads the design** — it takes the Figma node from the board, so you don't paste
   links. It lists every variant, size and state in your component set — that list becomes the
   props, the stories, and the tests.
3. **It writes the component**, using your tokens. If a colour in Figma isn't attached to a variable,
   it will *tell you* rather than guess — that's a gap in the design, not something to invent.
4. **It runs the checks** — types, linting, unit tests, and every story loaded in a real browser.
5. **It looks at what it built**, in Chrome, against your Figma design, and fixes what doesn't match
   before anyone else sees it.
6. **It publishes the preview** and hands back the link. The PM checks the link really works, writes
   it to the board, and comments it on the ticket.

The board now says **Ready for Testing**.

If something goes wrong it stops and tells you what and why — it doesn't hand you a broken component
with a green tick.

## Test

```
/productive-crew:test Button
```

**Watch your browser.** A new tab opens on your preview link, and QA works through every variant,
size and state — checking against Figma, driving hover and focus and keyboard, and checking it's
usable with a screen reader. You can take the tab over at any point.

Every check becomes a row on your board — passes as well as failures — so "all tests passed" means
something you can count.

Each failure is written the same way every time:

```
Issue type: visual
Expected:   text should use text/primary
Observation: renders pure black
Fix:        correct token: text-primary
```

Never a raw hex code — always the name of the token or prop, so the fix is unambiguous.

**QA only tests the published preview.** If you ask it to check something locally it will, but it
won't write those results to the board, because they're not about the build everyone else can see.

## Fix

Failures put the component at **To be fixed**.

```
/productive-crew:build Button
```

The Engineer fixes, pushes a new preview, and marks the failing rows **Fixed (To re-test)** — a
claim, not a verdict. The board reads **Fixed**, which is a waiting room, not a pass.

```
/productive-crew:test Button
```

QA re-tests those rows and closes them. Pass → **To be deployed**. Fail → back to **To be fixed**,
and round again.

> **The loop stops itself at three.** If the same case has been claimed fixed three times and failed
> re-test three times, the crew refuses a fourth attempt and asks for a decision instead — because
> at that point the problem probably isn't where everyone keeps looking. It might be the design, or
> the test, rather than the code.

## Ship

When everything passes, the board says **To be deployed**. Then, when *you* decide:

```
/productive-crew:deploy Button
```

Production always waits for a person. The crew will tell you a component is ready; it will never
ship it because it thinks it's ready.

---
---

# Reference

## What the statuses mean

You never set these. The board works them out from what's been recorded:

| Status | Means |
|---|---|
| *(empty)* | Nothing recorded yet |
| **To-do** | It has a Figma link and the design is marked Done |
| **Ready for Testing** | The preview link is live |
| **To be fixed** | At least one test failed |
| **Fixing** | Some failures fixed, some still failing |
| **Fixed** | All failures fixed — waiting on QA to re-test |
| **To be deployed** | Everything passed |
| **Completed** | It's in production |

A failure always wins. If a test fails on something already shipped, it drops back to
**To be fixed** — a released component can't hide a regression.

## Who's on the crew

| | Does | Can't |
|---|---|---|
| 🧭 **PM** | Checks everything is real, opens tickets, writes evidence to the board | Build, test, or deploy |
| 🎨 **token-builder** | Turns your exported tokens into code | Touch the board or your components |
| 🔨 **Engineer** | Builds the component, publishes the preview | Write evidence — it reports, the PM records |
| 🔍 **QA** | Tests it in your browser, logs findings | Fix anything it finds |
| 🚀 **DevOps** | Ships to production, once you approve | Approve its own deploy |
| 📄 **doc-generator** | Writes the docs page | Invent what a component is for — it asks |
| ⚖️ **governance-review** | Proposes which agents have earned more autonomy | Change anyone's level, including its own |

The limits are the point. QA can't quietly fix what it finds, so every problem goes back through the
Engineer and is on the record. The Engineer can't mark its own work done — the one exception is
claiming a repair, which QA then has to confirm.

## All the commands

| Command | What it does |
|---|---|
| `/productive-crew:setup` | Set the project up. Run once |
| `/productive-crew:build <Component>` | Build a component and publish a preview |
| `/productive-crew:test <Component>` | Test it against Figma in your browser |
| `/productive-crew:test` | Ask which of the ready components to test |
| `/productive-crew:deploy <Component>` | Ship to production — needs your approval |
| `/productive-crew:tokens` | Rebuild tokens after a new export |
| `/productive-crew:sweep` | Check the whole board and tell you what needs you |
| `/productive-crew:docs <Component>` | Write the docs page |
| `/productive-crew:review` | Monthly check: which agents have earned more trust, which have lost it |

## Make the sweep run itself

`/productive-crew:sweep` is what notices work nobody was told about — a component that failed testing
with no ticket, one sitting ready to ship. It's worth having run on its own.

Ask Claude: *"run the productive-crew sweep for ~/my-design-system every weekday at 8:55am."*

**Name the project folder in the request** — a scheduled run starts fresh with no memory of the
conversation that set it up, so it needs telling where to look.

Then tell the crew what you scheduled, in `productive.config.json`:

```json
"schedule": { "sweep": { "everyHours": 24 } }
```

That line doesn't run anything — it's what makes a *stopped* scheduler visible. A job that quietly
stops firing looks exactly like a board with nothing to report; both are silence. With the cadence
declared, every sweep records itself, and the next time you open the project Claude tells you it
hasn't run in four days.

Do this once the crew is actually working. A daily job firing into a half-configured project just
produces a daily failure you learn to ignore.

## When something stops

The crew stops rather than guessing. Most stops are one of these:

| It says | What to do |
|---|---|
| *not set up* | Run `/productive-crew:setup` |
| *no Airtable token* | Step 3 — the Terminal command. Pasting it into the plugin settings doesn't reach the crew |
| *tokens not built* | Export from Figma to `tokens/tokens.json`, then `/productive-crew:tokens` |
| *no ticket* | Start with `/productive-crew:build`, not by calling an agent directly |
| *no preview link* | The component hasn't been published yet — build it first |
| *config expects "X", base has "x"* | Airtable is case-sensitive. Rename either side |
| *Storybook won't start* | Usually a missing dependency. Try `npm install` |
| *deploy command failed* | Run your deploy command by hand and see what it says |
| *no browser connected* | Install the Claude in Chrome extension and sign in |
| *Asana won't connect* | The token wasn't captured at install. Reinstall the plugin and paste it at the prompt |
| *Figma reads fail* | Run `/mcp` and authorize Figma. It needs a login, not a token |
| *UNVERIFIED — GitHub returned 403* | Rate limited, or the repo is private. Set `GITHUB_TOKEN` |
| *unbound in Figma* | A colour or spacing isn't attached to a variable. Fix it in Figma, re-export |
| *claimed fixed 3 times* | The loop bound. Decide what's actually wrong before trying a fourth time |

## Keeping your tokens out of the repo

Three guards, because there are three ways a token gets in.

- **An agent writing one** — a hook blocks any write carrying a credential, before it happens.
- **You pasting one** — run `git config core.hooksPath .githooks` once per clone, and a commit
  containing a credential is refused.
- **Either of you pasting one into the chat** — which is why the Airtable token is stored from
  Terminal instead. A transcript is not a secret store.

The rule underneath all three: a file in your repo **references** a token, it never contains one.
Your Airtable token lives in `~/.claude/productive-crew/credentials.json`, outside every repo.

> **If a token has already been committed, or pasted into a chat, rotate it.** Deleting the file
> doesn't remove it from git history, and a token in a public repo should be treated as compromised.

## Stop everything

Create a file called `AGENTS_PAUSED` in your project folder. Every agent halts before its next
change. Delete the file to resume.

## What lands in your project

Only `productive.config.json` (names and ids — never a password or token), `AGENTS.md` and
`CLAUDE.md` so other AI tools read the same rules, a `governance/` folder, and any scaffolding you
didn't already have.

The crew itself — the agents, the rules, the scripts — stays in the plugin. Update the plugin and
every project gets the improvement.

## For developers

<details>
<summary>Repo layout and local development</summary>

```
.claude-plugin/marketplace.json    the catalog
plugins/productive-crew/
├── .claude-plugin/plugin.json     manifest — incl. the Asana token prompt
├── agents/                        the seven crew members
├── skills/                        the slash commands
├── rules/                         git tiers, status ladder, the law, the QA plan
├── scripts/
│   ├── board.js                   the only door to the board — get · list · set · tests · schema
│   ├── board/                     airtable (REST) and file providers
│   ├── credentials.js             where tokens come from — env, then ~/.claude/…
│   ├── verify.js                  prove it — commits resolve, links answer
│   ├── run-log.js                 did the scheduled work actually happen
│   ├── preflight.js               is this project set up
│   ├── status.js                  the ladder, as a function
│   └── token-check.js             every Figma token present in the build
├── hooks/hooks.json               kill switch + session-start law injection
├── .mcp.json                      figma · asana
├── settings.json                  default permissions
└── templates/                     what /setup scaffolds into a project
```

**No Airtable MCP server.** The board is reached over the REST API by `scripts/board.js`, with the
token from `credentials.js`. One code path, one credential, and a write gate that can't be gone
around: evidence fields only, verified before writing, and `Development` refused outright.

**Run the crew with no Airtable at all** — put `"board": { "provider": "file" }` in
`productive.config.json` and the board becomes `.crew/board.json`. Same commands, same ladder, same
gates. It's a different board, not a cache of one.

Develop against a local checkout:

```
/plugin marketplace add ./path/to/productive-crew
/plugin install productive-crew@productive
/reload-plugins
```

Changes need a version bump in both `plugin.json` and `marketplace.json` — the install cache is
keyed by version and won't refresh without one.

</details>

MIT.
