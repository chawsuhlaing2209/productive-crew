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
