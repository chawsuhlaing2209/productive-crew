#!/usr/bin/env bash
# Carries the Airtable token from the plugin's install prompt to the scripts that need it.
#
# The board is reached by scripts/board.js — a plain Node process — not by an MCP server. Node
# processes started by the Bash tool do NOT receive CLAUDE_PLUGIN_OPTION_*; hook processes do. So
# this hook is the only bridge between the value you typed at install and the crew that uses it.
#
# It writes ~/.claude/productive-crew/credentials.json (0600, in a 0700 dir). That is a copy of a
# value the OS keychain also holds, which is a deliberate trade: without it, every project needs a
# manual terminal step. Prefer not to have the copy? Leave the install prompt blank and store it
# yourself with `credentials.js store airtable`, or export AIRTABLE_API_KEY — both still win over
# this file.
#
# The token is passed to node through the environment, never as an argument — `ps` shows the
# argument list of every process on the machine.
#
# Silent by design. It prints nothing on success, never the token, and never fails the session.
set -uo pipefail

TOKEN="${CLAUDE_PLUGIN_OPTION_AIRTABLE_TOKEN:-}"
[ -z "$TOKEN" ] && exit 0

CRED_MODULE="file://${CLAUDE_PLUGIN_ROOT}/scripts/credentials.js" CRED_TOKEN="$TOKEN" node -e '
import(process.env.CRED_MODULE).then(({ resolve, store }) => {
  const token = process.env.CRED_TOKEN;
  // Only write when it would change something — a session start should not touch disk for nothing.
  if (resolve("airtable") !== token) store("airtable", token);
}).catch(() => {});
' 2>/dev/null

exit 0
