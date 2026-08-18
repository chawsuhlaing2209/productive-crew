---
paths:
  - "tokens/**"
---

# Trust — `tokens/`

**Agents here:** 🎨 token-audit (**Senior**) · 🔁 token-parity (**Autonomous**)

**Allowed**
- token-audit may rewrite `tokens.json` and the built output — Senior, so merges are skimmed, not read line by line. It has no Airtable access and writes no tokens there.
- token-parity writes nothing at all — it reads both sides and reports. Autonomous because a
  read-only check has nothing to get wrong except its own verdict.

**Not allowed**
- Touch component code. Invent a token Figma doesn't have. Hand-edit a value (Figma is the source).

**Escalation**
- A base-token rename, a value that breaks a component build, or parity failing → stop and flag the Tokens reviewer.

**Kill switch:** `AGENTS_PAUSED` at the repo root halts before the next write.
