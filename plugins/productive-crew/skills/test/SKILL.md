---
name: test
description: Test one component against Figma in the deployed preview and log findings. Usage: /productive-crew:test [<Component> | all].
---

# /productive-crew:test [<Component> | all]

Delegate to the **qa** agent. It follows
`${CLAUDE_PLUGIN_ROOT}/rules/qa/testing-plan.md` Step 0 → Step 8 and returns the verdict card.

**Run it in the foreground.** QA drives the designer's own Chrome, and watching the run is half its
value — they see the states being exercised and can take the tab over the moment something looks
wrong. A background task hides exactly the part they wanted to see, and it can't ask them anything
mid-run. Only background it if they explicitly ask for it.

| You type | It does |
|---|---|
| `/productive-crew:test` | lists every component currently `Ready for Testing`, asks which to run |
| `/productive-crew:test <Component>` | runs the full protocol for that one |
| `/productive-crew:test all` | runs every `Ready for Testing` component in sequence |

Step 0 runs the pre-flight — Figma, Airtable, and the designer's Chrome — and loads
`governance/qa-memory.md`. **Step 2 brings the preview up and opens it in that Chrome**, starting
Storybook itself if nothing is serving the port, so this works the same in any repo the plugin is
installed into. Step 8 writes back what the run taught. All three are part of the protocol — don't
skip them to save a turn.
