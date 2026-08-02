import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  DEFAULT_DISPLAY_MODE,
  DISPLAY_MODE_CHANGED_EVENT,
  isDisplayMode,
  type DisplayMode,
  type DisplayModeChangedEvent,
} from "../display-modes/display.ts";
import { installFooter, type FooterController } from "./footer.ts";

export default function minimalFooter(pi: ExtensionAPI): void {
  let mode: DisplayMode = DEFAULT_DISPLAY_MODE;
  let modelId = "no-model";
  let thinkingLevel = "off";
  let footer: FooterController | undefined;

  pi.events.on(DISPLAY_MODE_CHANGED_EVENT, (data) => {
    const event = data as Partial<DisplayModeChangedEvent>;
    if (!isDisplayMode(event.mode)) return;
    mode = event.mode;
    footer?.requestRender();
  });

  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== "tui") return;

    modelId = ctx.model?.id ?? "no-model";
    thinkingLevel = ctx.thinkingLevel ?? "off";
    footer = installFooter(ctx, () => ({
      mode,
      modelId,
      thinkingLevel,
      contextPercent: ctx.getContextUsage()?.percent ?? null,
    }));
  });

  pi.on("agent_settled", () => footer?.requestRender());

  pi.on("model_select", (event) => {
    modelId = event.model.id;
    footer?.requestRender();
  });

  pi.on("thinking_level_select", (event) => {
    thinkingLevel = event.level;
    footer?.requestRender();
  });

  pi.on("session_shutdown", (_event, ctx) => {
    if (ctx.mode === "tui") ctx.ui.setFooter(undefined);
    footer = undefined;
  });
}
