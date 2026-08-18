#!/usr/bin/env node
// token-check.js — token-builder's deterministic verifier.
//
//   node "${CLAUDE_PLUGIN_ROOT}/scripts/token-check.js"
//
// Three questions about the BUILT css, none of which guess at a name:
//
//   1. Theme parity   — every [data-theme] block declares the same set of variables.
//                       That IS the contract: names identical across themes, values differ.
//   2. Default cover  — every themed variable also exists in :root, so removing the
//                       attribute doesn't drop tokens.
//   3. Completeness   — every token Style Dictionary produced made it into the css.
//
// (3) asks the project's own Style Dictionary, loaded with the project's own config, for the
// FINAL transformed names. A custom name transform, a themed format, a prefix — all honoured,
// because we are reading what the build produced rather than predicting it. If SD or its
// config can't be loaded, (3) is reported as NOT CHECKED. It never guesses, and it never
// fails on something it couldn't verify.
//
// Exit 0 = every check that could run, passed. Exit 1 = a real failure.

import { readFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { PROJECT_ROOT, projectPath } from './project.js';

const CONFIG_NAMES = [
  'style-dictionary.config.js', 'style-dictionary.config.mjs', 'style-dictionary.config.cjs',
  'style-dictionary.config.json', 'sd.config.js', 'sd.config.mjs', 'config.js', 'config.json',
];

/** The project's SD config + the platform that emits css, or null if we can't load them. */
async function loadStyleDictionary() {
  const configPath = CONFIG_NAMES.map((n) => projectPath(n)).find(existsSync);
  if (!configPath) return { skip: 'no Style Dictionary config found at the project root' };

  let SD, config;
  try {
    const require = createRequire(join(PROJECT_ROOT, 'package.json'));
    SD = (await import(pathToFileURL(require.resolve('style-dictionary')).href)).default;
  } catch {
    return { skip: 'style-dictionary is not installed in this project' };
  }
  try {
    config = configPath.endsWith('.json')
      ? JSON.parse(readFileSync(configPath, 'utf8'))
      : (await import(pathToFileURL(configPath).href)).default;
  } catch (e) {
    return { skip: `could not load ${configPath}: ${e.message}` };
  }

  const platforms = config.platforms ?? {};
  const name =
    Object.keys(platforms).find((p) =>
      (platforms[p].files ?? []).some((f) => String(f.destination).endsWith('.css'))
    ) ?? (platforms.css ? 'css' : null);
  if (!name) return { skip: 'no platform in the config emits a .css file' };

  const platform = platforms[name];
  const file = (platform.files ?? []).find((f) => String(f.destination).endsWith('.css'));
  const cssPath = join(PROJECT_ROOT, platform.buildPath ?? '', file.destination);

  try {
    // SD resolves `source` globs against the working directory, and this script is invoked
    // from wherever the agent happens to be. Without this, allTokens comes back empty and
    // every built variable reads as "extra".
    const cwd = process.cwd();
    process.chdir(PROJECT_ROOT);
    const tokens = await new SD(config).getPlatformTokens(name).finally(() => process.chdir(cwd));
    return { names: new Set(tokens.allTokens.map((t) => `--${t.name}`)), cssPath, platform: name };
  } catch (e) {
    return { skip: `Style Dictionary could not resolve the "${name}" platform: ${e.message}`, cssPath };
  }
}

/** Every `--name:` per selector block. Comments are stripped first — a leading file header
 *  otherwise gets swallowed into the first selector and no block is keyed ':root'. */
function parseCss(raw) {
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = {};
  for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    const names = [...m[2].matchAll(/(--[\w-]+)\s*:/g)].map((x) => x[1]);
    if (names.length) blocks[selector] = new Set([...(blocks[selector] ?? []), ...names]);
  }
  return blocks;
}

const list = (set, n = 8) => {
  const a = [...set];
  return a.slice(0, n).join(', ') + (a.length > n ? ` … +${a.length - n} more` : '');
};

async function main() {
  const sd = await loadStyleDictionary();
  const cssPath = sd.cssPath ?? projectPath('build', 'tokens', 'css', 'tokens.css');

  if (!existsSync(cssPath)) {
    console.error(`failed: no built output at ${cssPath} — run the build first`);
    process.exit(1);
  }

  const blocks = parseCss(readFileSync(cssPath, 'utf8'));
  const root = blocks[':root'] ?? new Set();
  const themes = Object.entries(blocks).filter(([s]) => s.startsWith('[data-theme'));
  const problems = [];

  if (!root.size) problems.push('no :root block found in the built css');

  // 1 · theme parity — the contract is one name set across every theme
  if (themes.length > 1) {
    const union = new Set(themes.flatMap(([, n]) => [...n]));
    for (const [selector, names] of themes) {
      const missing = [...union].filter((n) => !names.has(n));
      if (missing.length) problems.push(`theme gap: ${selector} is missing ${list(new Set(missing))}`);
    }
  }

  // 2 · every themed name is also in :root, so the default state loses nothing
  for (const [selector, names] of themes) {
    const orphan = [...names].filter((n) => !root.has(n));
    if (orphan.length) problems.push(`not in :root: ${list(new Set(orphan))} (declared in ${selector})`);
  }

  // 3 · completeness against what Style Dictionary actually produced
  let coverage;
  if (sd.names) {
    const emitted = new Set(Object.values(blocks).flatMap((n) => [...n]));
    const missing = [...sd.names].filter((n) => !emitted.has(n));
    const extra = [...emitted].filter((n) => !sd.names.has(n));
    if (missing.length) problems.push(`missing from build (${missing.length}): ${list(new Set(missing))}`);
    if (extra.length) problems.push(`extra in build (${extra.length}): ${list(new Set(extra))}`);
    coverage = `${sd.names.size} tokens from the "${sd.platform}" platform`;
  }

  if (problems.length) {
    console.error(`failed (${problems.length}):\n` + problems.join('\n'));
    process.exit(1);
  }
  const themeNote = themes.length ? `, ${themes.length} theme block(s)` : '';
  console.log(`passed — ${root.size} variables in :root${themeNote}`);
  console.log(coverage ? `  completeness: ✓ ${coverage}` : `  completeness: NOT CHECKED — ${sd.skip}`);
}

main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
