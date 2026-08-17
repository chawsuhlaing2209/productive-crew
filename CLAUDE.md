# Claude Code — project entry

@AGENTS.md

<!--
Everything the crew needs is in AGENTS.md, so Cursor and Codex read the same rules.
Claude-only notes go below this line.
-->

## Claude-only notes

- The crew lives in `.claude/agents/`. The PM delegates to them as subagents.
- Slash workflows live in `.claude/skills/` — `/sweep`, `/build`, `/test`, `/deploy`, `/tokens`, `/parity`.
- Path-scoped detail loads from `.claude/rules/` when you touch `tokens/` or `src/`.
