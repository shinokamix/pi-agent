---
description: Suggest three commit messages from current changes
argument-hint: "[ticket or context]"
---

Inspect the current branch name, the latest 10 non-merge commit subjects from
the repository's default branch, and the staged diff. Resolve the default branch
from `origin/HEAD`, then try `main` or `master`; fall back to the current history.
Do not fetch. If nothing is staged, inspect the unstaged diff.

User context: ${ARGUMENTS:-none}

Suggest three commit subjects that describe the intent of the change.

Follow a clearly recurring repository format, including ticket prefixes. Never
invent a ticket. Do not force Conventional Commits.

If no clear format exists, use a concise plain-English phrase that starts with
a lowercase active verb, uses specific words, and has no trailing period.
Prefer 72 characters or fewer.

Put the strongest option first and format each option for easy copying. Do not
commit or modify anything.
