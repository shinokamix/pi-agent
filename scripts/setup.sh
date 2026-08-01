#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PI_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$PI_DIR/backups/pi-agent-$TIMESTAMP"

if ! command -v pi >/dev/null 2>&1; then
  echo "pi is not installed or is not available on PATH." >&2
  exit 1
fi

mkdir -p "$PI_DIR"
node "$REPO_ROOT/scripts/settings.mjs" apply

if [[ -e "$PI_DIR/AGENTS.md" || -L "$PI_DIR/AGENTS.md" ]]; then
  mkdir -p "$BACKUP_DIR"
  cp -a "$PI_DIR/AGENTS.md" "$BACKUP_DIR/AGENTS.md"
fi
ln -sfn "$REPO_ROOT/AGENTS.md" "$PI_DIR/AGENTS.md"

for extension in calm-mode pretty-response; do
  legacy="$PI_DIR/extensions/$extension"
  if [[ -e "$legacy" && ! -L "$legacy" ]]; then
    mkdir -p "$BACKUP_DIR/extensions"
    mv "$legacy" "$BACKUP_DIR/extensions/$extension"
    echo "Moved legacy $extension extension to $BACKUP_DIR/extensions/$extension"
  fi
done

pi install "$REPO_ROOT"
pi install npm:@narumitw/pi-usage

echo
echo "Personal Pi setup installed. Restart Pi or run /reload."
if [[ -d "$BACKUP_DIR" ]]; then
  echo "Previous files were backed up to $BACKUP_DIR"
fi
