#!/usr/bin/env node
// token-check.js — token-builder's deterministic verifier.
//
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/token-check.js"
//
// Checks the BUILT output against tokens/tokens.json: every token in the source made it
// through the build, nothing extra appeared, and every theme block covers the same names.
//
// It deliberately does not read Figma. The MCP returns only the variables applied in a file,
// and the REST variables endpoint is Enterprise-only — so the source of truth is the export
// sitting in the repo, and this checks the build against it.
//
// Exit 0 = complete. Exit 1 = something is missing, extra, or short a mode.

import { readFileSync, existsSync } from 'node:fs';
import { projectPath } from './project.js';

const CSS = projectPath('build', 'tokens', 'css', 'tokens.css');

function flatten(obj, prefix = []) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const path = [...prefix, k];
    if (v && typeof v === 'object' && !('value' in v) && !('$value' in v)) {
      Object.assign(out, flatten(v, path));
    } else {
      out[path.join('.')] = v.$value ?? v.value ?? v;
    }
  }
  return out;
}

// Style Dictionary's default CSS name transform: the token path, kebab-cased.
const toCssVar = (dotPath) =>
  '--' + dotPath.split('.').join('-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Every `--name:` per selector block, so theme blocks can be compared to :root.
function parseCss(rawCss) {
  // Style Dictionary emits a "do not edit" comment above :root; without stripping comments
  // first they get swallowed into the selector and no block matches.
  const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = {};
  const re = /([^{}]+)\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    const names = [...m[2].matchAll(/(--[\w-]+)\s*:/g)].map((x) => x[1]);
    if (!names.length) continue;
    blocks[selector] = new Set([...(blocks[selector] ?? []), ...names]);
  }
  return blocks;
}

function main() {
  const source = flatten(JSON.parse(readFileSync(projectPath('tokens', 'tokens.json'), 'utf8')));
  const expected = new Set(Object.keys(source).map(toCssVar));

  if (!existsSync(CSS)) {
    console.error(`failed: no built output at ${CSS} — run the build first`);
    process.exit(1);
  }

  const blocks = parseCss(readFileSync(CSS, 'utf8'));
  const root = blocks[':root'] ?? new Set();
  const problems = [];

  for (const name of expected) if (!root.has(name)) problems.push(`missing from build: ${name}`);
  for (const name of root) if (!expected.has(name)) problems.push(`extra in build: ${name}`);

  // Mode coverage — a theme that omits a token falls back silently at runtime.
  for (const [selector, names] of Object.entries(blocks)) {
    if (selector === ':root') continue;
    for (const name of root) {
      if (!names.has(name)) problems.push(`mode gap: ${name} has no value in ${selector}`);
    }
  }

  if (problems.length) {
    console.error(`failed (${problems.length}):\n` + problems.join('\n'));
    process.exit(1);
  }
  console.log(`passed — ${expected.size} tokens, ${Object.keys(blocks).length} theme block(s)`);
}

main();
