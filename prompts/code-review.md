---
description: Review changes for defects and unnecessary complexity
---
Review request: ${ARGUMENTS:-not specified}

Perform a read-only code review. Do not modify files, install dependencies,
fetch remote changes, commit, or push.

## Establish the scope

Interpret the review request as natural language, not as a fixed set of modes.

The user may ask to review staged changes, unstaged changes, all uncommitted
changes, a commit or range, or the current branch relative to another branch.
Review only the requested scope.

If the scope or comparison base is unclear, ask one concise clarifying question
before proceeding. Do not silently combine staged, unstaged, and branch changes.

Read the applicable repository instructions before reviewing.

## Establish the intent

Determine the task and required behavior from the user's context, repository
instructions, issue references, documentation, tests, commit history, and
surrounding code.

Do not treat the implementation itself as the specification. If the intended
behavior cannot be established, state the necessary assumption or ask for
clarification instead of guessing.

## Understand the behavioral change

Group the diff into semantic changes rather than reviewing isolated lines.

For each semantic change:

1. identify its entry points and current consumers;
2. compare behavior before and after the change;
3. trace affected call sites, contracts, data flow, state transitions, and
   error or cleanup paths;
4. look for a concrete input or execution path that violates the intended
   behavior;
5. inspect relevant tests as evidence of the expected behavior.

Pay particular attention to correctness, regressions, security boundaries,
authorization, validation, data loss, concurrency, resource lifecycle, error
handling, and incompatible API or data changes.

Report a missing test only when it leaves a concrete behavior or regression
risk unverified. Do not request tests merely to increase coverage.

## Check implementation minimality

Verify that the implementation is the smallest one that fully satisfies the
current task and established repository contracts.

“Smallest” means the least unnecessary behavior, API surface, configuration,
state, and indirection—not necessarily the fewest lines.

Look for:

- arguments, parameters, props, options, fields, or callbacks with no current
  consumer;
- values passed explicitly even though the existing default already provides
  the required behavior;
- pass-through plumbing that does not transform, validate, or otherwise affect
  a value;
- wrappers or helpers that only rename or forward a single operation;
- abstractions, extension points, configuration, feature flags, fallbacks, or
  compatibility layers created for hypothetical future needs;
- duplicated state or configuration when an existing source of truth is
  sufficient;
- new code that duplicates an existing repository, language, platform, or
  dependency capability;
- premature optimization without a demonstrated constraint or measurement.

Apply a deletion test to each suspected complication: determine whether it can
be removed while preserving all currently required behavior.

Report unnecessary complexity only when all of the following are true:

1. no current requirement, contract, convention, or caller needs it;
2. removing it preserves the required behavior; and
3. you can describe a concrete smaller implementation.

Do not recommend simplification that weakens correctness, type safety,
boundary validation, security, testability, observability, readability, or a
confirmed compatibility requirement. Do not treat every single-use helper or
explicit value as unnecessary.

Never justify complexity solely as preparation for possible future needs.

## Validate findings

Before reporting a finding, try to disprove it:

- verify that the execution path is reachable;
- check whether validation or handling exists elsewhere;
- inspect relevant callers, defaults, types, and tests;
- distinguish behavior introduced by the change from a pre-existing issue;
- confirm that the proposed fix would not violate another contract.

Report only findings caused or exposed by the reviewed changes.

Discard findings based only on speculation, incomplete context, stylistic
preference, or a hypothetical future requirement. Do not report a concern
unless the author can act on it.

You may run existing, relevant, non-destructive checks when they materially
improve confidence. Do not run broad or expensive checks without a clear
reason.

## Output

Return findings only, ordered by severity. Do not praise, summarize, or restate
the changes.

Use this format for each finding:

### [severity] [category] Concise title

`path/to/file.ext:line-line`

Explain:

- the concrete execution scenario or evidence;
- the resulting behavior or maintenance cost;
- why the reviewed change causes it;
- the smallest safe correction.

Use one of these severities:

- `critical`: likely security compromise, data loss, or system-wide failure;
- `high`: common or serious incorrect behavior with substantial impact;
- `medium`: real defect triggered under specific conditions;
- `low`: proven unnecessary complexity or a limited correctness problem.

Use one of these categories:

- `correctness`
- `security`
- `compatibility`
- `unnecessary-complexity`

Keep line ranges as small as possible and normally point to changed lines.
Combine findings with the same root cause.

If no actionable findings remain after validation, respond:

`No actionable findings.`

Then briefly list only significant behavior that could not be verified, if any.
