import assert from "node:assert/strict";
import test from "node:test";
import { parseModeConfig } from "./config.ts";

for (const mode of ["normal", "calm", "zen"] as const) {
  test(`reads the ${mode} mode`, () => {
    assert.equal(parseModeConfig({ mode }), mode);
  });
}

test("rejects missing and unknown modes", () => {
  assert.throws(() => parseModeConfig(undefined));
  assert.throws(() => parseModeConfig({}));
  assert.throws(() => parseModeConfig({ mode: "quiet" }));
});
