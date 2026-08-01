import type {
  ExtensionAPI,
  ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { installActivityWidget, type ActivityController } from "./activity.ts";
import { readEnabled, writeEnabled } from "./config.ts";
import { installFooter, type FooterController } from "./footer.ts";
import { installTranscriptPatch } from "./transcript.ts";

export default async function calmMode(pi: ExtensionAPI): Promise<void> {
  let enabled = await readEnabled();
  let modelId = "no-model";
  let thinkingLevel = "off";
  let currentContext: ExtensionContext | undefined;
  let activity: ActivityController | undefined;
  let footer: FooterController | undefined;

  const transcript = await installTranscriptPatch(enabled);

  const applyUi = (ctx: ExtensionContext): void => {
    transcript.setEnabled(enabled);
    if (ctx.mode !== "tui") return;

    ctx.ui.setStatus("calm-mode", undefined);
    ctx.ui.setWorkingVisible(!enabled);
    ctx.ui.setWorkingMessage();
    ctx.ui.setWorkingIndicator();
    ctx.ui.setHiddenThinkingLabel(enabled ? "" : undefined);
    activity?.setEnabled(enabled);
    footer?.requestRender();
  };

  pi.on("session_start", (_event, ctx) => {
    currentContext = ctx;
    modelId = ctx.model?.id ?? "no-model";
    thinkingLevel = ctx.thinkingLevel ?? "off";

    if (ctx.mode === "tui") {
      activity = installActivityWidget(ctx, enabled);
      footer = installFooter(ctx, () => ({
        enabled,
        modelId,
        thinkingLevel,
        contextPercent: currentContext?.getContextUsage()?.percent ?? null,
      }));
    }

    applyUi(ctx);
  });

  pi.on("agent_start", () => {
    activity?.start();
    footer?.requestRender();
  });

  pi.on("agent_settled", () => {
    activity?.stop();
    footer?.requestRender();
  });

  pi.on("model_select", (event) => {
    modelId = event.model.id;
    footer?.requestRender();
  });

  pi.on("thinking_level_select", (event) => {
    thinkingLevel = event.level;
    footer?.requestRender();
  });

  pi.on("before_agent_start", (event) => {
    if (!enabled) return;

    return {
      systemPrompt: `${event.systemPrompt}\n\nStreaming Zen mode is active. Keep tool calls, file contents, diffs, command output, reasoning, and checks out of user-facing text. You may stream one brief progress sentence between meaningful stages, but do not narrate individual reads, edits, commands, or checks. Show the final result when the task is complete, and surface clarifications or blocking errors when needed.`,
    };
  });

  pi.registerCommand("calm", {
    description: "Toggle calm mode, or use /calm on|off|status",
    getArgumentCompletions: (prefix) =>
      ["on", "off", "status"]
        .filter((value) => value.startsWith(prefix.trim().toLowerCase()))
        .map((value) => ({ value, label: value })),
    handler: async (args, ctx) => {
      const action = args.trim().toLowerCase();
      if (action === "status") {
        ctx.ui.notify(`Calm mode is ${enabled ? "on" : "off"}.`, "info");
        return;
      }

      if (action && action !== "on" && action !== "off") {
        ctx.ui.notify("Usage: /calm [on|off|status]", "warning");
        return;
      }

      enabled = action === "on" ? true : action === "off" ? false : !enabled;
      await writeEnabled(enabled);
      applyUi(ctx);
      ctx.ui.notify(`Calm mode ${enabled ? "enabled" : "disabled"}.`, "info");
    },
  });

  pi.on("session_shutdown", () => {
    activity?.dispose();
    footer?.dispose();
    transcript.uninstall();
    activity = undefined;
    footer = undefined;
    currentContext = undefined;
  });
}
