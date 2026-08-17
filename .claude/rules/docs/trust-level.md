---
paths:
  - "docs/**"
---

# Trust — `docs/`

**Agent here:** 📄 doc-generator (**Senior**)

**Allowed**
- Write and update docs pages. Auto-merge when docs-build CI is green.

**Not allowed**
- Invent props or behaviour (read them from the code). Document a component that isn't `Completed`.

**Escalation**
- docs-build fails, or a component's props changed shape → stop and flag the docs owner.

**Kill switch:** `AGENTS_PAUSED`.
