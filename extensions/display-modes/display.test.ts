import assert from "node:assert/strict";
import test from "node:test";
import {
  DISPLAY_MODES,
  getDisplayProfile,
  isDisplayMode,
} from "./display.ts";

test("Normal shows every assistant message and tool", () => {
  const profile = getDisplayProfile("normal");
  assert.equal(profile.assistantVisibility, "all");
  assert.equal(profile.toolVisibility, "all");
  assert.equal(profile.markFinalAnswer, undefined);
});

test("Calm shows visible assistant messages and subagents", () => {
  const profile = getDisplayProfile("calm");
  assert.equal(profile.assistantVisibility, "visible");
  assert.notEqual(profile.toolVisibility, "all");
  assert.notEqual(profile.toolVisibility, "none");
  if (typeof profile.toolVisibility !== "string") {
    assert.equal(profile.toolVisibility.has("researcher"), true);
    assert.equal(profile.toolVisibility.has("subagent"), true);
    assert.equal(profile.toolVisibility.has("bash"), false);
  }
});

test("Zen shows only the final assistant message", () => {
  const profile = getDisplayProfile("zen");
  assert.equal(profile.assistantVisibility, "final");
  assert.equal(profile.toolVisibility, "none");
});

test("recognizes supported display modes", () => {
  for (const mode of DISPLAY_MODES) {
    assert.equal(isDisplayMode(mode), true);
  }
  assert.equal(isDisplayMode("quiet"), false);
});
