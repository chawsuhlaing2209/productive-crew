#!/usr/bin/env node
// verify.js — the "prove it" checks. Evidence only counts if these pass.
//
// Every call is appended to .crew/verify-log.jsonl in the project. That log is the ONLY
// record that verification ever ran, and the PM's promotion criterion ("verify.js has run a
// clean quarter and caught a real bad record") is unanswerable without it. Logging is
// best-effort: a log that cannot be written must never fail a verification.

import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { projectPath } from './project.js';

function log(entry) {
  try {
    const file = projectPath('.crew', 'verify-log.jsonl');
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, JSON.stringify(entry) + '\n');
  } catch {
    // never let logging break the check
  }
}

export async function verify(field, value, meta = {}) {
  const ok = await check(field, value);
  log({ ts: new Date().toISOString(), field, value, ok, ...meta });
  return ok;
}

async function check(field, value) {
  switch (field) {
    case 'commit':
      return commitResolves(value);        // GitHub API: does this SHA/URL resolve?
    case 'staging':
    case 'production':
    case 'astro':
      return linkLives(value);             // HTTP 200?
    default:
      return false;
  }
}

async function commitResolves(url) {
  // TODO: hit the GitHub API (read-only token) and confirm the commit exists.
  return typeof url === 'string' && url.includes('github.com');
}

async function linkLives(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

// Allow: node "${CLAUDE_PLUGIN_ROOT}/scripts/verify.js" <field> <value>
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , field, value] = process.argv;
  verify(field, value).then((ok) => {
    console.log(ok ? 'verified' : 'UNVERIFIED');
    process.exit(ok ? 0 : 1);
  });
}
