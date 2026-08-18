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
    cfg = JSON.parse(readFileSync(projectPath('sunim.config.json'), 'utf8'));
  } catch {
    problems.push('sunim.config.json is missing or invalid');
    return report(problems);
  }

  if (looksUnset(cfg.airtable?.baseId)) problems.push('airtable.baseId is not set');
  if (looksUnset(cfg.asana?.projectId)) problems.push('asana.projectId is not set');
  // Only the tokens file is required — token-audit reads it. If you have ONE Figma file,
  // put it here. Component nodes are read per-row from Airtable, so figma.files.components
  // is optional (leave it blank for a single-file setup).
  if (looksUnset(cfg.figma?.files?.tokens)) {
    problems.push('figma.files.tokens is not set (the file token-audit reads — for a single-file setup, put that file here)');
  }
  if (looksUnset(cfg.repo?.slug)) problems.push('repo.slug is not set');

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
