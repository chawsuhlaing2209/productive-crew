---
paths:
  - "src/components/**"
---

# Trust — `src/components/`

**Agent here:** 🔨 Engineer (**Junior**)

**Allowed**
- Open a scoped PR on a component branch, run vitest/lint in CI, tag the reviewer.

**Not allowed**
- Merge. Push to `main`. Touch another component's files. Hardcode a value (semantic tokens only).

**Escalation**
- A change that spans more than one component, or a failing local gate → stop and flag the Components reviewer.

**Kill switch:** `AGENTS_PAUSED`.
