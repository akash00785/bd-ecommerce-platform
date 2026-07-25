---
name: GitHub push safety
description: Safe workflow for repositories whose local remote is not the user's GitHub repository
---

When pushing to a user-provided GitHub repository, verify the actual remote and fetch the GitHub default branch before applying changes. Do not force-push a local branch that may be based on an older or reduced workspace snapshot.

**Why:** The workspace may use an internal backup remote while the GitHub repository has newer commits and additional application files. Pushing the local branch directly can be rejected or, worse, overwrite unrelated remote work.

**How to apply:** Fetch the GitHub branch with secure credentials, compare histories, apply only the requested changes on top of the remote tip, run targeted validation, then push normally to the requested branch.