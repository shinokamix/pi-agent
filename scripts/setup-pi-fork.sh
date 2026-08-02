#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_FILE="$REPO_ROOT/forks/pi/base.json"
PATCH_FILE="$REPO_ROOT/forks/pi/transcript-presentation.patch"
FORK_DIR="${PI_FORK_DIR:-$HOME/.pi/build/pi-display-modes}"

read_base() {
  node -e "const b=require(process.argv[1]); process.stdout.write(String(b[process.argv[2]]))" "$BASE_FILE" "$1"
}

REPOSITORY="$(read_base repository)"
TAG="$(read_base tag)"
COMMIT="$(read_base commit)"
VERSION="$(read_base version)"

if [[ -z "$FORK_DIR" || "$FORK_DIR" == "/" || "$(basename "$FORK_DIR")" != "pi-display-modes" ]]; then
  echo "Pi build directory must end with /pi-display-modes: $FORK_DIR" >&2
  exit 1
fi

rm -rf -- "$FORK_DIR"
mkdir -p "$(dirname "$FORK_DIR")"
git clone --depth 1 --branch "$TAG" "$REPOSITORY" "$FORK_DIR"

actual_commit="$(git -C "$FORK_DIR" rev-parse HEAD)"
if [[ "$actual_commit" != "$COMMIT" ]]; then
  echo "Unexpected Pi revision: $actual_commit (expected $COMMIT)." >&2
  exit 1
fi

git -C "$FORK_DIR" apply --check "$PATCH_FILE"
git -C "$FORK_DIR" apply "$PATCH_FILE"

(
  cd "$FORK_DIR"
  npm install --ignore-scripts --no-package-lock
  npm run build
)
(
  cd "$FORK_DIR/packages/coding-agent"
  npx vitest --run test/transcript-container.test.ts test/suite/regressions/5943-session-start-notify.test.ts
)

package_dir="$FORK_DIR/packages/coding-agent"
tarball="$(cd "$package_dir" && npm pack --silent | tail -n 1)"
npm install --global "$package_dir/$tarball"
rm -f "$package_dir/$tarball"

installed_version="$(pi --version)"
echo "Installed local Pi patch based on $TAG ($VERSION): $installed_version"
