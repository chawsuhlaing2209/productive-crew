// board/airtable.js — the board in Airtable, over the REST API.
//
// Deliberately NOT via the Airtable MCP. Going direct means one code path, no dependence on which
// MCP server happens to be connected or how its tools are named, and a credential that comes from
// the environment rather than plugin config — the two things that made this unreliable before.
//
//   AIRTABLE_API_KEY   a personal access token with read+write on the base
//
// Field names come from `airtable.fields` in productive.config.json. Airtable matches them
// case-sensitively and a wrong name reads as empty rather than erroring, so schemaCheck() exists
// to catch that before it silently eats your evidence.

import { readFileSync } from 'node:fs';
import { projectPath } from '../project.js';
import { deriveStatus } from '../status.js';

const API = 'https://api.airtable.com/v0';

function cfg() {
  const a = JSON.parse(readFileSync(projectPath('productive.config.json'), 'utf8')).airtable;
  // Fail on the missing piece by name. A config gap should say which key is absent, not surface
  // three frames later as "cannot read properties of undefined".
  for (const [path, v] of [
    ['airtable.baseId', a?.baseId],
    ['airtable.tables.components', a?.tables?.components],
    ['airtable.tables.stagingTesting', a?.tables?.stagingTesting],
    ['airtable.fields.components', a?.fields?.components],
    ['airtable.fields.stagingTesting', a?.fields?.stagingTesting],
  ]) {
    if (!v) throw new Error(`${path} is not set in productive.config.json — run /productive-crew:setup`);
  }
  return a;
}

function token() {
  const t = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_TOKEN;
  if (!t) {
    throw new Error(
      'AIRTABLE_API_KEY is not set. Put your Airtable personal access token in the environment — ' +
      'never in a file in the repo.'
    );
  }
  return t;
}

async function api(path, init = {}) {
  const res = await fetch(`${API}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw new Error(`Airtable ${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

const esc = (s) => String(s).replace(/'/g, "\\'");

/** Airtable record -> the shape every provider returns. */
function toComponent(rec, f) {
  const v = (key) => rec.fields[f[key]] ?? null;
  return {
    id: rec.id,
    name: v('name'),
    figma: v('figma'),
    commit: v('commit'),
    staging: v('staging'),
    production: v('production'),
    astro: v('astro'),
    airtableStatus: rec.fields[f.status] ?? null,   // what the formula says
  };
}

async function testsFor(name) {
  const c = cfg();
  const tf = c.fields.stagingTesting;
  const url =
    `${encodeURIComponent(c.tables.stagingTesting)}` +
    `?filterByFormula=${encodeURIComponent(`{${tf.component}}='${esc(name)}'`)}`;
  const { records } = await api(url);
  return records.map((r) => ({
    case: r.fields[tf.case] ?? null,
    result: r.fields[tf.result] ?? null,
    expected: r.fields[tf.expected] ?? null,
  }));
}

/** Attach both statuses, and say so when they disagree — a wrong formula is a caught error. */
function withStatus(component, tests) {
  const derived = deriveStatus(component, tests);
  const out = { ...component, status: derived };
  if (component.airtableStatus && component.airtableStatus !== derived) {
    out.statusDisagreement = {
      airtable: component.airtableStatus,
      expected: derived,
      note: 'the Development formula disagrees with the ladder — see governance/airtable-schema.md',
    };
  }
  return out;
}

export async function get(name) {
  const c = cfg();
  const f = c.fields.components;
  const url =
    `${encodeURIComponent(c.tables.components)}` +
    `?filterByFormula=${encodeURIComponent(`{${f.name}}='${esc(name)}'`)}&maxRecords=1`;
  const { records } = await api(url);
  if (!records.length) throw new Error(`no component "${name}" in ${c.tables.components}`);
  const comp = toComponent(records[0], f);
  return withStatus(comp, await testsFor(name));
}

export async function list({ status } = {}) {
  const c = cfg();
  const f = c.fields.components;
  const { records } = await api(encodeURIComponent(c.tables.components));
  const out = [];
  for (const rec of records) {
    const comp = toComponent(rec, f);
    out.push(withStatus(comp, await testsFor(comp.name)));
  }
  return status ? out.filter((x) => x.status === status) : out;
}

export async function set(name, field, value) {
  const c = cfg();
  const f = c.fields.components;
  const { id } = await get(name);
  await api(encodeURIComponent(c.tables.components), {
    method: 'PATCH',
    body: JSON.stringify({ records: [{ id, fields: { [f[field]]: value } }] }),
  });
  return { ok: true, field: f[field], value, verified: true };
}

export async function testsAdd(name, row) {
  const c = cfg();
  const tf = c.fields.stagingTesting;
  const fields = { [tf.component]: name };
  if (row.case) fields[tf.case] = row.case;
  if (row.result) fields[tf.result] = row.result;
  if (row.expected) fields[tf.expected] = row.expected;
  if (row.suggestion) fields[tf.suggestion] = row.suggestion;
  await api(encodeURIComponent(c.tables.stagingTesting), {
    method: 'POST',
    body: JSON.stringify({ records: [{ fields }] }),
  });
  return { ok: true, added: 1 };
}

export async function testsList(name) {
  return testsFor(name);
}

/** Diff the live base against the config. The near-miss is the dangerous case, so name it. */
export async function schemaCheck() {
  const c = cfg();
  const res = await fetch(`${API}/meta/bases/${c.baseId}/tables`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) {
    throw new Error(
      `cannot read the base schema (${res.status}). The token needs the schema.bases:read scope.`
    );
  }
  const { tables } = await res.json();
  const problems = [];
  const byName = new Map(tables.map((t) => [t.name, t]));

  for (const [key, tableName] of Object.entries(c.tables)) {
    const t = byName.get(tableName);
    if (!t) {
      const near = tables.find((x) => x.name.toLowerCase() === tableName.toLowerCase());
      problems.push(
        near
          ? `table "${tableName}" not found — the base has "${near.name}" (case differs, and Airtable is case-sensitive)`
          : `table "${tableName}" not found in the base`
      );
      continue;
    }
    const fields = new Set(t.fields.map((x) => x.name));
    for (const wanted of Object.values(c.fields?.[key] ?? {})) {
      if (fields.has(wanted)) continue;
      const near = [...fields].find((x) => x.toLowerCase() === String(wanted).toLowerCase());
      problems.push(
        near
          ? `${tableName}: config expects "${wanted}", base has "${near}" — case differs`
          : `${tableName}: missing field "${wanted}"`
      );
    }
  }
  return { ok: problems.length === 0, provider: 'airtable', baseId: c.baseId, problems };
}
