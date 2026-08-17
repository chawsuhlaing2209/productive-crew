---
paths:
  - "scripts/**"
---

# Trust — `scripts/`   (read-only, always)

These are the deterministic verifiers — `verify`, `record`, `parity-check`, `preflight`. An agent
must never edit the checks it is judged by. Read-only for every agent, like `governance/`.

**Allowed**
- Read and run.

**Not allowed**
- Edit any script. A verifier change is a human PR, reviewed like governance.

**Escalation**
- A verifier is wrong or too noisy → flag the orchestrator. Never patch it yourself.

**Kill switch:** `AGENTS_PAUSED`.
