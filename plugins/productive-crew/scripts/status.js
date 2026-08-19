#!/usr/bin/env node
// status.js — the status ladder, as a function.
//
// This is the crew's central invariant and until now it existed only as an Airtable formula the
// user wrote by hand, which nothing could read or test. Here it is code: evidence in, status out.
//
// The Airtable formula stays — Airtable needs its own copy to show the column — but it becomes a
// CACHE of this, not the definition. board.js compares the two and reports disagreement, so a
// wrong formula is a caught error instead of a silent one.
//
// Precedence is the whole design. A failing test outranks EVERYTHING, including a shipped
// component: a regression found after release has to be able to pull it back, or the board can
// hide it.

export const LADDER = [
  '',                   // nothing recorded
  'To-do',              // a Figma link exists
  'To be staged',       // a verified commit exists
  'Ready for Testing',  // a staging Storybook link exists
  'To be fixed',        // a staging test case Failed
  'Fixing',             // a re-test is under way — some cases still awaiting a re-run
  'Fixed',              // every re-tested case is done, none left awaiting
  'To be deployed',     // every staging case Passed
  'Completed',          // a production Storybook link exists
];

/**
 * @param {object} c            the component's evidence
 * @param {Array<{result:string}>} tests  its staging test rows
 */
export function deriveStatus(c, tests = []) {
  const total = tests.length;
  const passed = tests.filter((t) => t.result === 'Passed').length;
  const failed = tests.filter((t) => t.result === 'Failed').length;
  const refix = tests.filter((t) => t.result === 'Fixed (To re-test)').length;

  // A failure outranks everything, Completed included. This ordering is the rule.
  if (failed > 0) return 'To be fixed';

  // Mid-repair: something has been fixed and is waiting to be proven again.
  // 'Fixed' once nothing else is still unrecorded; 'Fixing' while cases remain.
  if (refix > 0) return passed + refix === total ? 'Fixed' : 'Fixing';

  // Every case Passed — note this requires ALL of them, not merely one. A row created
  // without a result is why: `some passed and none failed` is not the same as `all passed`.
  if (c.production) return 'Completed';
  if (total > 0 && passed === total) return 'To be deployed';
  if (c.staging) return 'Ready for Testing';
  if (c.commit) return 'To be staged';
  if (c.figma) return 'To-do';
  return '';
}
