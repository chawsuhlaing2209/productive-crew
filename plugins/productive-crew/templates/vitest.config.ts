import { defineConfig } from 'vitest/config';

// Keeps CI green on a fresh starter: no component tests yet is a pass, not a failure.
// The reference example in examples/ is excluded (it's for reading, not running).
// When you add real component tests that render, add `environment: 'jsdom'` here
// and `jsdom` + `@testing-library/jest-dom` to devDependencies.
export default defineConfig({
  test: {
    passWithNoTests: true,
    exclude: ['examples/**', 'node_modules/**', 'dist/**', 'storybook-static/**'],
  },
});
