import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { readMode, writeMode } from "./config.ts";
import {
  DISPLAY_MODES,
  getDisplayProfile,
  isDisplayMode,
} from "./display.ts";
import {
  createTranscriptPresentation,
  supportsTranscriptPresentation,
} from "./presentation.ts";

export default async function displayModes(pi: ExtensionAPI): Promise<void> {
  let mode = await readMode();

  const applyUi = (ctx: ExtensionContext): void => {
    if (ctx.mode !== "tui") return;

    ctx.ui.setStatus("display-mode", ctx.ui.theme.fg("accent", mode));
    ctx.ui.setHiddenThinkingLabel(mode === "normal" ? undefined : "");

    if (supportsTranscriptPresentation(ctx)) {
      const marker = (text: string): string => ctx.ui.theme.fg("muted", text);
      ctx.ui.setTranscriptPresentation(
        createTranscriptPresentation(getDisplayProfile(mode), marker),
      );
    }
  };

  pi.on("session_start", (_event, ctx) => {
    applyUi(ctx);

    if (ctx.mode === "tui" && !supportsTranscriptPresentation(ctx)) {
      ctx.ui.notify(
        "Display Modes requires the local Pi fork. Run scripts/setup-pi-fork.sh.",
        "error",
      );
    }
  });

  pi.on("before_agent_start", (event) => {
    const instruction = getDisplayProfile(mode).systemInstruction;
    if (instruction) {
      return { systemPrompt: `${event.systemPrompt}\n\n${instruction}` };
    }
  });

  pi.registerCommand("mode", {
    description: "Set the display mode: normal, calm, or zen",
    getArgumentCompletions: (prefix) =>
      DISPLAY_MODES
        .filter((value) => value.startsWith(prefix.trim().toLowerCase()))
        .map((value) => ({ value, label: value })),
    handler: async (args, ctx) => {
      const nextMode = args.trim().toLowerCase();
      if (!isDisplayMode(nextMode)) {
        ctx.ui.notify(`Display mode: ${mode}. Use /mode normal|calm|zen.`, "info");
        return;
      }

      await writeMode(nextMode);
      mode = nextMode;
      applyUi(ctx);
      ctx.ui.notify(`Display mode: ${mode}.`, "info");
    },
  });

  pi.on("session_shutdown", (_event, ctx) => {
    if (ctx.mode === "tui") {
      ctx.ui.setStatus("display-mode", undefined);
      if (supportsTranscriptPresentation(ctx)) {
        ctx.ui.setTranscriptPresentation();
      }
      ctx.ui.setHiddenThinkingLabel();
    }
  });
}
