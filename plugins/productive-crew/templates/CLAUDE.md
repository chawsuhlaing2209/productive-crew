# Claude Code — project entry

@AGENTS.md

<!--
Everything the crew needs is in AGENTS.md, so Cursor and Codex read the same rules.
Claude-only notes go below this line.
-->

## Claude-only notes

- The crew is the **productive-crew plugin** — agents, skills, and rules install with it. Nothing crew-related lives in this repo.
- Slash workflows are namespaced: `/productive-crew:build`, `:test`, `:deploy`, `:tokens`, `:sweep`, `:docs`, `:review`.
- `productive.config.json` and `AGENTS_PAUSED` are the only crew files in this repo. Update the plugin, not them, to change how the crew works.
