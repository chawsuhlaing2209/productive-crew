import type { TestRunnerConfig } from '@storybook/test-runner';

// One screenshot per story, so the Engineer's self-check and QA's visual track
// compare the same artefacts. Story id = file path + story name, so the output
// maps 1:1 onto the variant matrix.
const config: TestRunnerConfig = {
  async postVisit(page, context) {
    await page.screenshot({
      path: `.screenshots/${context.id}.png`,
      animations: 'disabled',
    });
  },
};

export default config;
