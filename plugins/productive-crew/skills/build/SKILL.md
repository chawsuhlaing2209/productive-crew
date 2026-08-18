---
name: build
description: Build one component. Routes through the PM front door — checks setup, reads the Airtable registry, opens the Asana ticket — then the Engineer builds. Usage: /productive-crew:build <Component>.
---

# /productive-crew:build <Component>

**Do not go straight to the Engineer.** Hand this to the **pm** agent first — it runs intake:

1. Config check (`${CLAUDE_PLUGIN_ROOT}/scripts/preflight.js`) — not set up → `/productive-crew:setup`, stop.
2. Airtable registry — find `$ARGUMENTS`; read its status + Figma node, or offer to register it.
3. **Create the Asana ticket + subtasks, assign the Engineer — before any handoff.** If Asana
   can't be reached, stop and report it; never hand off ticketless.

Then the **engineer** agent builds `$ARGUMENTS` using the Figma node **from Airtable**, through
its five ordered stages — **schema → tokens → implement → test → parity** — looping on
each until its check is green. It pushes to staging only on green. Finish with the Engineer card
and hand its card **back to the pm** — which verifies the staging URL, writes it into
`Staging Storybook`, and comments it on the ticket. Only then is the component `Ready for Testing`
and QA has something to test.

A stage that can't go green is a **stop and ask**, reported as a blocker card. It is never a
handoff with a known failure attached.

Never ask the user for a Figma node. Only ask when you can't find the node in Airtable for requested component.
