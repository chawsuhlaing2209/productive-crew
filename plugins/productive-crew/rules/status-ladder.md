# Status ladder (derived — nobody types it)

Airtable's formula computes `Development` from evidence columns. Agents write evidence; the formula reacts.

```
(blank)              nothing recorded yet
To-do                Figma link exists
To be staged         a verified commit exists
Ready for Testing    staging Storybook link exists
To be fixed          a staging test case Failed
Fixing / Fixed       staging re-test partial / complete
To be deployed       all staging cases Passed
Completed            production Storybook link exists
```

**There is no production-testing (TIP) loop.** QA tests staging only; `Completed` means the
production Storybook is deployed. A `Failed` staging row outranks every other rung, so a regression
logged after release pulls a Completed component back to `To be fixed`.

If a status you don't recognise appears, report it and touch nothing.
