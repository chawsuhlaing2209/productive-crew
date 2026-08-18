---
paths:
  - "src/components/**"
---

# Component conventions

> **Trust here:** Engineer is Junior — opens scoped PRs, never merges. See `governance/trust-levels.md`.

Each component is a folder:

```
src/components/<Component>/
  <Component>.tsx          the component — semantic tokens only, no raw values
  <Component>.stories.tsx  one story per state/variant/size
  <Component>.test.tsx     vitest units — the Engineer's local gate
  index.ts                 named export
```

- Props are typed and documented. No `any`.
- Every visual value (colour, space, radius, type) resolves to a semantic token.
- A component is only `To be deployed` when every linked test case is `Passed`.

## Fidelity to Figma

The component is a translation of the design, not an impression of it.

- **Structure** follows the Figma layer tree. Auto-layout becomes flex or grid; its direction,
  alignment, and distribution carry over rather than being re-derived from how it looks.
- **Spacing** — gap, padding, margin — uses the spacing token bound to that property in Figma.
  Never a measured pixel value read off the canvas.
- **Sizing** follows the frame's resizing behaviour: hug → content-sized, fill → stretch to the
  container, fixed → the token or explicit dimension the design specifies.
- **Every variant in the Figma component set exists as a prop value**, and every combination of
  them has a story. The variant matrix is the contract between the Engineer and QA.
- **A property Figma leaves unbound** — a raw hex, a loose px — is a design gap. Raise it on the
  ticket in the finding format. Do not hardcode it, and do not substitute the nearest token.
