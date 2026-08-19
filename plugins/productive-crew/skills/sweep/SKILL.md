---
name: sweep
description: Run the PM sweep — verify every record and link on the board, reconcile Asana, and report what needs a human.
---

# /productive-crew:sweep

Delegate to the **pm** agent.

## Making it run by itself

The sweep is what catches work nobody was told about — a `To be fixed` row with no ticket, a
`To be deployed` row waiting on you. It is worth scheduling, and **the plugin cannot schedule it**:
plugins ship hooks, which fire on events, not on the clock.

Ask Claude to *"run the productive-crew sweep every weekday morning"*. It becomes a scheduled task
stored outside your project, which survives restarts and runs on next launch if the app was closed.

Two things to get right when you do:

- **The scheduled run starts with no memory of this conversation.** Its prompt must name the project
  directory, or it will sweep whatever happens to be open.
- **Schedule it only once the crew actually works** — tokens set, Airtable reachable. A daily job
  firing into a broken setup produces a daily failure, and you will start ignoring it. Read the board, verify evidence with `${CLAUDE_PLUGIN_ROOT}/scripts/verify.js`,
reconcile Asana, and return one card: what's verified, what's in a fix loop, what waits on approval.
