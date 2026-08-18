import type { Preview } from '@storybook/react';

// Tokens are exposed to stories as CSS variables. In a real setup, generate this
// stylesheet from tokens/tokens.json so Storybook renders with the same tokens as prod.
const preview: Preview = {
  parameters: { controls: { matchers: { color: /(background|color)$/i } } },
};
export default preview;
