---
name: docs
description: Write or update the documentation page for a finished component. Usage: /productive-crew:docs <Component>.
---

# /productive-crew:docs <Component>

Delegate to the **doc-generator** agent for `$ARGUMENTS`.

It reads the component's code and stories for the props, states and behaviour, and the component's
**description on its Figma node** for what it is and when to use it — because purpose is a design
decision and isn't recoverable from code. Then it writes `docs/components/<Component>.md` and runs
the docs build.

**Only for components at `Completed`.** Documenting something still in the fix loop publishes props
that are about to change.

If Figma has no description and the code doesn't answer "when would I use this?", it asks you rather
than writing something plausible. A guessed purpose outlives the guess.
