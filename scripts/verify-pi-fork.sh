#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <fork-dir> <patch-file> <expected-commit>" >&2
  exit 2
fi

FORK_DIR="$1"
PATCH_FILE="$2"
EXPECTED_COMMIT="$3"

if [[ ! -d "$FORK_DIR/.git" ]]; then
  echo "Pi fork is not a Git repository: $FORK_DIR" >&2
  exit 1
fi

actual_commit="$(git -C "$FORK_DIR" rev-parse HEAD)"
if [[ "$actual_commit" != "$EXPECTED_COMMIT" ]]; then
  echo "Unexpected Pi revision: $actual_commit (expected $EXPECTED_COMMIT)." >&2
  exit 1
fi

expected_index="$(mktemp)"
actual_index="$(mktemp)"
rm -f "$expected_index" "$actual_index"
cleanup_indexes() {
  rm -f "$expected_index" "$actual_index"
}
trap cleanup_indexes EXIT

GIT_INDEX_FILE="$expected_index" git -C "$FORK_DIR" read-tree HEAD
GIT_INDEX_FILE="$expected_index" git -C "$FORK_DIR" apply --cached "$PATCH_FILE"
expected_tree="$(GIT_INDEX_FILE="$expected_index" git -C "$FORK_DIR" write-tree)"

GIT_INDEX_FILE="$actual_index" git -C "$FORK_DIR" read-tree HEAD
GIT_INDEX_FILE="$actual_index" git -C "$FORK_DIR" add --all
actual_tree="$(GIT_INDEX_FILE="$actual_index" git -C "$FORK_DIR" write-tree)"

if [[ "$actual_tree" != "$expected_tree" ]]; then
  echo "Pi fork files do not exactly match the pinned patch: $FORK_DIR" >&2
  exit 1
fi
