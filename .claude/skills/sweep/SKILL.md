---
name: sweep
description: Run the PM sweep — verify every record and link on the board, reconcile Asana, and report what needs a human.
---

# /sweep

Delegate to the **pm** agent. Read the board, verify evidence with `scripts/verify.js`,
reconcile Asana, and return one card: what's verified, what's in a fix loop, what waits on approval.
