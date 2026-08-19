#!/usr/bin/env node
// verify.js — the "prove it" checks. Evidence only counts if these pass.
//
// Every call is appended to .crew/verify-log.jsonl in the project. That log is the ONLY
// record that verification ever ran, and the PM's promotion criterion ("verify.js has run a
// clean quarter and caught a real bad record") is unanswerable without it. Logging is
// best-effort: a log that cannot be written must never fail a verification.

import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { projectPath } from './project.js';
import { resolve as resolveToken } from './credentials.js';

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
  const { ok, reason } = await check(field, value);
  log({ ts: new Date().toISOString(), field, value, ok, ...(ok ? {} : { reason }), ...meta });
  return ok;
}

/** The reason a check failed, for the log. Callers that only need a verdict use verify(). */
export async function explain(field, value) {
  return check(field, value);
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
      return { ok: false, reason: `"${field}" is not a verifiable field` };
  }
}

/**
 * One retry, on a transient failure only.
 *
 * Fail-closed is right for "this commit does not exist" and wrong for "GitHub returned 504" — the
 * first is evidence of a problem, the second is weather. Without this, a flaky gateway silently
 * demotes real evidence to unverified and the sweep raises a false alarm. A 4xx is never retried:
 * a 404 will still be a 404 in half a second.
 */
async function withRetry(attempt) {
  for (let i = 0; i < 2; i++) {
    const r = await attempt();
    if (r.ok || !r.transient) return r;
    if (i === 0) await new Promise((res) => setTimeout(res, 750));
  }
  return attempt();
}

/**
 * Does this commit actually exist?
 *
 * Accepts a full GitHub commit URL or a bare SHA — the Engineer reports whichever git gave it. A
 * bare SHA is resolved against `repo.slug` from productive.config.json, because a SHA with no repo
 * is not evidence of anything.
 *
 * Fails CLOSED. A network error, a rate limit, a missing repo — all return false. A verifier that
 * says "probably fine" when it could not check is worse than no verifier: it launders a guess into
 * a recorded fact, which is exactly what the substring check this replaces was doing.
 *
 * Private repos need a token — GITHUB_TOKEN in the environment, or `github` in credentials.js.
 * Unauthenticated calls work for public repos at 60/hour, which a daily sweep stays well under.
 */
async function commitResolves(value) {
  if (typeof value !== 'string' || !value.trim()) return { ok: false, reason: 'empty' };

  const parsed = parseCommit(value.trim());
  if (!parsed) {
    return {
      ok: false,
      reason: 'not a GitHub commit URL, and not a bare SHA with repo.slug set in productive.config.json',
    };
  }

  const token = resolveToken('github');
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'productive-crew',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return withRetry(async () => {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${parsed.slug}/commits/${parsed.sha}`,
        { method: 'GET', headers }
      );
      if (res.ok) return { ok: true };
      if (res.status === 404) return { ok: false, reason: `no such commit in ${parsed.slug}` };
      if (res.status === 403 || res.status === 401) {
        return {
          ok: false,
          reason: `GitHub returned ${res.status} — rate limited, or the repo is private and no ` +
                  'GITHUB_TOKEN is set',
        };
      }
      return { ok: false, transient: res.status >= 500, reason: `GitHub returned ${res.status}` };
    } catch (e) {
      return { ok: false, transient: true, reason: `could not reach GitHub (${e.cause?.code ?? 'network'})` };
    }
  });
}

/** `{slug, sha}` from a commit URL or a bare SHA, or null if it can't be pinned to a repo. */
function parseCommit(value) {
  const url = value.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/\s]+\/[^/\s]+)\/commits?\/([0-9a-f]{7,40})\b/i
  );
  if (url) return { slug: url[1].replace(/\.git$/, ''), sha: url[2] };

  // A bare SHA only means something alongside the repo it belongs to.
  if (/^[0-9a-f]{7,40}$/i.test(value)) {
    const slug = repoSlug();
    return slug ? { slug, sha: value } : null;
  }
  return null;
}

function repoSlug() {
  try {
    const slug = JSON.parse(readFileSync(projectPath('productive.config.json'), 'utf8')).repo?.slug;
    return typeof slug === 'string' && slug.includes('/') && !slug.startsWith('owner/') ? slug : null;
  } catch {
    return null;
  }
}

async function linkLives(url) {
  return withRetry(async () => {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.ok) return { ok: true };
      return { ok: false, transient: res.status >= 500, reason: `answered ${res.status}` };
    } catch (e) {
      return { ok: false, transient: true, reason: `unreachable (${e.cause?.code ?? 'network'})` };
    }
  });
}

// Allow: node "${CLAUDE_PLUGIN_ROOT}/scripts/verify.js" <field> <value>
if (import.meta.url === `file://${process.argv[1]}`) {
  const [, , field, value] = process.argv;
  // Print the reason too. "UNVERIFIED" alone sends someone hunting for a bad link when the real
  // answer was that GitHub was down for two seconds.
  explain(field, value).then(({ ok, reason }) => {
    console.log(ok ? 'verified' : `UNVERIFIED — ${reason}`);
    process.exit(ok ? 0 : 1);
  });
}
