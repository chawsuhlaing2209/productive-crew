# Design tokens — the contract

> Built and kept current by 🎨 token-builder from `tokens/tokens.json`. The handoff is this
> contract, not just the file.
> Version: `0.0.0` · Last built: `—`

## Files
- `tokens/tokens.json` — **the source**, exported from Figma and committed here. Tiered Base +
  Semantic. Always this exact path and name. Hand-edit it and the next export overwrites you.
- `build/tokens/<platform>/…` — the built output (e.g. `tokens.css`). **Components use these.**

## Usage
```css
@import './build/tokens/css/tokens.css';

.button {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
}
```
- Use **semantic** tokens (`--color-primary`), never a base token or a raw value.
- Fallbacks: agree with engineering whether to use `var(--x, <fallback>)`. Default: no fallbacks.

## Theming (Figma modes)
Each Figma mode is a theme. Flip the whole product with one attribute on `<html>`:
```html
<html data-theme="dark">
```
Semantic names are identical across themes; only their values change.

## Updates
Designer changes Figma → **the variables are exported into `tokens/tokens.json`** (committed by
hand, or pushed by CI/CD) → 🎨 token-builder sees the change and re-runs the pipeline
(audit → build → theme → deliver) → the version bumps and this contract updates.

The export is the step a human or CI owns. The crew does not read the token set out of Figma: an
MCP read returns the variables that are *applied* in the file, not every variable that exists, so
building the source that way silently drops whatever isn't in use yet.

Never hand-edit the built output, and never hand-edit `tokens.json`.

## Changelog
- `0.0.0` — scaffold. token-builder populates this on the first build after `tokens.json` lands.
