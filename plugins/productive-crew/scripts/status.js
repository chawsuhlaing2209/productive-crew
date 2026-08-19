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

  // A failure outranks everything, Completed included. This ordering is the rule.
  if (total > 0 && passed < total) return 'To be fixed';
  if (c.production) return 'Completed';
  if (total > 0 && passed === total) return 'To be deployed';
  if (c.staging) return 'Ready for Testing';
  if (c.commit) return 'To be staged';
  if (c.figma) return 'To-do';
  return '';
}
