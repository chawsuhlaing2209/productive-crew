# Design tokens — the contract

> Generated and kept current by 🎨 token-audit. The handoff is this contract, not just the file.
> Version: `0.0.0` · Last built: `—`

## Files
- `tokens/tokens.json` — the source (Figma variables, tiered Base + Semantic).
- `build/tokens/<platform>/…` — the built output (e.g. `tokens.css`). **Components use these.**

## Usage
```css
@import './productive-crew:build/tokens/css/tokens.css';

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
Designer changes Figma → 🎨 token-audit re-runs the pipeline (audit → export → build → deliver) →
the version bumps and this contract updates. Never hand-edit the built output.

## Changelog
- `0.0.0` — scaffold. token-audit populates this on first real run.
