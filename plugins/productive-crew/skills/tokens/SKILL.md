---
name: tokens
description: Run the token audit — audit the Figma variables, rebuild tokens.json, build and theme the output, and deliver the contract. Tokens live in code, never Airtable.
---

# /productive-crew:tokens

Delegate to the **token-audit** agent. It runs the pipeline — audit the Figma variables, export to
`tokens/tokens.json` if they changed, build with Style Dictionary, write a theme block per Figma
mode, and update the `tokens/README.md` contract — then returns the audit card.

**Tokens live in code.** Nothing here writes tokens to Airtable. A messy variable is flagged to the
designer and the run stops rather than building from it.
