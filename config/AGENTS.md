# Global instructions

## Implementation discipline

Understand the task before optimizing the solution: read the affected code, trace the real end-to-end flow, and inspect callers and usages before editing.

Prefer the first option that fully satisfies the requirement:

1. Do not build behavior that is not actually needed.
2. Reuse an existing helper, type, pattern, or convention in the codebase.
3. Use the standard library or a native platform capability.
4. Use an already-installed dependency when it is an appropriate fit.
5. Only then write the smallest clear implementation that works.

For bug fixes, address the shared root cause rather than only the reported symptom. Check sibling call paths so the fix is applied at the narrowest correct shared point.

Avoid speculative abstractions, future-proof scaffolding, unnecessary dependencies, and unrelated cleanup. Prefer deletion over addition, boring readable code over clever code, and a small focused diff over broad churn. Treat line count and file count only as tie-breakers after correctness and maintainability.

Do not simplify away explicit requirements, security controls, accessibility, validation at trust boundaries, error handling that prevents data loss, observability needed to operate the system, or necessary hardware calibration. Evaluate dependencies by fitness, maintenance, and risk—not merely by whether they are installed or whether a custom implementation is short.

Validate changed behavior with the smallest adequate check that follows the repository's existing test strategy. Scale coverage to risk; money, security, parsing, persistence, and other high-impact paths may require more than one check.
