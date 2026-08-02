#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_FILE="$REPO_ROOT/forks/pi/base.json"
PATCH_FILE="$REPO_ROOT/forks/pi/transcript-presentation.patch"
VERIFY_SCRIPT="$REPO_ROOT/scripts/verify-pi-fork.sh"
FORK_DIR="${PI_FORK_DIR:-$HOME/.pi/forks/pi-display-modes}"

read_base() {
  node -e "const b=require(process.argv[1]); process.stdout.write(String(b[process.argv[2]]))" "$BASE_FILE" "$1"
}

REPOSITORY="$(read_base repository)"
TAG="$(read_base tag)"
COMMIT="$(read_base commit)"
VERSION="$(read_base version)"

if [[ ! -d "$FORK_DIR/.git" ]]; then
  mkdir -p "$(dirname "$FORK_DIR")"
  git clone --depth 1 --branch "$TAG" "$REPOSITORY" "$FORK_DIR"
fi

actual_commit="$(git -C "$FORK_DIR" rev-parse HEAD)"
if [[ "$actual_commit" != "$COMMIT" ]]; then
  echo "Refusing to patch unexpected Pi revision: $actual_commit (expected $COMMIT)." >&2
  exit 1
fi

if git -C "$FORK_DIR" apply --reverse --check "$PATCH_FILE" >/dev/null 2>&1; then
  echo "Transcript presentation patch is already applied."
else
  if [[ -n "$(git -C "$FORK_DIR" status --short)" ]]; then
    echo "Refusing to overwrite local changes in $FORK_DIR." >&2
    exit 1
  fi
  git -C "$FORK_DIR" apply --check "$PATCH_FILE"
  git -C "$FORK_DIR" apply "$PATCH_FILE"
fi

verify_fork() {
  "$VERIFY_SCRIPT" "$FORK_DIR" "$PATCH_FILE" "$COMMIT"
}

verify_fork
(
  cd "$FORK_DIR"
  npm install --ignore-scripts --no-package-lock
)
verify_fork
(
  cd "$FORK_DIR/packages/coding-agent"
  npx vitest --run test/transcript-container.test.ts
)
(
  cd "$FORK_DIR"
  npm run build
)
verify_fork

package_dir="$FORK_DIR/packages/coding-agent"
tarball="$(cd "$package_dir" && npm pack --silent | tail -n 1)"
npm install --global "$package_dir/$tarball"
rm -f "$package_dir/$tarball"

installed_version="$(pi --version)"
echo "Installed local Pi fork based on $TAG ($VERSION): $installed_version"
