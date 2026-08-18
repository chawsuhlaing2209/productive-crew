---
name: parity
description: Check the built tokens contain every variable in the Figma library, with matching values. Read-only — writes nothing.
---

# /productive-crew:parity

Delegate to the **token-parity** agent. It pulls the **complete** variable set from the Figma
library, reads `tokens/tokens.json` and the built output, and reports what's missing, extra,
mismatched, or short a mode — naming which link in the chain broke.

**Completeness is the point.** It reads all variables via the Figma REST variables endpoint, not
the MCP's applied-variables read — a variable nobody has used yet doesn't appear in the latter, so
a token missing from your build would come back as a clean pass.

**It writes nothing.** Not the tokens, not a file, not Airtable. A failure is a question for you:
re-export from Figma, rebuild with `/productive-crew:tokens`, or find who hand-edited the output.
