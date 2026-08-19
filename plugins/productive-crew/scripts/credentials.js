#!/usr/bin/env node
// credentials.js — where the crew's tokens come from, and the only place that decides.
//
// The board is reached by a SCRIPT, not by an MCP server, so the token has to be readable from a
// plain Node process. Three constraints shaped this:
//
//   1 · It must never be in the repo. That rule is enforced by hooks/secret-guard.sh and the
//       pre-commit hook, and this file must not become the exception.
//   2 · It must never pass through a command line. `ps` shows arguments to every process on the
//       machine, and secret-guard blocks any Bash call carrying a token shape — correctly.
//   3 · A designer should not have to edit a dotfile. The value they paste at the plugin's install
//       prompt is the one that should end up here, which is what hooks/credentials-bridge.sh does.
//
// Resolution order, most explicit first:
//
//   AIRTABLE_API_KEY / AIRTABLE_TOKEN in the environment   — CI, and an override for one session
//   ~/.claude/productive-crew/credentials.json (0600)      — written from the install prompt
//
// Nothing here ever prints a token. `source()` exists so a wrong-token problem can be diagnosed
// by naming WHERE the value came from, which is the question you actually need answered.

import { readFileSync, writeFileSync, mkdirSync, chmodSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

export const CREDENTIALS_FILE = join(homedir(), '.claude', 'productive-crew', 'credentials.json');

/** Environment variable names accepted for each service, in order. */
const ENV_VARS = {
  airtable: ['AIRTABLE_API_KEY', 'AIRTABLE_TOKEN'],
  asana: ['ASANA_ACCESS_TOKEN', 'ASANA_TOKEN'],
};

function fromFile(service) {
  try {
    const v = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf8'))[service];
    return typeof v === 'string' && v.trim() ? v.trim() : null;
  } catch {
    return null; // absent or unreadable is simply "not set here"
  }
}

function fromEnv(service) {
  for (const name of ENV_VARS[service] ?? []) {
    const v = process.env[name];
    if (v && v.trim()) return { value: v.trim(), via: name };
  }
  return null;
}

/** The token, or null. */
export function resolve(service) {
  return fromEnv(service)?.value ?? fromFile(service);
}

/** Where the token came from, for diagnostics. Never the value. */
export function source(service) {
  const env = fromEnv(service);
  if (env) return `the ${env.via} environment variable`;
  if (fromFile(service)) return CREDENTIALS_FILE;
  return null;
}

/**
 * Store a token, read from STDIN so it never appears in an argument list. Returns nothing and
 * prints nothing but a confirmation — writing the value back would defeat the point.
 */
export function store(service, token) {
  if (!token || !token.trim()) throw new Error('refusing to store an empty token');
  mkdirSync(join(homedir(), '.claude', 'productive-crew'), { recursive: true, mode: 0o700 });

  let all = {};
  try { all = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf8')); } catch { /* first write */ }
  all[service] = token.trim();

  writeFileSync(CREDENTIALS_FILE, JSON.stringify(all, null, 2) + '\n', { mode: 0o600 });
  chmodSync(CREDENTIALS_FILE, 0o600); // an existing file keeps its old mode without this
  return CREDENTIALS_FILE;
}

/** True if the file is readable by anyone but its owner. */
export function isExposed() {
  try {
    return (statSync(CREDENTIALS_FILE).mode & 0o077) !== 0;
  } catch {
    return false;
  }
}

// CLI:  node credentials.js store <service>   — token on stdin
//       node credentials.js check <service>   — prints the source, never the value
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , op, service = 'airtable'] = process.argv;
  if (op === 'store') {
    const done = (buf) => {
      try {
        console.log(`\nstored ${service} token in ${store(service, buf)} (owner read/write only)`);
      } catch (e) {
        console.error(String(e.message || e));
        process.exit(1);
      }
    };

    if (process.stdin.isTTY) {
      // Typed by a person: prompt, and turn echo off so the token never appears on screen or in
      // the terminal's scrollback.
      process.stdout.write(`Paste your ${service} token (it will not be shown): `);
      const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
      rl.input.setRawMode?.(true);
      let buf = '';
      rl.input.on('data', (chunk) => {
        for (const ch of chunk.toString('utf8')) {
          if (ch === '\r' || ch === '\n') {
            rl.input.setRawMode?.(false);
            rl.close();
            return done(buf);
          }
          if (ch === '\u0003') { process.stdout.write('\n'); process.exit(130); }   // ctrl-c
          if (ch === '\u007f') { buf = buf.slice(0, -1); continue; }                 // backspace
          buf += ch;
        }
      });
    } else {
      let buf = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (d) => (buf += d));
      process.stdin.on('end', () => done(buf));
    }
  } else if (op === 'check') {
    const where = source(service);
    console.log(where ? `${service}: set — from ${where}` : `${service}: NOT SET`);
    process.exit(where ? 0 : 1);
  } else {
    console.error('usage: credentials.js <store|check> <airtable|asana>   (store reads stdin)');
    process.exit(1);
  }
}
