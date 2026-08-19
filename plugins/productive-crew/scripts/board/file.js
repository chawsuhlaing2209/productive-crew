// board/file.js — the board as a JSON file at .crew/board.json.
//
// Exists so the crew can run with no Airtable, no credentials and no network: fixtures, tests, CI,
// and a first component before anyone has built a base. It is not a cache of Airtable — it is a
// different board. A cached copy of a live board would go stale and look live, which is the exact
// failure this project keeps hitting.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { projectPath } from '../project.js';
import { deriveStatus } from '../status.js';
import { select, isFailed, isRetest } from './repairable.js';

const FILE = () => projectPath('.crew', 'board.json');

function load() {
  const f = FILE();
  if (!existsSync(f)) return { components: [], tests: [] };
  return JSON.parse(readFileSync(f, 'utf8'));
}

function save(db) {
  const f = FILE();
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify(db, null, 2) + '\n');
}

const withStatus = (db, c) => ({
  ...c,
  status: deriveStatus(c, db.tests.filter((t) => t.component === c.name)),
});

export async function get(name) {
  const db = load();
  const c = db.components.find((x) => x.name === name);
  if (!c) throw new Error(`no component "${name}" on the board`);
  return withStatus(db, c);
}

export async function list({ status } = {}) {
  const db = load();
  const all = db.components.map((c) => withStatus(db, c));
  return status ? all.filter((c) => c.status === status) : all;
}

export async function set(name, field, value) {
  const db = load();
  const c = db.components.find((x) => x.name === name);
  if (!c) throw new Error(`no component "${name}" on the board`);
  c[field] = value;
  save(db);
  return { ok: true, field, value };
}

export async function testsAdd(name, row) {
  const db = load();
  if (!db.components.some((x) => x.name === name)) {
    throw new Error(`no component "${name}" on the board`);
  }
  db.tests.push({ component: name, ...row });
  save(db);
  return { ok: true, added: 1 };
}

/** Mutating the rows in place is the whole point — see repairable.js. */
function transition(name, caseName, picker, apply) {
  const db = load();
  if (!db.components.some((x) => x.name === name)) {
    throw new Error(`no component "${name}" on the board`);
  }
  const targets = select(db.tests.filter((t) => t.component === name), caseName, name, picker);
  targets.forEach(apply);
  save(db);
  return { ok: true, changed: targets.length, cases: targets.map((t) => t.case ?? null) };
}

export async function testsFix(name, caseName, { commit, label }) {
  const r = transition(name, caseName, { match: isFailed, wanted: 'Failed' }, (t) => {
    t.result = label;
    t.fixedIn = commit;
  });
  return { ...r, result: label, commit };
}

export async function testsRetest(name, caseName, result) {
  const r = transition(name, caseName, { match: isRetest, wanted: 'awaiting re-test' }, (t) => {
    t.result = result;
  });
  return { ...r, result };
}

export async function testsList(name) {
  return load().tests.filter((t) => t.component === name);
}

export async function schemaCheck() {
  // A file board is its own schema — there is nothing to drift from.
  return { ok: true, provider: 'file', note: 'file board has no external schema to verify' };
}
