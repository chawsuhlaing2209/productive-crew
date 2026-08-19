#!/usr/bin/env node
// preflight.js — is this repo set up? Run before any component work.
// Exit 0 = ready. Exit 1 = not set up (run /productive-crew:setup).

import { readFileSync } from 'node:fs';
import { projectPath } from './project.js';

const PLACEHOLDERS = ['appXXXXXXXXXXXXXX', '0000000000000000', 'owner/'];

function looksUnset(value) {
  return !value || PLACEHOLDERS.some((p) => String(value).includes(p));
}

function main() {
  const problems = [];

  let cfg;
  try {
    cfg = JSON.parse(readFileSync(projectPath('productive.config.json'), 'utf8'));
  } catch {
    problems.push('productive.config.json is missing or invalid');
    return report(problems);
  }

  if (looksUnset(cfg.airtable?.baseId)) problems.push('airtable.baseId is not set');
  if (looksUnset(cfg.asana?.projectId)) problems.push('asana.projectId is not set');
  // No agent reads this file: token-builder's source is the exported tokens/tokens.json in the
  // repo. It records WHERE to export from, so the designer or CI knows which file to pull.
  // Component nodes are read per-row from Airtable, so figma.files.components is optional
  // (leave it blank for a single-file setup).
  if (looksUnset(cfg.figma?.files?.tokens)) {
    problems.push('figma.files.tokens is not set (the Figma file you export tokens FROM — for a single-file setup, put that file here)');
  }
  if (looksUnset(cfg.repo?.slug)) problems.push('repo.slug is not set');

  // Every agent reaches the board through scripts/board.js, which reads the token from the SHELL
  // environment. Setting the plugin's airtable_token in /plugin config is not the same thing: that
  // value is handed to the Airtable MCP server's own process and never reaches an agent's Bash.
  // Catch it here, at the front door, rather than three steps into a run.
  if ((cfg.board?.provider ?? 'airtable') === 'airtable' && !process.env.AIRTABLE_API_KEY && !process.env.AIRTABLE_TOKEN) {
    problems.push(
      'AIRTABLE_API_KEY is not in the environment — the crew reads and writes the board with it.\n' +
      '  Add `export AIRTABLE_API_KEY="pat…"` to ~/.zshrc and restart Claude Code.\n' +
      '  (Setting the token in the plugin config only reaches the Airtable MCP server, not the scripts.)\n' +
      '  To run with no Airtable at all, set "board": { "provider": "file" } in productive.config.json.'
    );
  }

  report(problems);
}

function report(problems) {
  if (problems.length) {
    console.error('NOT SET UP — run /productive-crew:setup:\n- ' + problems.join('\n- '));
    process.exit(1);
  }
  console.log('ready');
}

main();
