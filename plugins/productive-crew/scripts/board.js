#!/usr/bin/env node
// board.js — the only door to the board.
//
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" get <Component>
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" list [--status "<status>"]
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" set <Component> <field> <value>
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" tests add <Component> '<json>'
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" tests list <Component>
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/board.js" schema check
//
// JSON on stdout. Exit 0 = did it. Exit 1 = refused or failed, with a reason.
//
// Agents call this instead of reaching the board directly, which is what makes "the only door
// evidence goes through" true rather than merely asked for: they have Bash and this script, and
// no board access of their own. The write gate below is therefore not advisory.
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
      if (sub === 'add') {
        if (!name || !json) fail(`usage: board.js tests add <Component> '<json>'`);
        let row;
        try { row = JSON.parse(json); } catch { fail('the test row must be valid JSON'); }
        if (!row.result) fail('a test row needs a "result" — Passed, Failed, or Fixed (To re-test)');
        return out(await b.testsAdd(name, row));
      }
      return fail('usage: board.js tests <add|list> …');
    }

    case 'schema':
      if (rest[0] !== 'check') fail('usage: board.js schema check');
      return out(await b.schemaCheck());

    default:
      return fail(`unknown operation "${op ?? ''}" — get · list · set · tests · schema`);
  }
}

main().catch((e) => fail(String(e.message || e)));
