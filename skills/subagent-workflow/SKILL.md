---
name: subagent-workflow
description: Use when delegating investigation, implementation, review, or other work to one or more Pi subagents. Read this skill before every subagent execution or workflowScript call; it keeps all work in the current turn and forbids background execution.
---

# Run subagents in foreground

Keep all subagent work in the current turn.

## Frame the work

Before launching an agent:

1. State the result you need and how you will judge completion.
2. Split the work only when the parts are independent or when separate attempts would improve the result.
3. Match each task to the agent's description.
4. Give every agent a self-contained brief with the goal, scope, paths, constraints, validation, and expected report.

Use `scout` for repository investigation, `researcher` for web research, and `worker` for repository changes.

Ask agents to report `PASS`, `ISSUES`, or `BLOCKED` with evidence when several results need aggregation.

## Run one agent

Use one direct `subagent` call. Set `async: false` explicitly. Do not create a workflow for one independent task.

```json
{
  "agent": "scout",
  "task": "Find where authentication tokens are validated. Return exact paths and line ranges.",
  "async": false
}
```

Read the result before continuing.

## Run independent agents in parallel

Make exactly one top-level `workflowScript` call and start all children inside it with `runs.all`. Never make several top-level subagent calls for one parallel phase.

Set `async: false` on the workflow call. This keeps the workflow in the current turn. It does not make the children sequential. For a workflow in the current Git repository, set `chatProgress: "live-card"`.

```json
{
  "workflowScript": "const results = await runs.all([{ key: \"code\", agent: \"scout\", task: \"Find the relevant code and return exact paths and line ranges.\" }, { key: \"docs\", agent: \"researcher\", task: \"Find the relevant official documentation and return source URLs.\" }]); return results;",
  "async": false,
  "chatProgress": "live-card"
}
```

`runs.all` returns an ordered array. Read results by index or destructuring, not by key property. Give every child a unique key.

Use `runs.lanes` when each independent lane has dependent stages. Keep all lanes inside the same foreground workflow.

Do not run independent investigations in sequence.

## Isolate writers

Use one writer per working directory. Read-only agents may share the current directory.

When parallel agents edit files, set `worktree: true` for each writer. Give each writer a distinct scope and state which files it owns. Do not let several agents edit the same path.

After the agents finish, inspect their changes and combine them deliberately. Do not accept a child's self-report as validation.

After preserving the accepted changes, remove every worktree created for the workflow with `git worktree remove <path>`, then run `git worktree prune`. Never use `--force`; if removal fails, inspect the worktree for uncommitted or untracked files first.

## Aggregate and report

Read every completed result. Check that every requested slice returned an answer, and note failures or missing coverage.

Return one concise report with:

- the useful findings or changes
- validation evidence
- unresolved issues, blocked work, or dropped agents

Do not paste raw child output or workflow diagnostics unless the user asks for them.

Do not call `bg_wait` for foreground work.

## Never use background execution

Never set `async: true`. Run every subagent and workflow in the current turn.
