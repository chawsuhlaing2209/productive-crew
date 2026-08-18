---
paths:
  - "tokens/**"
---

# Trust — `tokens/`

**Agent here:** 🎨 token-builder (**Senior**)

**Allowed**
- token-builder may rewrite the **built output** and the build config — Senior, so merges are
  skimmed, not read line by line. It never writes `tokens.json`: that file is imported, and the
  agent's job starts where the export lands. No Airtable access.

**Not allowed**
- Touch component code. Invent a token the export doesn't have. Hand-edit `tokens.json` or a
  built value — the export is the source, and the next one overwrites you.

**Escalation**
- A base-token rename, a value that breaks a component build, or `token-check` failing → stop and
  flag the Tokens reviewer.

**Kill switch:** `AGENTS_PAUSED` at the repo root halts before the next write.
