# Agent registry

The one file a successor reads first. "What can touch production right now?"

| Agent | Level | Scope | Verifier | Kill switch |
|---|---|---|---|---|
| 🎨 token-builder | Senior | `tokens.json` (imported) → Style Dictionary build (no Airtable) | token-check | `AGENTS_PAUSED` |
| 🔍 QA | Senior | Storybook-testing tables · Asana comments · verdict | test records + PM verify | `AGENTS_PAUSED` |
| 🔨 Engineer | Junior | `src/components/` | vitest + typecheck/lint + QA | `AGENTS_PAUSED` |
| 🚀 DevOps *(optional — `deploy.enabled`)* | Junior · prod human-gated | git staging→main · Pages deploy | build CI + orchestrator approval | `AGENTS_PAUSED` |
| 🧭 PM | Autonomous *(starts Observer)* | verify records + links · sync Asana (daily) | `${CLAUDE_PLUGIN_ROOT}/scripts/verify.js` (deterministic) | `AGENTS_PAUSED` |
| 📄 doc-generator | Senior (optional) | `docs/` | docs-build CI | `AGENTS_PAUSED` |
| ⚖️ governance-review | Advisor | read-only — proposes, never edits | you | `AGENTS_PAUSED` |

**Orchestrator:** [your name] — owns this registry, promotions, and the kill switch.

**Start conservative:** for the first 4–8 weeks run every agent one rung lower (output reviewed),
then promote on the cadence as each verifier proves out. See `OPERATING-MODEL.md` for the reasoning
and `decisions/` for the ADRs.
