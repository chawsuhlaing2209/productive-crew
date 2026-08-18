---
paths:
  - "tokens/**"
---

# Trust — `tokens/`

**Agents here:** 🎨 token-builder (**Senior**) · 🔁 token-parity (**Autonomous**)

**Allowed**
- token-builder may rewrite the **built output** and the build config — Senior, so merges are
  skimmed, not read line by line. It never writes `tokens.json`: that file is imported, and the
  agent's job starts where the export lands. No Airtable access.
- token-parity writes nothing at all — it reads both sides and reports. Autonomous because a
  read-only check has nothing to get wrong except its own verdict.

**Not allowed**
- Touch component code. Invent a token Figma doesn't have. Hand-edit a value (Figma is the source).

**Escalation**
- A base-token rename, a value that breaks a component build, or parity failing → stop and flag the Tokens reviewer.

**Kill switch:** `AGENTS_PAUSED` at the repo root halts before the next write.
