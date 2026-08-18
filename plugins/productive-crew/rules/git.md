# Git — three tiers

```
component/<name>  →  staging  →  main
```

**The structure is fixed; the names are yours.** The three tiers below are load-bearing —
work → preview → production, where merging to the preview branch produces the deploy that is the
evidence. But the *names* come from config, so this maps onto any repo:

| Tier | Config key | Default |
|---|---|---|
| component branch | `repo.componentPrefix` | `component/` |
| preview / staging | `repo.stagingBranch` | `staging` |
| production | `repo.mainBranch` | `main` |

If a repo already uses `develop`/`master` or another flow, `/productive-crew:setup` **detects it and maps the tiers
to those branches** — it never imposes `staging`/`main`. (Rename these? Also update the branch refs
in `.github/workflows/pages.yml`.)

## The tiers
- **`<componentPrefix><name>`** — one branch per component. The Engineer works here.
- **the staging branch** — every PR lands here. Never open a PR to the production branch.
- **the production branch** — accepts PRs from the staging branch **only**, opened by 🚀 DevOps
  with explicit human approval.

**Both branches exist from day one.** The production branch is not created later when the first
component is ready — the deploy workflow builds both environments on every run, and a missing
production branch means every deploy publishes a site with nothing at its root. Create it at setup,
then let it advance only through DevOps PRs.

## The rules
- **Every PR targets `staging`.** No exceptions.
- **Merging to `staging` produces the evidence.** The merge runs the tests and deploys the staging
  Storybook; that deploy is the staging link the formula reacts to and QA tests. Nobody hand-writes it.
- **`main` accepts a PR only from `staging`**, opened by DevOps, and only with the human's approval.
- **Merging to `main` deploys production.**

## Branch protection — the rule on the road, not just in a doc
On GitHub, set on **both** `staging` and `main` (Settings → Branches, once the repo exists):
- **PR-only.** No direct pushes.
- **Required status checks** must pass before merge (tests + the kill-switch check).
- On `main`: restrict the PR source branch to `staging`.

## Who moves code
| Step | Who |
|---|---|
| `component/<x>` → PR → `staging` | 🔨 Engineer |
| on `staging` merge: test + deploy staging Storybook (the evidence) | ⚙️ CI |
| `staging` → `main` PR, human-approved → production deploy | 🚀 DevOps |
