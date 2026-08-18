# QA testing plan — Step 0 to Step 7

The protocol every component runs through. 🔍 QA follows it in order, every time.

Learned, project-specific knowledge does **not** live here — it lives in
`governance/qa-memory.md` in the project, because this file is replaced on every plugin update.
This file holds what generalises; the memory file holds what one design system taught you.

---

## Step 0 · Preflight — the config gate, then your surfaces

**First the shared gate:** `node "${CLAUDE_PLUGIN_ROOT}/scripts/preflight.js"`. Exit 1 means this
project isn't set up — stop and say so. The PM runs this at the front door, but `/productive-crew:test`
can be typed directly, so never assume it already ran.

**Then your own surfaces** — the three QA specifically depends on:

| Check | How |
|---|---|
| Figma reachable | `whoami` |
| Airtable reachable | `ping` |
| Storybook loads | open the preview URL (deployed staging if `deploy.enabled`, else local `npm run dev`) |

Then **read `governance/qa-memory.md`** — every quirk, recurring pattern, and tooling workaround
the crew has already paid for. Testing without reading it means re-discovering known bugs.

Any surface down → stop and report. Do not test half-blind.

## Step 1 · Identify the component

1. Airtable: find the row. **Check for duplicates before you start** — the same component can exist
   twice (an old record and a `[New]` one). Confirm identity on the primary field, pick the
   canonical record, and note the choice on the card. Linking results to the wrong record is
   invisible and poisons the rollups.
2. Read its Figma node from the row. Never ask the user for it.
3. **Resolve story ids from `<storybook-base>/index.json`.** The sidebar display name is not the
   story id — map `entries[].name` → `entries[].id`. A guessed slug returns "Couldn't find story
   matching" and looks like a broken component.

## Step 2 · Build the test matrix

One test case per **variant × state × size** in the Figma component set — the same matrix the
Engineer built to. Every row gets an Airtable record, pass or fail. A row you skip is a rollup that
lies.

## Step 3 · Visual track — read computed values, never the class list

Compare the render against the Figma node property by property.

- **Read the computed style**, not the className. Conditional class helpers (`cn`, `clsx`) without
  tailwind-merge leave *both* competing utilities in the list and the base one wins the cascade, so
  the intent is dead while the class looks right.
- **Typography classes usually carry size and weight only — not colour.** A `body-*` class with no
  accompanying `text-*` falls back to inherited black. Check `color` and `fontSize` separately.
- **Popovers, dialogs, calendars, portals:** these often escape the design system's base styles.
  Always check `color` **and** `fontSize` on their headers and content cells, not just colour.
- **Dimensions:** read the Figma node's height/width via `get_metadata` and diff against the
  computed value. Thin elements — bars, tracks, dividers, rules — look right in isolation while
  being multiples off.
- **Confirm the resolved pixel value before flagging a token.** A typography class does not
  necessarily resolve to the px its name suggests, and it can differ between component families.
  Check what it actually computes to, then compare to the Figma token.

## Step 4 · Interaction track

Disabled · Hover · Focus · Press/Tap · Keyboard navigation.

- **Focus indicators:** a transparent outline is the common failure — `outline: rgba(0,0,0,0)` or a
  transparent ring reads as styled but shows nothing. Focus each interactive element
  programmatically and inspect the computed outline. A className carrying `outline-none` or
  `focus-within:outline-none` with no perceivable `focus:ring-*` / `focus:border-*` is a
  WCAG 2.4.11 failure.
- **Verify focus visually.** Under automation `document.activeElement` is reliable but
  `el.matches(':focus')` is not, and `:focus`-variant CSS may not appear in computed style. Never
  conclude a focus style is broken from computed style alone — screenshot the focused element
  beside its neighbours and judge the image.
- **Double tab stops:** a wrapper carrying `tabindex="0"` around a native button or input creates
  two stops for one control. Check the wrapper, not just the control.
- **Headless UI libraries:** trust the trigger's `aria-expanded` for open/closed state rather than
  the presence of `[role=dialog]` in the DOM — exit animations cause false readings immediately
  after Escape.

## Step 5 · Accessibility track

- **Accessible name.** Two failure shapes, both common:
  `label[for]` pointing at an id that doesn't exist — run `document.getElementById(label.htmlFor)`
  and treat `null` as orphaned; and a `<label>` with no `for` at all beside a control with no
  `aria-label` / `aria-labelledby`. In both cases the visible label is decorative.
- **Role honesty.** An interactive element carrying `role="presentation"` with `tabindex=0` is a
  contradiction — focusable but semantically invisible. Custom trigger divs need a real role and an
  accessible label.
- **Selection state must not be colour-only.** A selected item exposes `aria-selected` or
  `aria-pressed`; the current item exposes `aria-current`. A dark pill alone is not state.
- **Multi-cell inputs** (OTP, PIN, code entry) can never be named by one `label[for]` — they need
  `role="group"` plus a group label on the container, a per-cell `aria-label` ("Digit 1 of 6"),
  `aria-describedby` to the helper or error, and `aria-invalid` on error. Do not recommend a
  for-attribute fix for these.
- Value ARIA on library primitives is usually right; the gap is almost always the accessible name.

## Step 6 · Record the results

One Airtable row per matrix row, in the **Staging Testing** table, using the column names from
`airtable.fields` in `productive.config.json`. Passes are recorded too — `To be deployed` means
*all* cases passed, which is unanswerable if passes were never written.

Failures additionally carry the finding format (see the **finding-format** skill) and paired
evidence: **the Storybook story showing the defect, and the Figma node showing what it should be.**
Never a raw value — name the token or prop.

Mirror each failure as an Asana comment. You write records, never a status.

## Step 7 · Post-session — feed what you learned back

After the run, update `governance/qa-memory.md`:

1. **Component quirks** — behaviour that wasn't in this plan and would help the next run.
2. **Recurring patterns** — a failure type seen here *and* before goes in the recurring section.
   That is how a one-off becomes a standing check.
3. **Tooling workarounds** — anything about how the tools behave, not the component.

If a gap would change the protocol for *every* component, don't quietly edit it — **propose it to
the orchestrator.** This plan ships with the plugin; changing it changes everyone's testing.

Never delete a working step. Deprecate with a note and the date.
