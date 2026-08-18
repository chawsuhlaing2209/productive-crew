---
name: finding-format
description: The one format for a QA finding, written to the Airtable Expected Results column and the Asana comment. Reference this whenever you log an issue.
user-invocable: false
---

# Finding format

Same block in the Airtable *Expected Results* column and the Asana comment.
**Never a raw value. Name the token or prop.**

```
Issue type: <visual · interaction · accessibility · …>
Expected: <one line — the token/prop it should use, never a hex or px>
Observation: <one line — what it does now>
Steps to reproduce: <steps>      ← only when applicable
Fix: <clear instruction; "correct token: <name>" if it's a token issue>
```

Example:
```
Issue type: visual
Expected: Info variant text should use the base text token, not text-positive
Observation: Info alert renders its text in text-positive on the idle state
Steps to reproduce: Alert → Info variant → default/idle story
Fix: correct token: text-base
```

Rules: one issue per row · one line each · say the token, never the hex/px ·
steps only when they help someone reproduce it.
