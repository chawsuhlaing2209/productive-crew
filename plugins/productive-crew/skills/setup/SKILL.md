---
name: setup
description: Onboarding. Detects whether it's a fresh repo or an existing one, then interviews the user — confirming what the repo already answers and asking only the gaps — creates their Airtable base + Asana project, and scaffolds only what the repo is missing. Works for a greenfield scaffold or a crew installed into an existing codebase.
disable-model-invocation: true
---

# /productive-crew:setup — onboard a design system (fresh or existing repo)

User-only. Run once. **Detect the repo first, then ask.** Confirm what's detected in one line;
only ask the greenfield question when the repo has no answer. Ask one thing at a time, confirm each,
show a summary card before writing.

## 0 · Detect first — always

Before any question, read the repo and classify it **fresh** or **existing**. Never ask what the
repo already answers.

| Read | From | Fills / decides |
|---|---|---|
| framework · language · test runner | `package.json` deps + scripts | `stack.framework`, `stack.language` |
| existing token pipeline | `style-dictionary` (or other) in deps · a tokens config · a `tokens/` dir · raw CSS vars | `tokens.platforms`, `tokens.buildTool` — **adopt vs scaffold** |
| component location | scan for a components dir (`src/components`, `lib`, `packages/*`, …) | informational — don't impose a path |
| branch flow · default branch | `git branch -a`, default branch | `repo.mainBranch`, `repo.stagingBranch` |
| existing CI / deploy | `.github/workflows/*` | reuse it — **don't clobber** |
| somewhere to deploy | `git remote -v` · an existing host CLI or config | `deploy.enabled` — a remote means yes |

Show what you found, then run the interview against it:

```
🔎 Detected · existing repo
React + TypeScript · vitest · components in src/ui/ · default branch main · no token pipeline · 1 deploy workflow
→ confirm stack · adopt branch flow · scaffold tokens · keep your workflow
```

**The rule for every question below: detected → confirm in one line. Missing → ask fresh.**

## 0b · Check the crew's own connections — before the interview

The crew talks to Airtable, Asana and Figma through **its own MCP servers**, not through any
connector the main session happens to have. Those are configured **when the plugin is installed**,
not here — setup cannot set them, and it must not pretend otherwise. Check them first, because
every one of them fails later and confusingly if it is wrong now.

| Check | If it fails, say exactly this |
|---|---|
| Airtable — `ping` | The Airtable token wasn't captured at install. It is a **personal access token**, required, from `airtable.com/create/tokens`, with read+write on the base. Reinstall the plugin and paste it at the prompt. |
| Asana — any read call | The Asana token wasn't captured at install. Asana has **no login flow here** — it needs a **personal access token** (see `developers.asana.com/docs/personal-access-token`). Reinstall and paste it, or say you're running without tickets. |
| Figma — `whoami` | The Figma server needs an OAuth authorization, which only an interactive session can do. Send them to `/mcp`. |

**A missing Asana token is a choice, not a blocker** — the crew runs without ticketing. A missing
Airtable token is a blocker: the board is the registry.

**Never work around a missing token** by reaching for a connector the main session can see. The
agents' tool patterns point at the plugin's servers; a connector that works for you does not work
for them, and substituting one produces a run that looks fine and writes nothing.

## 1 · Interview

1. **Design-system name** → `name`. (Default to the repo/package name — confirm.)
1b. **Tech stack.** *Detected* → "React + TypeScript, right?" — one confirm. *Missing* (empty repo) →
    ask framework (react · angular · vue · svelte · web-components · swiftui · compose) + language.
    Never re-ask what `package.json` states.
1c. **Token platforms.** *Pipeline exists* → adopt its outputs, confirm the platform list, go to §1.5-adopt.
    *No pipeline* → ask which outputs Style Dictionary should build (css · scss · js · ts · ios · android).
2. **Figma files.** Ask: *one file, or separate files for tokens and components?*
   - **One file** → set `figma.files.tokens`, leave `components` blank.
   - **Separate** → set both (+ icons/brand if any).
   Only the **tokens** file is required — component nodes are read per-row from Airtable.
3. **GitHub repo** (public) `owner/repo` → `repo.slug` + derive Pages URLs. *Detected from `git remote`* → confirm.
3b. **Branch flow — detect, confirm, never impose.** Inspect `git branch -a` + default branch + existing
    workflows. Map production = default branch, staging = an existing `staging`/`develop`/`preview`
    (or offer to create), component prefix = ask (default `component/`). Write `repo.*`. If names differ
    from the defaults, update the refs in `.github/workflows/pages.yml`. **Existing deploy workflow →
    ask: adapt it or add ours alongside. Never clobber.**
