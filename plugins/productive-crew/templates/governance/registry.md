# Agent registry

The one file a successor reads first. "What can touch production right now?"

| Agent | Level | Scope | Verifier | Kill switch |
|---|---|---|---|---|
| 🎨 token-builder | Observer → target Senior | `tokens.json` (imported) → Style Dictionary build (no Airtable) | token-check | `AGENTS_PAUSED` |
| 🔍 QA | Observer → target Senior | Storybook-testing tables · Asana comments · verdict | test records + PM verify | `AGENTS_PAUSED` |
| 🔨 Engineer | Observer → target Junior | `src/components/` | vitest + typecheck/lint + QA | `AGENTS_PAUSED` |
| 🚀 DevOps *(optional — `deploy.enabled`)* | Observer → target Junior · prod human-gated | git staging→main · Pages deploy | build CI + orchestrator approval | `AGENTS_PAUSED` |
| 🧭 PM | Observer → target Autonomous | verify records + links · sync Asana (daily) | `${CLAUDE_PLUGIN_ROOT}/scripts/verify.js` (deterministic) | `AGENTS_PAUSED` |
| 📄 doc-generator | Observer → target Senior (optional) | `docs/` | docs-build CI | `AGENTS_PAUSED` |
| ⚖️ governance-review | Advisor | read-only — proposes, never edits | you | `AGENTS_PAUSED` |

**Orchestrator:** [your name] — owns this registry, promotions, and the kill switch.

**Everything starts at Observer.** Not as caution — as the truth. A level is a claim about a track
record, and on day one there is none. Run `/productive-crew:review` on your cadence and promote one
rung at a time as each verifier proves out. A level you did not earn tells a successor something
false about what can touch production. See `OPERATING-MODEL.md` for the reasoning
and `decisions/` for the ADRs.
