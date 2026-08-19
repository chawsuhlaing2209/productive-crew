#!/usr/bin/env bash
# Launches the Asana MCP server with the token from the plugin's install prompt.
#
# Why a launcher instead of an `env` block in .mcp.json: ${user_config.*} substitution only works
# in an MCP server's `url`, `headers` and `headersHelper` — NOT in `env`. Putting it there passed
# the literal string "${user_config.asana_token}" to the server as its token, which failed auth and
# got the server flagged "needs auth" with no indication that the cause was a placeholder.
#
# What does reach us: Claude Code exports every userConfig value to server subprocesses as
# CLAUDE_PLUGIN_OPTION_<KEY>. So the token arrives here as CLAUDE_PLUGIN_OPTION_ASANA_TOKEN and we
# rename it to the two names the server actually reads.
set -euo pipefail

TOKEN="${CLAUDE_PLUGIN_OPTION_ASANA_TOKEN:-${ASANA_ACCESS_TOKEN:-${ASANA_TOKEN:-}}}"

if [ -z "$TOKEN" ]; then
  echo "No Asana token. Set it in /plugin → productive-crew, or run the crew without ticketing." >&2
  exit 1
fi

ASANA_ACCESS_TOKEN="$TOKEN" ASANA_TOKEN="$TOKEN" exec npx -y @roychri/mcp-server-asana
