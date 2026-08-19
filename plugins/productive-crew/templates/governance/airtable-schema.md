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

This is the one rule the whole crew depends on, so it is worth getting exactly right.

**Precedence matters more than the values.** A failing test must outrank *everything*, including a
shipped component — otherwise a regression found after release is invisible.

> **Do not count with a `count` field.** Airtable's `count` counts *linked records* — it cannot
> filter by result. A field called `Staging Passed Count` built as a `count` returns the same
> number as `Total Staging Tests`, always, and a formula comparing the two is permanently true.
> Count passed rows with a **rollup** over `Testing Results`, or read the results summary as below.

```
IF(
  AND({Total Staging Tests} > 0, FIND("Failed", {Staging Testing Results Summary} & "") > 0),
  "To be fixed",
IF(
  AND({Total Staging Tests} > 0, FIND("Fixed (To re-test)", {Staging Testing Results Summary} & "") > 0),
  IF(FIND("Passed", {Staging Testing Results Summary} & "") = 0, "Fixed", "Fixing"),
IF({Production Storybook}, "Completed",
IF({Staging Passed Rollup} = {Total Staging Tests}, "To be deployed",
IF({Staging Storybook}, "Ready for Testing",
IF({Commit}, "To be staged",
IF({Figma}, "To-do", "")))))))
```

`{Staging Passed Rollup}` must be a **rollup** counting only rows whose `Testing Results` is
`Passed` — not a `count`.

**Why `= {Total Staging Tests}` and not `FIND("Passed", …) > 0`:** a test row created without a
result yet is counted in the total, contributes no "Failed", and leaves at least one "Passed" in the
summary. The looser test then reads **To be deployed** for a component whose testing is still
half-recorded. Requiring every row to have passed is the difference between "nothing has failed" and
"everything has passed".

Treat that as a **starting point, not a drop-in** — your rollup fields may be named differently, and
the `Fixing / Fixed` rungs need a rule for `Fixed (To re-test)` rows that depends on how you count
them. Adapt it, then prove it with the test below.

**Never make Development writable.** If an agent can set it, the entire "evidence in, status out"
design is decoration.

## Prove the formula before you trust it

Sixty seconds, and it catches the error that matters:

1. Take a component sitting at **Completed**.
2. Add one row to Staging Testing linked to it, with `Testing Results` = **Failed**.
3. Its Development should immediately read **To be fixed**.

If it still says Completed, your precedence is wrong and a regression on a shipped component will
never surface. Fix the formula before building anything else on this base.
