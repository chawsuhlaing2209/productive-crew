#!/usr/bin/env bash
# Plugins can't ship memory files, so the crew's law is injected at session start —
# but only in a project that actually uses the crew.
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
[ -f "$ROOT/productive.config.json" ] || exit 0

LAW="${CLAUDE_PLUGIN_ROOT}/rules/crew-law.md"
[ -f "$LAW" ] || exit 0

node -e '
const fs = require("fs");
const context = fs.readFileSync(process.argv[1], "utf8");
process.stdout.write(JSON.stringify({
  hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context }
}));
' "$LAW"
