#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node "$REPO_ROOT/scripts/settings.mjs" capture

echo "Review the diff before committing: git -C \"$REPO_ROOT\" diff -- config/settings.json"
