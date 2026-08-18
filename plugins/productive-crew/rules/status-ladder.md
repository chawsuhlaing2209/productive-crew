# Status ladder (derived — nobody types it)

Airtable's formula computes `Development` from evidence columns. Agents write evidence; the formula reacts.

```
To-do                Figma link exists
Ready for testing    staging Storybook link exists
To be fixed          a staging test case Failed
To be deployed       all staging cases Passed
Fixing / Fixed       staging re-test partial / complete
Ready for TIP        production link exists
To be TIP fixed      a production case Failed
To be re-deployed    all production cases Passed
TIP Fixing / TIP Fixed   production re-test partial / complete
Completed            production verified end to end
```

If a status you don't recognise appears, report it and touch nothing.
