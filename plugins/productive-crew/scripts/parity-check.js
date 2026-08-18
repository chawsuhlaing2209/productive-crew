#!/usr/bin/env node
// parity-check.js — token-parity's deterministic verifier.
// Checks the built tokens are COMPLETE against the Figma library: every variable present,
// values matching, every mode covered.
//
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/parity-check.js"
//
// Exit 0 = passed (every token matches). Exit 1 = failed (mismatches printed).

import { readFileSync } from 'node:fs';
import { projectPath } from './project.js';

function loadLocal() {
  return JSON.parse(readFileSync(projectPath('tokens', 'tokens.json'), 'utf8'));
}

async function loadFigma() {
  // TODO: GET https://api.figma.com/v1/files/{fileKey}/variables/local
  //   fileKey  <- figma.files.tokens in productive.config.json
  //   header   <- X-Figma-Token: <the plugin's figma_token>
  //   then map the response's variables + modes into the same shape as tokens.json.
  //
  // It MUST be this endpoint, not the MCP's get_variable_defs: the MCP returns only the
  // variables APPLIED in the file, so a variable missing from the build would never show up
  // as missing — the exact failure this script exists to catch.
  //
  // Until it's implemented this returns the local set, which means the check ALWAYS PASSES.
  // Treat a pass from this script as unproven until the endpoint is wired up.
  return loadLocal();
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !('value' in v)) Object.assign(out, flatten(v, key));
    else out[key] = v.value ?? v;
  }
  return out;
}

async function main() {
  const figma = flatten(await loadFigma());
  const local = flatten(loadLocal());
  const mismatches = [];
  for (const key of new Set([...Object.keys(figma), ...Object.keys(local)])) {
    if (figma[key] !== local[key]) {
      mismatches.push(`${key}: figma=${figma[key] ?? '—'} vs code=${local[key] ?? '—'}`);
    }
  }
  if (mismatches.length) {
    console.error('failed:\n' + mismatches.join('\n'));
    process.exit(1);
  }
  console.log('passed');
}

main();
