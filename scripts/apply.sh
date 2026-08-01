#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
node "$REPO_ROOT/scripts/settings.mjs" apply

echo "Settings applied. Restart Pi or run /reload."
