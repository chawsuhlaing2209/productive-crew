# ADR 0001 — token-parity starts en route to Autonomous

**Date:** [set it]
**Status:** accepted

## Decision
token-parity is registered with a target level of **Autonomous**.

## Why
It writes only a status column, never code or production. It is its own deterministic
verifier (`${CLAUDE_PLUGIN_ROOT}/scripts/parity-check.js`), so a wrong result is caught by re-running the check.
Nothing it does can reach a shipped component.

## Guardrail
Audited monthly against the cadence. Kill switch: `AGENTS_PAUSED`.

## Note
Per "start conservative", it runs at **Senior** (output reviewed) until it has a short clean
track record, then promotes to Autonomous with a follow-up ADR.
