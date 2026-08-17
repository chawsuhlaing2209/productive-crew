---
paths:
  - "tokens/**"
---

# Token conventions

> **Trust here:** token-parity is Autonomous, token-audit is Senior. See `governance/trust-levels.md`.

Two tiers:

- **Base tokens** — raw values (`color-blue-500`, `space-4`). Mirror of Figma primitives.
- **Semantic tokens** — role-based, reference a base token (`bg-primary` → `color-blue-500`).

Components use **semantic** tokens only. Base tokens are never used directly in a component.

## Themes (Figma modes)

Each Figma **mode** (light/dark, brand A/B, …) becomes a **theme** in the built output. Semantic
tokens keep the **same names** across themes; only their values change per mode. A component
references a semantic token and inherits whatever theme is active — it never branches on a mode or
hardcodes a mode's value. Switching theme (e.g. `data-theme="dark"`) re-points every semantic token
at once.

## Semantic naming hierarchy

⛔ PENDING — drop the formula-generated naming rule here, e.g. the tiers and order
(`category / role / prominence / state` → `bg/primary/hover`). Once it's here,
wire it into `token-audit` step 6.
