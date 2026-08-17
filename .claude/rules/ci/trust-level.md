---
paths:
  - ".github/workflows/**"
---

# Trust — `.github/workflows/`   (deploy)

**Agent here:** 🚀 DevOps (**Junior**). Everyone else: **Observer** (read-only).

**Allowed**
- DevOps may open a `staging → main` PR. The workflows deploy to Pages on merge.

**Not allowed**
- Production deploy without orchestrator approval. Editing a workflow without human review.

**Escalation**
- Any production deploy → the human gate, always. A workflow change → a human PR.

**Kill switch:** `AGENTS_PAUSED` — a failing kill-switch check keeps the deploy workflows from running.
