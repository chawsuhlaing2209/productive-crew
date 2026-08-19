#!/usr/bin/env node
// run-log.js — did the scheduled work actually happen?
//
// The plugin cannot schedule anything: it ships hooks, which fire on events, not on the clock. So
// the scheduler lives outside — a Claude Code scheduled task, launchd, cron, CI. Whatever runs it,
// the same failure mode applies: **a scheduler that quietly stops firing looks exactly like a board
// with nothing to report.** Both are silence.
//
// This closes that gap from the other end. The plugin can't make the sweep run, but it can hold the
// expectation and notice when reality diverges:
//
//   productive.config.json     "schedule": { "sweep": { "everyHours": 24 } }   ← what you intended
//   .crew/runs/sweep.jsonl     one line per actual run                          ← what happened
//
// Only a cadence you declared is ever checked. Nagging about a sweep nobody scheduled is noise, and
// noise is how a real warning gets ignored.
//
//   node run-log.js record <kind> '<json>'   append a run
//   node run-log.js status [--json]          what ran, when, and what is overdue

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { projectPath } from './project.js';

const RUNS_DIR = () => projectPath('.crew', 'runs');
const HOUR = 3600_000;

function schedule() {
  try {
    return JSON.parse(readFileSync(projectPath('productive.config.json'), 'utf8')).schedule ?? {};
  } catch {
    return {};
  }
}

export function record(kind, data = {}) {
  mkdirSync(RUNS_DIR(), { recursive: true });
  const entry = { ts: new Date().toISOString(), ...data };
  appendFileSync(join(RUNS_DIR(), `${kind}.jsonl`), JSON.stringify(entry) + '\n');
  return entry;
}

/** The most recent run of `kind`, or null. */
export function last(kind) {
  const file = join(RUNS_DIR(), `${kind}.jsonl`);
  if (!existsSync(file)) return null;
  const lines = readFileSync(file, 'utf8').trim().split('\n').filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    try { return JSON.parse(lines[i]); } catch { /* skip a torn line, keep looking */ }
  }
  return null;
}

/**
 * One entry per kind that either has a declared cadence or has ever run. `overdue` is only ever
 * true for a declared cadence — see the header.
 */
export function status() {
  const sched = schedule();
  const ran = existsSync(RUNS_DIR())
    ? readdirSync(RUNS_DIR()).filter((f) => f.endsWith('.jsonl')).map((f) => f.replace(/\.jsonl$/, ''))
    : [];

  return [...new Set([...Object.keys(sched), ...ran])].sort().map((kind) => {
    const entry = last(kind);
    const everyHours = sched[kind]?.everyHours ?? null;
    const ageHours = entry ? (Date.now() - Date.parse(entry.ts)) / HOUR : null;

    // A grace period, because "every 24h" run by a human-facing scheduler drifts by hours, and a
    // warning that fires on normal drift is one you learn to dismiss.
    const grace = everyHours != null ? Math.max(everyHours * 0.5, 6) : null;
    const overdue =
      everyHours != null && (ageHours === null || ageHours > everyHours + grace);

    return {
      kind,
      everyHours,
      lastRun: entry?.ts ?? null,
      ageHours: ageHours === null ? null : Math.round(ageHours * 10) / 10,
      lastOk: entry ? entry.ok !== false : null,
      overdue,
    };
  });
}

const ago = (h) =>
  h === null ? 'never' : h < 1 ? 'under an hour ago' : h < 48 ? `${Math.round(h)}h ago` : `${Math.round(h / 24)} days ago`;

/** One human line per problem, empty when everything is fine. Used by the session-start hook. */
export function warnings() {
  return status()
    .filter((s) => s.overdue || s.lastOk === false)
    .map((s) =>
      s.overdue
        ? `${s.kind} was scheduled every ${s.everyHours}h but last ran ${ago(s.ageHours)} — the scheduler may have stopped.`
        : `the last ${s.kind} run reported a failure (${ago(s.ageHours)}).`
    );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , op, ...rest] = process.argv;

  if (op === 'record') {
    const [kind, json] = rest;
    if (!kind) { console.error(`usage: run-log.js record <kind> '<json>'`); process.exit(1); }
    let data = {};
    if (json) {
      try { data = JSON.parse(json); } catch { console.error('the run data must be valid JSON'); process.exit(1); }
    }
    console.log(JSON.stringify(record(kind, data)));
  } else if (op === 'status') {
    const rows = status();
    if (rest.includes('--json')) { console.log(JSON.stringify(rows, null, 2)); process.exit(0); }
    if (!rows.length) { console.log('no scheduled work declared, and nothing has run yet'); process.exit(0); }
    for (const r of rows) {
      const cadence = r.everyHours ? `every ${r.everyHours}h` : 'no cadence declared';
      const flag = r.overdue ? '  ⚠ OVERDUE' : r.lastOk === false ? '  ⚠ last run failed' : '';
      console.log(`${r.kind.padEnd(10)} ${cadence.padEnd(22)} last ${ago(r.ageHours).padEnd(16)}${flag}`);
    }
    process.exit(rows.some((r) => r.overdue) ? 1 : 0);
  } else {
    console.error(`usage: run-log.js record <kind> '<json>' | status [--json]`);
    process.exit(1);
  }
}
