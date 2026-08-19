# Status ladder (derived — nobody types it)

Airtable's `Development` formula computes the stage from evidence. Agents write evidence; the
formula reacts. The definition lives in `${CLAUDE_PLUGIN_ROOT}/scripts/status.js`; the formula is a
copy of it so the column can render, and `board.js` reports a **statusDisagreement** when the two
drift apart.

```
(blank)              nothing recorded yet
To-do                Figma link exists AND the design is marked Done
Ready for Testing    a staging Storybook link exists
To be fixed          at least one staging case Failed
Fixing               some failures marked Fixed (To re-test), some still Failed
Fixed                every failure now Fixed (To re-test) — waiting on QA to re-test
To be deployed       test rows exist and none failed
Completed            a verified production Storybook link exists
```

**Seven states, and the ones that aren't here were removed on purpose.** There is no `To be staged`
— a commit on its own changes nothing anyone can open, and the staging link is the first thing that
does. There is no production-testing (TIP) loop.

## The repair loop

`To be fixed` → the Engineer fixes → each repaired row is marked **`Fixed (To re-test)`** →
`Fixing` while any `Failed` remains, `Fixed` once none do → QA re-tests, setting each row back to
`Passed` or `Failed` → round again until every row is `Passed`, then `To be deployed`.

## Why a failure outranks everything

The repair states are checked **before** `Completed`, so a `Failed` row on a shipped component pulls
it back to `To be fixed`. Without that ordering a regression found after release would be invisible
— the board would keep saying Completed while the component was broken.

If a status you don't recognise appears, report it and touch nothing.
