#!/usr/bin/env node
// verify.js — the "prove it" checks. Evidence only counts if these pass.

export async function verify(field, value) {
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
