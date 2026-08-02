import assert from "node:assert/strict";
import test from "node:test";
import { getDisplayProfile } from "./display.ts";
import { createTranscriptPresentation } from "./presentation.ts";

const progress = {
  kind: "assistant" as const,
  message: {
    content: [{ type: "text", text: "Progress" }, { type: "toolCall" }],
    stopReason: "toolUse",
  },
};
const final = {
  kind: "assistant" as const,
  message: {
    content: [{ type: "text", text: "Final" }],
    stopReason: "stop",
  },
};

test("Normal adds no visibility filter or answer marker", () => {
  const presentation = createTranscriptPresentation(getDisplayProfile("normal"), String);
  assert.equal(presentation.gap, 1);
  assert.equal(presentation.isVisible, undefined);
  assert.deepEqual(presentation.decorate?.(final, ["Final"], 20), ["Final"]);
});

test("Normal formats assistant lines through the public decorator", () => {
  const presentation = createTranscriptPresentation(getDisplayProfile("normal"), String);
  assert.deepEqual(presentation.decorate?.(final, ["### Heading"], 20), [
    "Heading",
  ]);
});

test("Calm shows progress and subagents but hides ordinary tools", () => {
  const presentation = createTranscriptPresentation(getDisplayProfile("calm"), String);
  assert.equal(presentation.isVisible?.(progress), true);
  assert.equal(presentation.isVisible?.({ kind: "tool", toolName: "researcher" }), true);
  assert.equal(presentation.isVisible?.({ kind: "tool", toolName: "read" }), false);
});

test("Zen hides progress and tools but keeps the final response", () => {
  const presentation = createTranscriptPresentation(getDisplayProfile("zen"), String);
  assert.equal(presentation.isVisible?.(progress), false);
  assert.equal(presentation.isVisible?.({ kind: "tool", toolName: "researcher" }), false);
  assert.equal(presentation.isVisible?.(final), true);
});

test("Calm and Zen mark final responses", () => {
  const presentation = createTranscriptPresentation(
    getDisplayProfile("calm"),
    (text) => `<muted>${text}</muted>`,
  );
  assert.deepEqual(presentation.decorate?.(final, ["Final"], 12), [
    "<muted>── answer</muted>",
    "",
    "Final",
  ]);
});
