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
| Design | single select: `Not started` · `In progress` · `Done` | you — this is the gate that starts the work |
| Commit | URL | 🧭 PM, after verifying |
| Staging Storybook | URL | 🧭 PM, after verifying |
| Production Storybook | URL | 🧭 PM, after verifying |
| Astro Link | URL | 🧭 PM |
| [Staging] Test Records | link → Staging Testing | Airtable, via the link |
| **Staging Testing Results Summary** | **rollup** over `[Staging] Test Records` → `Testing Results`, `ARRAYJOIN(values)` | Airtable |
| Total Staging Tests | rollup — count of linked rows | Airtable |
| Staging Passed Count | rollup over `Testing Results` — linked rows where the result is Passed | Airtable |
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
| Variants | single select — the variant under test, e.g. `Primary` |
| Size | single select — e.g. `sm` · `md` · `lg` |
| State | single select — e.g. `default` · `hover` · `focus` · `disabled` |
| Context | single line text — browser and viewport, e.g. `Chrome 141 · 1440×900` |

**Variants, Size and State are their own columns, not part of the case name.** They are what makes
the board sliceable — "every hover state that failed", "everything at `sm`" — and a row that folds
them into `Button/Primary hover sm` answers none of those questions.

**Two tables, and only two.** Tokens live in code — built from `tokens/tokens.json` by Style
Dictionary and checked by `scripts/token-check.js` — so there are no token tables here. If your base
has some from an earlier setup, leave them: the crew doesn't read them, and `schema check` no longer
asks for them.

## The Development formula

Paste this into the `Development` field. It uses field names, so it is editable — swap a name if
yours differs. It matches `scripts/status.js` exactly; if you change one, change the other, or
`board.js` will report the disagreement (which is the point).

```
IF(
  AND(FIND("Failed", {Staging Testing Results Summary} & "") > 0,
      FIND("re-test", {Staging Testing Results Summary} & "") > 0),
  "Fixing",
IF(
  FIND("Failed", {Staging Testing Results Summary} & "") > 0,
  "To be fixed",
IF(
  FIND("re-test", {Staging Testing Results Summary} & "") > 0,
  "Fixed",
IF({Production Storybook}, "Completed",
IF({Staging Testing Results Summary} != "", "To be deployed",
IF({Staging Storybook}, "Ready for Testing",
IF(AND({Figma}, {Design} = "Done"), "To-do",
"")))))))
```

**Match on `"re-test"`, not on the whole label.** The option is spelled `Fixed (To re-test)` today,
but `FIND("Fixed", …)` would also match it — `Fixed` is a substring — and an exact match breaks the
day someone shortens the label. `re-test` is the part that carries the meaning and survives every
spelling of it. `scripts/status.js` matches the same way.

**Order is the design, not style.** The three repair branches come first so a `Failed` row outranks
everything — including `Completed`. A regression logged after release has to be able to pull a
shipped component back, and the moment `Completed` is checked earlier, it cannot.

**`Development` must never be writable.** If an agent can set it, "evidence in, status out" is
decoration.

### Who writes Testing Results

`Fixing` and `Fixed` only exist because someone can move a row off `Failed`. That someone is the
**Engineer**, and it is the only board write the Engineer makes — a claim about their own repair,
which QA then confirms or rejects. Three verbs, one per role, each refusing outside its lane:

| Verb | Who | Transition |
|---|---|---|
| `board.js tests add` | QA | *(new row)* → `Passed` \| `Failed` |
| `board.js tests fix … --commit <sha>` | Engineer | `Failed` → `Fixed (To re-test)` |
| `board.js tests retest … Passed\|Failed` | QA | `Fixed (To re-test)` → `Passed` \| `Failed` |

**`fix` and `retest` edit the existing row. They never append**, and the gate enforces it. This is
not tidiness: any `Failed` row outranks everything, so a repair reported as a *new* row leaves the
old failure standing beside it and the component reads `Fixing` permanently — no re-test can clear
a failure nobody will ever revisit. Appending is the one mistake that makes the ladder a trap
rather than a loop.

`fix` also demands a commit, and verifies it. `Fixed` claims a build QA can pull and re-test; a
repair that exists only in a working copy is not one.

### One hole worth knowing about

`To be deployed` fires when the summary is non-empty and holds no `Failed` or `re-test`. A row created
**before its result is filled in** satisfies that — so a half-recorded component can read ready to
ship.

Close it by adding a rollup that counts only `Passed` rows and requiring every row to have passed:

```
IF({Staging Passed Count} = {Total Staging Tests}, "To be deployed", "Ready for Testing")
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
