#!/usr/bin/env node
// board.js — the only door to the board.
//
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" get <Component>
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" list [--status "<status>"]
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" set <Component> <field> <value>
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" tests add <Component> '<json|json[]>'
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" tests fix <Component> <case|--all> --commit <sha>
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" tests retest <Component> <case|--all> <Passed|Failed>
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" tests list <Component>
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" schema check
//
// JSON on stdout. Exit 0 = did it. Exit 1 = refused or failed, with a reason.
//
// Agents call this instead of reaching the board directly. No agent carries the Airtable MCP, so
// this is the path they have — and the gate below makes the correct write trivial and an incorrect
// one impossible through it.
//
// It is a gate, not a sandbox. The credential lives in the environment and the agents have Bash,
// so one could in principle bypass this with a raw HTTP call. What the gate buys is that the
// mistakes which actually corrupt the board — appending a repair instead of editing it, logging a
// test against a build nobody deployed, writing a derived column — cannot happen by accident on
// the path everything is told to use.
//
// Provider comes from `board.provider` in productive.config.json — `airtable` (default) or `file`.
// Credentials come from the ENVIRONMENT (AIRTABLE_API_KEY), never from a file in the repo.

import { readFileSync } from 'node:fs';
import { projectPath } from './project.js';
import { verify } from './verify.js';

// Only these may ever be written, and only after verifying. Everything else is refused —
// `Development` above all, which is derived and belongs to the formula.
const EVIDENCE = new Set(['commit', 'staging', 'production', 'astro']);
const DERIVED = new Set(['development', 'status', 'synchronization %']);

function config() {
  try {
    return JSON.parse(readFileSync(projectPath('productive.config.json'), 'utf8'));
  } catch {
    fail('productive.config.json is missing or invalid — run /productive-crew:setup');
  }
}

/**
 * The exact cell value that marks a repaired case. Read from config so a base that spells the
 * option differently still gets a WRITABLE value — status.js can match "re-test" loosely, but a
 * write has to hit a real singleSelect choice or Airtable rejects it.
 */
function refixLabel(cfg) {
  const choices = cfg.airtable?.choices?.result ?? [];
  return choices.find((c) => /re-?test/i.test(c)) ?? 'Fixed (To re-test)';
}

async function provider() {
  const name = config().board?.provider ?? 'airtable';
  if (name === 'file') return import('./board/file.js');
  if (name === 'airtable') return import('./board/airtable.js');
  fail(`unknown board.provider "${name}" — expected "airtable" or "file"`);
}

function out(v) { console.log(JSON.stringify(v, null, 2)); process.exit(0); }
function fail(msg) { console.error(JSON.stringify({ ok: false, error: msg }, null, 2)); process.exit(1); }

async function main() {
  const [op, ...rest] = process.argv.slice(2);
  const b = await provider();

  switch (op) {
    case 'get':
      if (!rest[0]) fail('usage: board.js get <Component>');
      return out(await b.get(rest[0]));

    case 'list': {
      const i = rest.indexOf('--status');
      const status = i !== -1 ? rest[i + 1] : undefined;
      return out(await b.list({ status }));
    }

    case 'set': {
      const [name, field, value] = rest;
      if (!name || !field || !value) fail('usage: board.js set <Component> <field> <value>');
      if (DERIVED.has(field.toLowerCase())) {
        fail(`refused: "${field}" is derived by the formula — nobody writes it`);
      }
      if (!EVIDENCE.has(field)) {
        fail(`refused: "${field}" is not an evidence field (${[...EVIDENCE].join(', ')})`);
      }
      if (!(await verify(field, value))) {
        fail(`refused: ${field} did not verify — ${value}`);
      }
      return out(await b.set(name, field, value));
    }

    case 'tests': {
      const [sub, name, json] = rest;
      if (sub === 'list') {
        if (!name) fail('usage: board.js tests list <Component>');
        return out(await b.testsList(name));
      }
      if (sub === 'fix') {
        // Marks an EXISTING failed row repaired. Never appends: "Fixing" means *some failures
        // remain*, so adding a second row beside the Failed one would pin the component there
        // forever and no re-test could ever clear it.
        const target = rest[2];
        const ci = rest.indexOf('--commit');
        const commit = ci !== -1 ? rest[ci + 1] : undefined;
        if (!name || !target) {
          fail(`usage: board.js tests fix <Component> <case|--all> --commit <sha-or-url>`);
        }
        if (!commit) {
          fail(
            'refused: a repair needs --commit <sha-or-url>. "Fixed" is a claim about a pushed ' +
            'build that QA can re-test, not about your working copy.'
          );
        }
        if (!(await verify('commit', commit, { op: 'tests.fix', component: name, case: target }))) {
          fail(`refused: commit did not verify — ${commit}`);
        }
        return out(
          await b.testsFix(name, target === '--all' ? null : target, {
            commit,
            label: refixLabel(config()),
          })
        );
      }
      if (sub === 'retest') {
        // QA closing a repair. Only a row awaiting re-test can be closed this way — a first pass
        // over the matrix is `tests add`, and conflating the two lets a re-test invent a case
        // nobody ever failed.
        const [target, result] = rest.slice(2);
        if (!name || !target || !result) {
          fail('usage: board.js tests retest <Component> <case|--all> <Passed|Failed>');
        }
        if (result !== 'Passed' && result !== 'Failed') {
          fail(`refused: a re-test closes with Passed or Failed, not "${result}"`);
        }
        return out(await b.testsRetest(name, target === '--all' ? null : target, result));
      }
      if (sub === 'add') {
        if (!name || !json) fail(`usage: board.js tests add <Component> '<json|json[]>'`);
        let rows;
        try { rows = JSON.parse(json); } catch { fail('the test rows must be valid JSON'); }
        rows = Array.isArray(rows) ? rows : [rows];
        if (!rows.length) fail('no rows to add');

        for (const [i, row] of rows.entries()) {
          const at = rows.length > 1 ? ` (row ${i + 1})` : '';
          if (row.result !== 'Passed' && row.result !== 'Failed') {
            fail(
              `refused${at}: a test result is Passed or Failed, not "${row.result ?? ''}". ` +
              'Marking a case repaired is the Engineer\'s `tests fix`, not a new row.'
            );
          }
          if (!row.case) fail(`refused${at}: a test row needs a "case"`);
        }

        // The staging gate. Rows in Staging Testing assert that a DEPLOYED build was verified, so
        // a component with no reachable staging link has nothing that could have been tested. This
        // was prose in the QA agent and got violated on the first real run; it is code now.
        const component = await b.get(name);
        if (!component.staging) {
          fail(
            `refused: ${name} has no Staging Storybook link, so there is no deployed build these ` +
            'rows could describe. If you tested locally, report the findings — do not record them.'
          );
        }
        if (!(await verify('staging', component.staging, { op: 'tests.add', component: name }))) {
          fail(
            `refused: ${name}'s staging link did not answer — ${component.staging}. ` +
            'A build QA cannot reach is not a build QA can have tested.'
          );
        }

        return out(await b.testsAdd(name, rows));
      }
      return fail('usage: board.js tests <add|fix|retest|list> …');
    }

    case 'schema':
      if (rest[0] !== 'check') fail('usage: board.js schema check');
      return out(await b.schemaCheck());

    default:
      return fail(`unknown operation "${op ?? ''}" — get · list · set · tests · schema`);
  }
}

main().catch((e) => fail(String(e.message || e)));
