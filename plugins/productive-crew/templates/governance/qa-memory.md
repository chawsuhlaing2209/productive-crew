# QA memory

What testing this design system has taught the crew. 🔍 QA reads this at Step 0 of every run and
appends to it at Step 7.

This file lives in the **project**, not the plugin — the plugin is replaced on every update, and
these lessons are yours. Nothing here is generic advice; if a lesson turns out to apply to every
design system, propose moving it into the plugin's testing plan instead.

**Never delete a working entry.** Deprecate it with a note and the date.

---

## Component quirks

Behaviour that isn't in the testing plan and would help the next run.

<!-- Format:
### [Component] — [short description] (YYYY-MM-DD)
What was discovered, how to detect it, and what to do about it.
-->

## Recurring failure patterns

A failure type seen in more than one component. These are candidates for becoming standing checks —
once a pattern lands here, look for it everywhere.

<!-- Format:
### [Pattern name] (first seen YYYY-MM-DD · N components)
How it presents, how to detect it, the fix to recommend.
-->

## Tooling workarounds

How the tools behave, as opposed to how the components behave — MCP quirks, Storybook URL and id
resolution, browser automation limits, Airtable field constraints.

<!-- Format:
### [Tool] — [short description] (YYYY-MM-DD)
The behaviour and the workaround.
-->

## Protocol change log

Changes proposed to the plugin's testing plan, and what came of them.

<!-- Format:
### YYYY-MM-DD — [what changed and why]
-->
