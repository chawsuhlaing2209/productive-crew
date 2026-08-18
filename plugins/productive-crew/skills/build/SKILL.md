---
name: build
description: Build one component. Routes through the PM front door — checks setup, reads the Airtable registry, opens the Asana ticket — then the Engineer builds. Usage: /productive-crew:build <Component>.
---

# /productive-crew:build <Component>

**Do not go straight to the Engineer.** Hand this to the **pm** agent first — it runs intake:

1. Config check (`${CLAUDE_PLUGIN_ROOT}/scripts/preflight.js`) — not set up → `/productive-crew:setup`, stop.
2. Airtable registry — find `$ARGUMENTS`; read its status + Figma node, or offer to register it.
3. Create the Asana ticket + subtasks, assign the Engineer.

Then the **engineer** agent builds `$ARGUMENTS` using the Figma node **from Airtable** —
code + stories + vitest → staging. Finish with the Engineer card and hand off to QA.

Never ask the user for a Figma node. Only ask when you can't find the node in Airtable for requested component.
