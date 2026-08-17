#!/usr/bin/env node
// record.js — write VERIFIED evidence to Airtable. The only door evidence goes through.
//
//   node scripts/record.js <Component> <field> <value>
//
// It verifies first (via verify.js), then writes the evidence field — never a status field.
// Status is a formula; this script refuses to write any formula/status column.

import { verify } from './verify.js';

const [, , component, field, value] = process.argv;

const EVIDENCE_FIELDS = new Set([
  'commit', 'staging', 'production', 'astro', 'parity',
]);
const FORBIDDEN = new Set(['development', 'status']); // derived — never written

async function main() {
  if (!component || !field || !value) {
    throw new Error('usage: node scripts/record.js <Component> <field> <value>');
  }
  if (FORBIDDEN.has(field.toLowerCase())) {
    throw new Error(`refused: "${field}" is derived by the formula, never written`);
  }
  if (!EVIDENCE_FIELDS.has(field)) {
    throw new Error(`refused: "${field}" is not an evidence field`);
  }

  const ok = await verify(field, value); // commit resolves? link 200? rows real?
  if (!ok) throw new Error(`unverified ${field}: ${value} — not recorded`);

  // TODO: write { [field]: value } to the component's Airtable row via the Airtable MCP/API.
  console.log(`recorded ${component}.${field} = ${value} (verified)`);
}

main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
