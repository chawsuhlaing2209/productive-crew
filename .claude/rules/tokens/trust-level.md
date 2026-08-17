---
paths:
  - "tokens/**"
---

# Trust — `tokens/`

**Agents here:** 🎨 token-audit (**Senior**) · 🔁 token-parity (**Autonomous**)

**Allowed**
- token-audit may rewrite `tokens.json` and the Airtable token tables — Senior, so merges are skimmed, not read line by line.
- token-parity may write the Parity Status column and run unattended — Autonomous, audited monthly.

**Not allowed**
- Touch component code. Invent a token Figma doesn't have. Hand-edit a value (Figma is the source).

**Escalation**
- A base-token rename, a value that breaks a component build, or parity failing → stop and flag the Tokens reviewer.

**Kill switch:** `AGENTS_PAUSED` at the repo root halts before the next write.
