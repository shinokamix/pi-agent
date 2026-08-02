import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import {
  formatAssistantLine,
  formatAssistantLines,
} from "./assistant-format.ts";

test("removes raw streaming code fences", () => {
  assert.equal(formatAssistantLine("```typescript"), undefined);
  assert.equal(formatAssistantLine("  ```"), undefined);
});

test("removes small Markdown heading markers while preserving ANSI", () => {
  const line = "\x1b[1m### Heading\x1b[22m";
  assert.equal(formatAssistantLine(line), "\x1b[1mHeading\x1b[22m");
  assert.equal(formatAssistantLine("## Heading"), "## Heading");
});

test("truncates every assistant line to the transcript width", () => {
  const lines = formatAssistantLines(
    ["short", "a very long streaming Markdown link that is not complete"],
    20,
  );
  assert.ok(lines.every((line) => visibleWidth(line) <= 20));
});
