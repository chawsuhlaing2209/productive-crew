#!/usr/bin/env bash
# Refuses any write whose content carries a credential.
#
# The crew's law says secrets never enter the repo. This is the part that enforces it, because
# a rule an agent can forget is not a control. Reads the PreToolUse payload on stdin and blocks
# on a high-confidence token shape.
#
# Deliberately narrow: only prefixes that are unambiguously credentials. A guard that cries wolf
# gets switched off, and a switched-off guard protects nothing.
set -uo pipefail

payload="$(cat)"

# Look at what is being written, not the whole payload — a path or a prompt mentioning a token
# name is fine; a token VALUE is not.
content="$(printf '%s' "$payload" | node -e '
let s = "";
process.stdin.on("data", d => (s += d));
process.stdin.on("end", () => {
  try {
    const i = (JSON.parse(s).tool_input) ?? {};
    process.stdout.write([i.content, i.new_string, i.command].filter(Boolean).join("\n"));
  } catch { process.stdout.write(""); }
});' 2>/dev/null)"

[ -z "$content" ] && exit 0

declare -a NAMES=(
  "Airtable personal access token"
  "Asana personal access token"
  "GitHub token"
  "GitHub personal access token"
  "Figma personal access token"
  "OpenAI-style key"
)
declare -a PATTERNS=(
  'pat[A-Za-z0-9]{13,}\.[A-Za-z0-9]{30,}'
  '[0-9]/[0-9]{15,}:[A-Za-z0-9]{30,}'
  'ghp_[A-Za-z0-9]{30,}'
  'github_pat_[A-Za-z0-9_]{50,}'
  'figd_[A-Za-z0-9_-]{30,}'
  'sk-[A-Za-z0-9]{40,}'
)

for i in "${!PATTERNS[@]}"; do
  if printf '%s' "$content" | grep -qE "${PATTERNS[$i]}"; then
    cat >&2 <<MSG
BLOCKED — that write contains what looks like a ${NAMES[$i]}.

Secrets never enter the repo. Put the value in your environment and reference it:

    "AIRTABLE_API_KEY": "\${AIRTABLE_API_KEY}"

If this is a false positive, the guard is \${CLAUDE_PLUGIN_ROOT}/hooks/secret-guard.sh.
MSG
    exit 2
  fi
done
exit 0
