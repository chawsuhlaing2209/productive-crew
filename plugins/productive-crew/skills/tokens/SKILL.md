---
name: tokens
description: Build the code tokens from tokens/tokens.json — audit the imported file, run Style Dictionary, theme per mode, deliver the contract. Tokens live in code, never Airtable.
---

# /productive-crew:tokens

Delegate to the **token-builder** agent. It runs the pipeline against **`tokens/tokens.json`** —
detect the change, audit the file, build with Style Dictionary, write a theme block per mode, and
update the `tokens/README.md` contract — then returns the build card.

**The source is the file, not Figma.** `tokens/tokens.json` is an export that arrives by a designer
committing it or by CI/CD. A Figma read only surfaces the variables that are *applied*, so building
the source that way silently drops everything not yet used. The agent never writes that file.

**Tokens live in code.** Nothing here writes tokens to Airtable. A messy token is flagged to the
designer and the run stops rather than building from it.
