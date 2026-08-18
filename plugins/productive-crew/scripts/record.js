#!/usr/bin/env node
// record.js — the gate every piece of evidence passes before it reaches the board.
//
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/record.js" <Component> <field> <value>
//
// Exit 0 = this is real evidence, in a writable column: the caller may now write it.
// Exit 1 = it is not, for one of three reasons, all of which are refusals:
//   - the field is derived (Development, status) — the formula owns it, nobody writes it
//   - the field is not an evidence field at all
//   - the value did not verify (a link that doesn't answer, a commit that doesn't resolve)
//
// It does NOT write. It cannot: the Airtable token is passed to the MCP servers, not to a
// script run through Bash, so this has no way to authenticate. The PM holds mcp__airtable__*
// and writes after this clears — which also means the agent that produced the evidence is
// never the one that records it. Only the PM should call this.

import { verify } from './verify.js';

const [, , component, field, value] = process.argv;

const EVIDENCE_FIELDS = new Set([
  'commit', 'staging', 'production', 'astro',
]);
const FORBIDDEN = new Set(['development', 'status']); // derived — never written

async function main() {
  if (!component || !field || !value) {
    throw new Error('usage: node ${CLAUDE_PLUGIN_ROOT}/scripts/record.js <Component> <field> <value>');
  }
  if (FORBIDDEN.has(field.toLowerCase())) {
    throw new Error(`refused: "${field}" is derived by the formula, never written`);
  }
  if (!EVIDENCE_FIELDS.has(field)) {
    throw new Error(`refused: "${field}" is not an evidence field`);
  }

  const ok = await verify(field, value); // commit resolves? link 200? rows real?
  if (!ok) throw new Error(`unverified ${field}: ${value} — not recorded`);

  // Cleared. The caller writes it — see the header for why this script doesn't.
  console.log(`cleared to write: ${component}.${field} = ${value} (verified)`);
}

main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
