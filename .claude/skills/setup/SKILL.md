---
name: setup
description: Onboarding. Detects whether it's a fresh repo or an existing one, then interviews the user — confirming what the repo already answers and asking only the gaps — creates their Airtable base + Asana project, and writes .env and sunim.config.json. Works for a greenfield scaffold or a crew installed into an existing codebase.
disable-model-invocation: true
---

# /setup — onboard a design system (fresh or existing repo)

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
| existing CI / deploy | `.github/workflows/*` | `deploy.enabled` hint — **don't clobber** |

Show what you found, then run the interview against it:

```
🔎 Detected · existing repo
React + TypeScript · vitest · components in src/ui/ · default branch main · no token pipeline · 1 deploy workflow
→ confirm stack · adopt branch flow · scaffold tokens · keep your workflow
```

**The rule for every question below: detected → confirm in one line. Missing → ask fresh.**

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
6. **token-audit schedule** — daily / weekly / manual → `tokenAudit.schedule`.
7. **Deployment?** — DevOps agent + Pages CI?
   - *Existing deploy found* → default to reusing it; confirm before adding ours.
   - **No** → `deploy.enabled: false`; skip DevOps, `pages.yml`, `/deploy`. QA tests local Storybook; lifecycle ends at Passed.
   - **Yes** → keep the full pipeline.
8. **Astro docs?** — yes / no (enables doc-generator).
9. **Orchestrator name** (you) → `governance/registry.md`.

## 1.5 · tools.md, then tokens — adopt or scaffold

- **Generate `tools.md`** from the stack + platform answers, *before anything builds*.
- **Tokens branch on what §0 detected:**

| Repo state | 🎨 token-audit does |
|---|---|
| **No pipeline** (fresh) | scaffold Style Dictionary + a config for `tokens.platforms` + `npm run tokens:build`; build the first tokens from the Figma tokens file |
| **Style Dictionary already present** | adopt it in place — read the existing config, confirm platforms, run the audit; don't re-scaffold |
| **Tokens exist, other form** (raw CSS vars, a different tool) | audit in place and **report**: keep / migrate to Style Dictionary / leave as-is — migrate only on the user's say-so |

No component is built until tokens are audited and delivered — same gate either way.

## 2 · Create Airtable (if yes)

New base named after the design system, tables:

- **Components** — Name · Figma · Staging Storybook · Production Storybook · Staging URL ·
  Production URL · Total Tests · Passed Tests · Testing Results · **Development** (formula) · Synchronization %
- **Base Tokens** — Name · Value · Parity Status
- **Semantic Tokens** — Name · References · Value · Parity Status
- **Staging Testing** — one row per variant/state/prop · Result · Expected Result · Screenshot · Composed in (→ Components)
- **Production Testing** — same shape.

Wire **Development** as a *derived* formula (Figma link → To-do; staging link → Ready for testing;
all Passed → To be deployed; … → Completed). Never make Development writable. Write the ids into `sunim.config.json`.

> On an **existing repo**, leave the Components table empty — the crew registers a component the
> first time it works on it. Setup creates the structure, not a census of what's already there.

> TODO: implement via the Airtable MCP (`create_base`, `create_table`, `create_field`).

## 3 · Create Asana (if yes)

New project + a task template: one task per component with subtasks Implementation · Test · Fix · Deploy.
Write `workspaceId` + `projectId` into `sunim.config.json`.

> TODO: implement via the Asana MCP.

## 4 · Write config

- `.env` — pasted tokens (gitignored).
- `sunim.config.json` — names + new ids.
- `governance/registry.md` — orchestrator's name.

## 5 · Confirm

```
✅ Setup · Pineapple DS · existing repo
stack confirmed (React/TS) ✓  branch flow adopted ✓  token pipeline scaffolded ✓
Airtable base ✓  Asana project ✓  config written ✓  your deploy workflow kept ✓
Next: /tokens → /build <Component>
```

## Never
- **Never overwrite existing files.** Not `package.json`, not a token pipeline, not CI, not the component
  structure. On any collision — ask, adapt, or add alongside.
- **Never re-ask what the repo answers.** Framework, branches, test runner, existing pipeline — detect, then confirm.
- Never scaffold Style Dictionary over an existing token pipeline — adopt it.
- Never write secrets into `sunim.config.json` — only into `.env`. Never overwrite an existing `.env` without asking.
