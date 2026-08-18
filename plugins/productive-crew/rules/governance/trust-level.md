---
paths:
  - "governance/**"
---

# Trust — `governance/`   (read-only, always)

The registry, ADRs, trust levels, and cadence belong to the **human orchestrator**. This is the
"billing" of this repo: no agent writes here, at any level, ever.

**Allowed**
- Read only.

**Not allowed**
- Any write. An agent that thinks it has earned a promotion writes a *suggestion in chat*; the
  human edits `governance/`. An agent never changes its own level or scope.

**Escalation**
- A needed level/scope change → surface it to the orchestrator. Never self-edit.

**Kill switch:** `AGENTS_PAUSED`.
