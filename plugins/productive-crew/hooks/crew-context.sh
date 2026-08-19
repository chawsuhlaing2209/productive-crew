#!/usr/bin/env bash
# Plugins can't ship memory files, so the crew's law is injected at session start —
# but only in a project that actually uses the crew.
#
# It also carries any scheduling warning. The plugin cannot run the sweep on a clock, but it can
# say, in the one place everyone looks, that the thing you scheduled has stopped happening.
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -f "$ROOT/productive.config.json" ] || exit 0

LAW="${CLAUDE_PLUGIN_ROOT}/rules/crew-law.md"
[ -f "$LAW" ] || exit 0

node -e '
const fs = require("fs");
let context = fs.readFileSync(process.argv[1], "utf8");

// Best effort, always. A warning that cannot be computed must never cost the session its law.
(async () => {
  try {
    const { warnings } = await import(process.argv[2]);
    const w = warnings();
    if (w.length) {
      context += "\n\n## Scheduling — needs a human\n\n" +
        w.map((line) => `- ${line}`).join("\n") +
        "\n\nSay this to the user plainly at the start of the session. " +
        "A scheduled job that stopped is invisible until someone is told.\n";
    }
  } catch { /* no run log, unreadable config, anything — carry on with the law alone */ }

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context }
  }));
})();
' "$LAW" "${CLAUDE_PLUGIN_ROOT}/scripts/run-log.js"
