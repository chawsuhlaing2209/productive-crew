// board/repairable.js — which rows a transition is allowed to touch.
//
// The repair loop is three verbs, and each one may only move a row from one specific result to
// another. Shared by both providers so the refusals are identical whether the board is Airtable
// or a file.
//
//   tests add     QA        → appends a new row          (first pass over the matrix)
//   tests fix     Engineer  Failed → Fixed (To re-test)  (a claim, needs a commit)
//   tests retest  QA        Fixed (To re-test) → Passed | Failed
//
// Every rule below exists because the alternative corrupts the ladder rather than erroring:
//
//   · `fix` and `retest` EDIT the row QA already wrote. Appending instead would leave the old
//     result sitting beside the new one, and since any Failed row outranks everything, the
//     component would stick at "Fixing" forever with no re-test able to clear it.
//   · a transition may only start from the result it's defined for — so a repair can't quietly
//     overwrite a Passed row, and a re-test can't close a case nobody claimed to have fixed.
//   · a named case that doesn't exist is a typo, and a typo matching nothing would otherwise
//     report "0 rows changed" as success.

/** The result QA writes for a failure. */
export const isFailed = (r) => r === 'Failed';

/**
 * The repaired-awaiting-re-test marker. Matched on the substring rather than the whole label for
 * the same reason status.js does: the option gets renamed, and an exact compare would turn a
 * harmless rename into a silent misread of every repair.
 */
export const isRetest = (r) => /re-?test/i.test(r);

export function select(rows, caseName, component, { match, wanted }) {
  const scoped = caseName === null ? rows : rows.filter((t) => t.case === caseName);

  if (caseName !== null && scoped.length === 0) {
    throw new Error(
      `no test case "${caseName}" on ${component} — run \`tests list ${component}\` for the cases QA logged`
    );
  }

  const targets = scoped.filter((t) => match(t.result ?? ''));
  if (targets.length === 0) {
    const seen = [...new Set(scoped.map((t) => t.result || '(blank)'))].join(', ');
    throw new Error(
      caseName === null
        ? `${component} has no case ${wanted} — its results are: ${seen}`
        : `"${caseName}" is not ${wanted} — it is ${seen}`
    );
  }
  return targets;
}
