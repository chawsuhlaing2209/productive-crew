---
name: test
description: Test one component against Figma in the deployed preview and log findings. Usage: /productive-crew:test [<Component> | all].
---

# /productive-crew:test [<Component> | all]

Delegate to the **qa** agent. It follows
`${CLAUDE_PLUGIN_ROOT}/rules/qa/testing-plan.md` Step 0 → Step 7 and returns the verdict card.

| You type | It does |
|---|---|
| `/productive-crew:test` | lists every component currently `Ready for Testing`, asks which to run |
| `/productive-crew:test <Component>` | runs the full protocol for that one |
| `/productive-crew:test all` | runs every `Ready for Testing` component in sequence |

Step 0 runs the pre-flight (Figma, Airtable, Storybook) and loads `governance/qa-memory.md` before
anything is tested. Step 7 writes back what the run taught. Both are part of the protocol — don't
skip them to save a turn.
