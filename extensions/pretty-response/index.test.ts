import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
import prettyResponse from "./index.ts";

const codingAgentEntry = fileURLToPath(
  import.meta.resolve("@earendil-works/pi-coding-agent"),
);
const codingAgentDist = dirname(codingAgentEntry);
const tuiEntry = createRequire(codingAgentEntry).resolve(
  "@earendil-works/pi-tui",
);

const tui = (await import(pathToFileURL(tuiEntry).href)) as {
  setCapabilities(capabilities: {
    images: null;
    trueColor: boolean;
    hyperlinks: boolean;
  }): void;
  visibleWidth(text: string): number;
};
const [assistantModule, themeModule] = (await Promise.all([
  import(
    pathToFileURL(
      join(
        codingAgentDist,
        "modes/interactive/components/assistant-message.js",
      ),
    ).href
  ),
  import(
    pathToFileURL(
      join(codingAgentDist, "modes/interactive/theme/theme.js"),
    ).href
  ),
])) as [
  {
    AssistantMessageComponent: new (message: unknown) => {
      render(width: number): string[];
    };
  },
  { initTheme(name: string): void },
];

themeModule.initTheme("dark");

test("truncates an incomplete streaming Markdown link to terminal width", async () => {
  let shutdown: (() => void) | undefined;
  await prettyResponse({
    on(event: string, handler: () => void) {
      if (event === "session_shutdown") shutdown = handler;
    },
  } as never);

  tui.setCapabilities({ images: null, trueColor: true, hyperlinks: true });

  const component = new assistantModule.AssistantMessageComponent({
    role: "assistant",
    content: [
      {
        type: "text",
        text: [
          "## Источники",
          "",
          "- [Pi SDK — sub-agent",
          "  tools](https://github.com/earendil-works/pi-mono/blob/main/packages/coding",
        ].join("\n"),
      },
    ],
    stopReason: "stop",
  });

  const width = 77;
  const lines = component.render(width);
  assert.ok(lines.some((line) => line.includes("tools]")));
  assert.ok(
    lines.every((line) => tui.visibleWidth(line) <= width),
    `rendered widths: ${lines.map((line) => tui.visibleWidth(line)).join(", ")}`,
  );

  shutdown?.();
});
