---
name: parity
description: Check that the Figma tokens and the code's tokens/ agree, and report any drift. Read-only — writes nothing.
---

# /productive-crew:parity

Delegate to the **token-parity** agent. It reads both sides, compares name, value and tier with
`${CLAUDE_PLUGIN_ROOT}/scripts/parity-check.js`, and returns the verdict card naming every
mismatch — token, Figma side, code side.

**It writes nothing.** Not the tokens, not a file, not Airtable. A mismatch is a question for you:
either Figma moved and `/productive-crew:tokens` needs to rebuild, or the built output was
hand-edited away from its source.
