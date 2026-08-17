---
name: deploy
description: Promote a passing component from staging to production. Requires orchestrator approval. Usage: /deploy <Component>.
disable-model-invocation: true
---

# /deploy <Component>

User-only. Delegate to the **devops** agent for `$ARGUMENTS`.
DevOps confirms all staging cases passed and that you have approved, then merges staging → main
(CI deploys production). Never runs without approval.
