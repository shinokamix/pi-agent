import assert from "node:assert/strict";
import test from "node:test";
import {
  appendIntermediateSeparator,
  appendUserMessageSpacing,
  isVisuallyEmpty,
  shouldRenderAssistant,
  trimVisuallyEmptyEdges,
} from "./transcript.ts";

const OSC_START = "\x1b]133;A\x07";
const OSC_END = "\x1b]133;B\x07\x1b]133;C\x07";

test("recognizes padded ANSI-only lines as visually empty", () => {
  const line = ` \x1b[38;2;128;128;128m\x1b[39m${" ".repeat(20)}`;
  assert.equal(isVisuallyEmpty(line), true);
});

test("removes empty edge rows while preserving OSC shell markers", () => {
  const result = trimVisuallyEmptyEdges([
    OSC_START,
    ` \x1b[38;2;128;128;128m\x1b[39m${" ".repeat(20)}`,
    "",
    `${OSC_END} Hello`,
  ]);

  assert.deepEqual(result, [`${OSC_START}${OSC_END} Hello`]);
});

test("preserves intentional empty rows inside visible text", () => {
  assert.deepEqual(trimVisuallyEmptyEdges(["", "first", "", "second", ""]), [
    "first",
    "",
    "second",
  ]);
});

test("adds spacing after a visible user message", () => {
  assert.deepEqual(appendUserMessageSpacing(["User message"]), [
    "User message",
    "",
  ]);
  assert.deepEqual(appendUserMessageSpacing([]), []);
});

test("adds a muted separator after intermediate assistant messages", () => {
  const intermediate = appendIntermediateSeparator(
    ["Progress"],
    {
      content: [{ type: "text", text: "Progress" }, { type: "toolCall" }],
      stopReason: "toolUse",
    },
    12,
  );

  assert.deepEqual(intermediate, [
    "Progress",
    "",
    "\x1b[2m────────────\x1b[22m",
    "",
  ]);
  assert.deepEqual(
    appendIntermediateSeparator(
      ["Final"],
      { content: [{ type: "text", text: "Final" }], stopReason: "stop" },
      12,
    ),
    ["Final"],
  );
});

test("assistant render policy supports Streaming Zen scenarios", () => {
  assert.equal(
    shouldRenderAssistant({
      content: [{ type: "thinking" }],
      stopReason: "pending",
    }),
    false,
  );
  assert.equal(
    shouldRenderAssistant({
      content: [{ type: "thinking" }, { type: "text", text: "Streaming text" }],
      stopReason: "pending",
    }),
    true,
  );
  assert.equal(
    shouldRenderAssistant({
      content: [{ type: "toolCall" }],
      stopReason: "toolUse",
    }),
    false,
  );
  assert.equal(
    shouldRenderAssistant({
      content: [{ type: "text", text: "Progress" }, { type: "toolCall" }],
      stopReason: "toolUse",
    }),
    true,
  );
  assert.equal(
    shouldRenderAssistant({ content: [], stopReason: "error" }),
    true,
  );
});