4. **Airtable** — new base? (yes → build it; no → paste an existing `baseId`).
5. **Asana** — new project? (yes → build it; no → paste `projectId`).
6. **token-builder schedule** — daily / weekly / manual → `tokenBuilder.schedule`.
7. **Deployment** — `deploy.enabled` stays **true**. This is a detect-and-confirm, not an open
   question: without a staging build there is no QA stage and no test records, so turning it off
   removes half the crew. Follow §0's rule — confirm what you found in one line, don't ask cold.

   - **A remote exists** (the normal case) → confirm: *"Deploying from `<remote>` — right?"* Done.
   - **An existing deploy workflow was found** → reuse it. Don't add `pages.yml` alongside.
   - **No remote yet** → say so and offer the two ways forward, rather than reaching for `false`:
     add a remote now, or publish with a command (below). `false` is the answer only when the
     project genuinely has nowhere to deploy *and* the user declines both.

   Then settle **who publishes** → `deploy.provider`:

   | provider | when |
   |---|---|
   | `github-pages` | GitHub Actions works for them. The bundled `pages.yml` handles it. |
   | `command` | Actions is unavailable — a locked or restricted account, an org policy — or they already have a host. Write the deploy command into `deploy.stagingCommand`. |

   **Ask by host, not by config value.** "Where do you want the staging Storybook to live?" — then
   translate. `provider` only ever takes `github-pages` or `command`; a host name is never a valid
   value. If they say Vercel, that is `command` plus a Vercel command.

   Starting points, to confirm with them rather than paste blindly — CLIs change, and only they know
   their project/account setup:

   | They say | `provider` | `stagingCommand` (confirm, then write) | First-time auth |
   |---|---|---|---|
   | GitHub Pages | `github-pages` | — the bundled workflow handles it | Settings → Pages → Source = GitHub Actions |
   | Vercel | `command` | `npm run build-storybook && npx vercel deploy storybook-static --yes` | `vercel login` once |
   | Netlify | `command` | `npm run build-storybook && npx netlify deploy --dir storybook-static` | `netlify login` once |
   | Cloudflare Pages | `command` | `npm run build-storybook && npx wrangler pages deploy storybook-static` | `wrangler login` once |
   | Something else | `command` | ask them for it | ask them |

   The production command is the same with that host's promote flag — `--prod` for Vercel and
   Netlify, `--branch main` for Cloudflare.

   Then tell them the one rule that makes any of these work: **the command must print the deployed
   URL as its last line of stdout.** Have them run it once by hand and check that, before it becomes
   load-bearing. If the CLI prints a summary block after the URL, wrap it — `… | tail -1` won't do
   it, they need a command whose final output is the bare URL.

   Only if they insist on **no deployment**: set `deploy.enabled: false` and say plainly what it
   costs — no staging link, no QA stage, no test records, the lifecycle stops after the Engineer's
   own checks. Record it as a starting state to revisit, not a decision.
8. **Astro docs?** — yes / no (enables doc-generator).
9. **Orchestrator name** (you) → `governance/registry.md`.
10. **Offer the scheduled sweep** — *last*, and only if everything above came back green. The sweep
    is what catches untracked work, but the plugin cannot schedule anything itself: hooks fire on
    events, not on the clock. Tell them the one sentence that sets it up — *"run the productive-crew
    sweep for `<this project path>` every weekday morning"* — and that a scheduled run starts with no
    memory, so the path has to be in it. **Don't offer this if any connection check failed:** a daily
    job firing into a broken setup is a daily failure they will learn to ignore.

## 1.5 · tools.md, then tokens — adopt or scaffold

- **Generate `tools.md`** from the stack + platform answers, *before anything builds*.
- **Tokens branch on what §0 detected:**

| Repo state | 🎨 token-builder does |
|---|---|
| **No pipeline** (fresh) | scaffold Style Dictionary + a config for `tokens.platforms` + `npm run tokens:build`; build once `tokens/tokens.json` has been exported into the repo |
| **Style Dictionary already present** | adopt it in place — read the existing config, confirm platforms, run the audit; don't re-scaffold |
| **Tokens exist, other form** (raw CSS vars, a different tool) | audit in place and **report**: keep / migrate to Style Dictionary / leave as-is — migrate only on the user's say-so |

