#!/usr/bin/env node
// status.js — the status ladder, as a function.
//
// The definition. Airtable's Development formula is a copy of this so the column can render;
// board.js compares the two and reports statusDisagreement when they drift, so a wrong formula
// is a caught error rather than a silent one.
//
// Seven states. There is no "To be staged" — a commit alone changes nothing anyone can look at,
// and a staging link is the first thing that does. There is no production-testing loop.

export const LADDER = [
  '',                   // nothing recorded yet
  'To-do',              // Figma link exists AND the design is marked Done
  'Ready for Testing',  // a staging Storybook link exists
  'To be fixed',        // at least one staging case Failed
  'Fixing',             // some failures fixed, some still failing
  'Fixed',              // every failure now marked Fixed (To re-test), awaiting QA
  'To be deployed',     // every staging case Passed
  'Completed',          // a verified production Storybook link exists
];

/**
 * @param {object} c  evidence: { figma, design, staging, production }
 * @param {Array<{result:string}>} tests  the component's Staging Testing rows
 */
export function deriveStatus(c, tests = []) {
  // Match the re-test marker loosely. The option is spelled "Fixed (To re-test)" in the base
  // today, but the exact label is the kind of thing that gets edited, and an exact-string compare
  // turns a harmless rename into a silent misread of every repair. "re-test" is the part that
  // carries the meaning, and it survives "Fixed(re-test)", "Fixed (To re-test)", and "To Re-test".
  const failed = tests.some((t) => t.result === 'Failed');
  const refix = tests.some((t) => /re-?test/i.test(t.result ?? ''));

  // The repair loop comes first, because a failure has to outrank everything — including a
  // shipped component. A regression logged after release must be able to pull it back, or the
  // board can hide it.
  if (failed && refix) return 'Fixing';   // part-repaired: some fixed, some still failing
  if (failed) return 'To be fixed';       // nothing repaired yet
  if (refix) return 'Fixed';              // all repaired, waiting on QA to re-test

  if (c.production) return 'Completed';   // the link is only written after the PM verifies it
  if (tests.length > 0) return 'To be deployed';  // rows exist, none failing, none awaiting re-test
  if (c.staging) return 'Ready for Testing';
  if (c.figma && c.design === 'Done') return 'To-do';
  return '';
}
