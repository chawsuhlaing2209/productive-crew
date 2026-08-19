# The board — what Airtable must contain

The crew reads and writes this base by **name**, using `airtable.tables` and `airtable.fields` in
`productive.config.json`. Airtable matches names case-sensitively, so a field called `Staging
storybook` is a different field from `Staging Storybook` and the crew will simply not find it —
silently, because a missing field reads as empty rather than as an error.

That is the failure this file exists to prevent. Set the base up to match, or change the config to
match the base. Either is fine; a mismatch is not.

## Tables and fields

Every table and column name is **Title Case**.

**Components** — the registry
| Field | Type | Who writes it |
|---|---|---|
| Components | single line (primary) | you, when registering |
| Category | single select | you |
| Figma | URL | you — the node the Engineer builds from |
| Commit | URL | 🧭 PM, after verifying |
| Staging Storybook | URL | 🧭 PM, after verifying |
| Production Storybook | URL | 🧭 PM, after verifying |
| Astro Link | URL | 🧭 PM |
| [Staging] Test Records | link → Staging Testing | Airtable, via the link |
| Total Staging Tests | rollup — count of linked rows | Airtable |
| Staging Passed Count | rollup — linked rows where result is Passed | Airtable |
| **Development** | **formula** — see below | **nobody. Ever.** |

**Staging Testing** — one row per variant × state × size
| Field | Type |
|---|---|
| Component/Sub Component | single line |
| Testing Results | single select: Passed · Failed · Fixed (To re-test) |
| Expected Results | long text — the finding, in the finding format |
| Attachment | attachment |
| Suggestion for Improvement | long text |
| Composed In | link → Components |

**Base Tokens** and **Semantic Tokens** are optional and hand-maintained. No agent reads or writes
them — tokens live in code.

## The Development formula

Paste this into the `Development` field. It uses field names, so it is editable — swap a name if
yours differs. It matches `scripts/status.js` exactly; if you change one, change the other, or
`board.js` will report the disagreement (which is the point).

```
IF(
  AND(FIND("Failed", {Staging Testing Results Summary} & "") > 0,
      FIND("Fixed (To re-test)", {Staging Testing Results Summary} & "") > 0),
  "Fixing",
IF(
  FIND("Failed", {Staging Testing Results Summary} & "") > 0,
  "To be fixed",
IF(
  FIND("Fixed (To re-test)", {Staging Testing Results Summary} & "") > 0,
  "Fixed",
IF({Production Storybook}, "Completed",
IF({Total Staging Tests} > 0, "To be deployed",
IF({Staging Storybook}, "Ready for Testing",
IF(AND({Figma}, {Design} = "Done"), "To-do",
"")))))))
```

**Order is the design, not style.** The three repair branches come first so a `Failed` row outranks
everything — including `Completed`. A regression logged after release has to be able to pull a
shipped component back, and the moment `Completed` is checked earlier, it cannot.

**`Development` must never be writable.** If an agent can set it, "evidence in, status out" is
decoration.

### One hole worth knowing about

`To be deployed` fires when rows exist and none are `Failed` or `Fixed (To re-test)`. A row created
**before its result is filled in** satisfies that — so a half-recorded component can read ready to
ship.

Close it by adding a rollup that counts only `Passed` rows and requiring every row to have passed:

```
IF({Staging Passed Rollup} = {Total Staging Tests}, "To be deployed", "Ready for Testing")
```

> **Don't build that with a `count` field.** Airtable's `count` counts *linked records* and cannot
> filter by result, so a `count` named "Staging Passed Count" returns the same number as
> `Total Staging Tests` and any comparison between them is permanently true. It has to be a
> **rollup** over `Testing Results`.

## Prove the formula before you trust it

Sixty seconds, and it catches the error that matters:

1. Take a component sitting at **Completed**.
2. Add one row to Staging Testing linked to it, with `Testing Results` = **Failed**.
3. Its Development should immediately read **To be fixed**.

If it still says Completed, your precedence is wrong and a regression on a shipped component will
never surface. Fix the formula before building anything else on this base.