No component is built until tokens are audited, built and delivered — same gate either way.

**The token source is an exported file.** `tokens/tokens.json` comes from Figma by a designer
committing the export or by CI/CD, and always lives at that exact path. Tell the user this during
setup: the crew builds tokens, it does not export them, because a Figma read only returns the
variables that are *applied* and would silently miss the rest.

## 2 · Create Airtable (if yes)

New base named after the design system, tables:

Every table and column name is **Title Case**.

- **Components** — Components (primary) · Category · Figma · Commit · Staging Storybook ·
  Production Storybook · Astro Link · [Staging] Test Records (→ Staging Testing) ·
  Total Staging Tests · Staging Passed Count · Staging Testing Results Summary ·
  **Development** (formula) · Synchronization %
- **Base Tokens** — Primitives · Value · Parity Status
- **Semantic Tokens** — Tokens (formula) · ☀️ Value (→ Base Tokens) · Parity Status
- **Staging Testing** — one row per variant/state/prop · Testing Results · Expected Results ·
  Attachment · Suggestion for Improvement · Composed In (→ Components)

There is **no Production Testing table** — testing is staging-only.

Wire **Development** as a *derived* formula (Figma → To-do; commit → To be staged; staging link →
Ready for Testing; a Failed case → To be fixed; all Passed → To be deployed; production Storybook →
Completed). Never make Development writable. Write the ids into `productive.config.json`.

> On an **existing repo**, leave the Components table empty — the crew registers a component the
> first time it works on it. Setup creates the structure, not a census of what's already there.

> TODO: implement via the Airtable MCP (`create_base`, `create_table`, `create_field`).

## 3 · Create Asana (if yes)

New project + a task template: one task per component with subtasks Implementation · Test · Fix · Deploy.
Write `workspaceId` + `projectId` into `productive.config.json`.

> TODO: implement via the Asana MCP.

## 4 · Scaffold what's missing — never what's there

The crew ships its starter files in `${CLAUDE_PLUGIN_ROOT}/templates/`. Copy in **only** the ones the
repo doesn't already have, one at a time, saying what you're adding:

| Template | Copy to | Skip when |
|---|---|---|
| `templates/productive.config.json` | repo root | it already exists — edit it instead |
| `templates/AGENTS.md` | repo root | an `AGENTS.md` exists — append the crew section, never replace |
| `templates/CLAUDE.md` | repo root | a `CLAUDE.md` exists — add the `@AGENTS.md` import if absent |
| `templates/governance/` | repo root | a `governance/` exists |
| `templates/tokens/` | repo root | any token pipeline was detected in §0 |
| `templates/style-dictionary.config.js` | repo root | a Style Dictionary config already exists |
| `templates/.storybook/`, `templates/vitest.config.ts` | repo root | Storybook / vitest already configured |
| `templates/.github/workflows/pages.yml` | repo root | `deploy.enabled` is false, or a deploy workflow exists |
| `templates/examples/Button/` | wherever components live | always optional — offer, don't impose |
| `templates/docs/` | repo root | docs were declined in §1 |

**`AGENTS.md` is not optional.** It is how the law reaches Cursor and Codex, which don't read the
plugin. Claude Code also gets it injected at session start, but the file is the portable copy.

## 4b · Write config

- `productive.config.json` — names + the new ids. **Never a secret.**
- `governance/registry.md` — the orchestrator's name.
- Secrets are **not** written to this repo. Airtable and Asana tokens come from the plugin's own
  config, set when the plugin was installed. If a token is missing, the MCP server will say so —
  send the user to `/plugin` to fill it in, and never ask them to paste one into a file.

## 5 · Confirm

```
✅ Setup · Pineapple DS · existing repo
stack confirmed (React/TS) ✓  branch flow adopted ✓  token pipeline scaffolded ✓
Airtable base ✓  Asana project ✓  config written ✓  your deploy workflow kept ✓
Next: /productive-crew:tokens → /productive-crew:build <Component>
```

## Never
- **Never overwrite existing files.** Not `package.json`, not a token pipeline, not CI, not the component
  structure. On any collision — ask, adapt, or add alongside.
- **Never re-ask what the repo answers.** Framework, branches, test runner, existing pipeline — detect, then confirm.
- Never scaffold Style Dictionary over an existing token pipeline — adopt it.
- Never write a secret anywhere in the repo. Tokens live in the plugin config, set at install time.
- Never copy a template over a file that already exists. Detect, ask, adapt, or add alongside.
