# Productive Crew

A design-system team that works inside your editor's chat.

You point it at a Figma component. It writes the code, builds the stories, tests every variant
against your design in a real browser, publishes a preview link, and keeps a board up to date so you
can see where everything is — without you writing code or updating a tracker.

**Nobody types a status.** The agents produce evidence — a commit, a preview link, a test result —
and the board works out the stage from that. If a status looks wrong, the evidence is wrong, and you
can go and look at it.

---

## Before you start

You need five things. Four are free.

| What | What it's for | Notes |
|---|---|---|
| **Claude Code** | where you type the commands | Desktop app, IDE extension, or terminal |
| **Node.js** | runs the build on your machine | [nodejs.org](https://nodejs.org) — the "LTS" version |
| **A Figma file** | your components and variables live here | Any paid tier with Dev Mode |
| **An Airtable base** | the board — what's built, tested, shipped | Free tier. You build it from the schema doc — a few minutes, once |
| **A GitHub repo** | where the code lives | Free. Must be created before setup |

**Asana is optional.** With it, each component gets a ticket and a comment trail. Without it,
everything still works — you just won't have tickets.

**Claude in Chrome** is worth installing before you start. It's the browser extension that lets QA
test in *your* browser, so you can watch it work and take over when something looks wrong.

---

## Step 1 · Install the plugin

In Claude Code, type:

```
/plugin marketplace add chawsuhlaing2209/productive-crew
/plugin install productive-crew@productive
```

**This is the only moment you're asked for your tokens.** They belong to the plugin, not to your
project, and `/productive-crew:setup` cannot set them later. If the prompts don't appear, the crew
installs but can't reach anything — see below.

| Token | Needed? | Where to get it |
|---|---|---|
| **Airtable** | **Required** — the board is the registry | [airtable.com/create/tokens](https://airtable.com/create/tokens), with read **and** write on your base |
| **Asana** | Optional — skip it to run without tickets | [Asana personal access token](https://developers.asana.com/docs/personal-access-token) |

**Both are personal access tokens — neither uses a "log in with…" button.** Asana in particular has
no login flow here; if you're waiting for one, that's why it never appears.

Figma is different: it authorizes by login rather than a token, the first time something needs it.
If Figma reads fail, run `/mcp` and authorize it there.

These are stored by Claude Code, never in your project folder. You paste them once.

Restart Claude Code after installing.

---

## Step 2 · Get your design tokens out of Figma

This is the one step the crew can't do for you, and it's worth understanding why: Figma's live
connection only reports the variables that are **actually used** somewhere in the file. Anything you
defined but haven't applied yet would silently go missing. So the tokens come from a proper export
instead.

The crew is set up for the free Figma plugin
**[Design Tokens](https://www.figma.com/community/plugin/888356646278934516/design-tokens)**
by Lukas Oppermann.

1. Install it in Figma and run it on your design system file.
2. Export your tokens as **a single JSON file**, including both your **variables** and your
   **styles** — the styles are where your text and shadow definitions live, and you want them too.
3. Save it in your repo as **`tokens/tokens.json`**. That exact name and place — everything
   downstream looks for it there.
4. Commit it.

From then on, whenever your variables change, re-export over the same file and run
`/productive-crew:tokens`. You can automate this later so it lands in the repo by itself.

**You don't have to configure anything for this.** Setup installs a build config already tuned for
that plugin's output — themes, shadows, text styles, and spacing all come out correct. If you export
from something else instead, that config is where you'd adapt it, and it explains what it's doing.

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

## Step 3 · Run setup

Open your project in Claude Code and type:

```
/productive-crew:setup
```

It reads your repo first — framework, branches, whether you already have Storybook, whether you
already have a deploy — then asks you only what it couldn't work out. Expect questions like:

- **What's this design system called?**
- **Your Figma file** — paste the link
- **Your Airtable base id** — you build the base once from `governance/airtable-schema.md`,
  which lists every field and the status formula. Setup then checks it matches and tells you
  exactly what's wrong if it doesn't
- **Where should the preview live?** — see below
- **Your name**, for the governance record

It only adds files you don't already have, and it never overwrites your work.

### "Where should the preview live?"

Every component gets a **preview link** — a published Storybook that you and QA can open. This
question decides who publishes it.

| Your answer | What happens | One-time setup |
|---|---|---|
| **GitHub Pages** | A workflow in your repo builds and publishes on every push | Repo Settings → Pages → Source = *GitHub Actions* |
| **Vercel** | Your machine builds it and pushes it up | Run `vercel login` once |
| **Netlify** | Same, via Netlify | Run `netlify login` once |
| **Cloudflare Pages** | Same, via Cloudflare | Run `wrangler login` once |

**If GitHub Actions doesn't work for you** — a locked account, or your workplace disables it — pick
one of the others. They build on their own machines, so your GitHub situation doesn't affect them.

> **Say yes to a preview.** Without one there's no QA stage and no test records — the crew builds
> your component and stops. You can turn it on later, but you'll be running with half a team.

---

## Step 4 · Build a component

```
/productive-crew:build Button
```

Here's what happens, and roughly what you'll see:

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

If something goes wrong, it stops and tells you what and why — it doesn't hand you a broken
component with a green tick.

---

## Step 5 · Test it

```
/productive-crew:test Button
```

**Watch your browser.** A new tab opens on your preview link, and QA works through every variant,
size and state — checking it against Figma, driving hover and focus and keyboard, and checking it's
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

**QA only tests the published preview.** If you ask it to check something locally before you push,
it will — but it won't write those results to the board, because they're not about the build
everyone else can see.

---

## Step 6 · Fix and ship

Failures put the component at **To be fixed**. Run `/productive-crew:build Button` again to fix, then
`/productive-crew:test Button` to re-check. When everything passes, the board says
**To be deployed**.

Then, when *you* decide:

```
/productive-crew:deploy Button
```

Production always waits for a person. The crew will tell you a component is ready; it will never
ship it because it thinks it's ready.

---

## The board

You never set these. The board works them out from what's been recorded:

| Status | Means |
|---|---|
| *(empty)* | Nothing recorded yet |
| **To-do** | It has a Figma link |
| **To be staged** | Code is committed |
| **Ready for Testing** | The preview link is live |
| **To be fixed** | At least one test failed |
| **Fixing / Fixed** | Being re-tested |
| **To be deployed** | Everything passed |
| **Completed** | It's in production |

A failure always wins. If a test fails on something already shipped, it drops back to
**To be fixed** — a released component can't hide a regression.

---

## Who's on the crew

| | Does | Can't |
|---|---|---|
| 🧭 **PM** | Checks everything is real, opens tickets, writes to the board | Build, test, or deploy |
| 🎨 **token-builder** | Turns your exported tokens into code | Touch the board or your components |
| 🔨 **Engineer** | Builds the component, publishes the preview | Write to the board — it reports, the PM records |
| 🔍 **QA** | Tests it in your browser, logs findings | Fix anything it finds |
| 🚀 **DevOps** | Ships to production, once you approve | Approve its own deploy |
| 📄 **doc-generator** | Writes the docs page | Invent what a component is for — it asks |
| ⚖️ **governance-review** | Proposes which agents have earned more autonomy | Change anyone's level, including its own |

The limits are the point. QA can't quietly fix what it finds, so every problem goes back through the
Engineer and is on the record. The Engineer can't mark its own work done.

---

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

### Make the sweep run itself

`/productive-crew:sweep` is what notices work nobody was told about — a component that failed
testing with no ticket, one sitting ready to ship. It's worth having run on its own.

Ask Claude: *"run the productive-crew sweep for ~/my-design-system every weekday at 8:55am."*

It becomes a scheduled task that survives restarts, and runs on next launch if the app was closed
when it was due. **Name the project folder in the request** — a scheduled run starts fresh with no
memory of the conversation that set it up, so it needs to be told where to look.

Do this once the crew is actually working. A daily job firing into a half-configured project just
produces a daily failure you learn to ignore.

---

## When something stops

The crew stops rather than guessing. Most stops are one of these:

| It says | What to do |
|---|---|
| *not set up* | Run `/productive-crew:setup` |
| *tokens not built* | Export from Figma to `tokens/tokens.json`, then `/productive-crew:tokens` |
| *no ticket* | Start with `/productive-crew:build`, not by calling an agent directly |
| *no preview link* | The component hasn't been published yet — build it first |
| *Storybook won't start* | Usually a missing dependency. Try `npm install` |
| *deploy command failed* | Run your deploy command by hand and see what it says |
| *no browser connected* | Install the Claude in Chrome extension and sign in |
| *Asana / Airtable won't connect* | The token wasn't captured at install. Reinstall the plugin and paste it at the prompt — setup can't set it |
| *Figma reads fail* | Run `/mcp` and authorize Figma. It needs a login, not a token |
| *unbound in Figma* | A colour or spacing isn't attached to a variable. Fix it in Figma, re-export |

### Keeping your tokens out of the repo

Two guards, because there are two ways a token gets in.

- **An agent writing one** — a hook blocks any write carrying a credential, before it happens.
- **You pasting one** — run `git config core.hooksPath .githooks` once per clone, and a commit
  containing a credential is refused.

The rule underneath both: a file in your repo **references** a token, it never contains one.
Put the value in your shell and write `"${AIRTABLE_API_KEY}"` in the config.

> **If a token has already been committed, rotate it.** Deleting the file doesn't remove it from
> git history, and a token pushed to a public repo should be treated as compromised.

### Stop everything

Create a file called `AGENTS_PAUSED` in your project folder. Every agent halts before its next
change. Delete the file to resume.

---

## What lands in your project

Only `productive.config.json` (names and ids — never a password or token), `AGENTS.md` and
`CLAUDE.md` so other AI tools read the same rules, a `governance/` folder, and any scaffolding you
didn't already have.

The crew itself — the agents, the rules, the scripts — stays in the plugin. Update the plugin and
every project gets the improvement.

---

## For developers

<details>
<summary>Repo layout and local development</summary>

```
.claude-plugin/marketplace.json    the catalog
plugins/productive-crew/
├── .claude-plugin/plugin.json     manifest — incl. the token prompts
├── agents/                        the six crew members
├── skills/                        the slash commands
├── rules/                         git tiers, status ladder, the law, the QA plan
├── scripts/                       preflight · verify · record · token-check
├── hooks/hooks.json               kill switch + session-start law injection
├── .mcp.json                      figma · airtable · asana
├── settings.json                  default permissions
└── templates/                     what /setup scaffolds into a project
```

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
