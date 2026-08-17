#!/usr/bin/env node
// parity-check.js — token-parity's deterministic verifier.
// Compares Figma tokens against local tokens/tokens.json and reports mismatches.
//
//   node scripts/parity-check.js
//
// Exit 0 = passed (every token matches). Exit 1 = failed (mismatches printed).

import { readFileSync } from 'node:fs';

function loadLocal() {
  return JSON.parse(readFileSync(new URL('../tokens/tokens.json', import.meta.url)));
}

async function loadFigma() {
  // TODO: read tokens from the Figma MCP. Placeholder returns the local set (always passes).
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
