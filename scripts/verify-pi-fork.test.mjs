import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "verify-pi-fork.sh");

function git(directory, ...args) {
  const result = spawnSync("git", ["-C", directory, ...args], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function verify(directory, patch, commit) {
  return spawnSync(SCRIPT, [directory, patch, commit], { encoding: "utf8" });
}

test("accepts only the pinned Pi revision with the exact patch", async () => {
  const directory = await mkdtemp(join(tmpdir(), "verify-pi-fork-"));
  const repository = join(directory, "pi");
  const patch = join(directory, "change.patch");
  try {
    git(directory, "init", "-q", repository);
    git(repository, "config", "user.name", "Pi Test");
    git(repository, "config", "user.email", "pi@example.test");
    await writeFile(join(repository, "file.txt"), "base\n");
    git(repository, "add", "file.txt");
    git(repository, "commit", "-qm", "base");
    const commit = git(repository, "rev-parse", "HEAD");

    await writeFile(join(repository, "file.txt"), "patched\n");
    await writeFile(patch, `${git(repository, "diff", "--binary", "HEAD")}\n`);
    assert.equal(verify(repository, patch, commit).status, 0);

    await writeFile(join(repository, "file.txt"), "extra tracked change\n");
    assert.notEqual(verify(repository, patch, commit).status, 0);

    await writeFile(join(repository, "file.txt"), "patched\n");
    await writeFile(join(repository, "unexpected.txt"), "extra\n");
    assert.notEqual(verify(repository, patch, commit).status, 0);
    await rm(join(repository, "unexpected.txt"));

    assert.notEqual(verify(repository, patch, "0".repeat(40)).status, 0);

    git(repository, "checkout", "--", "file.txt");
    assert.notEqual(verify(repository, patch, commit).status, 0);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
