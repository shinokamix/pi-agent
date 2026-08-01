import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

export type FooterState = {
  enabled: boolean;
  modelId: string;
  thinkingLevel: string;
  contextPercent: number | null;
};

export type FooterController = {
  requestRender(): void;
  dispose(): void;
};

function fitDetails(
  model: string,
  effort: string,
  context: string,
  separator: string,
  maxWidth: number,
): string {
  if (maxWidth <= 0) return "";

  const details = [model, effort, context].join(separator);
  if (visibleWidth(details) <= maxWidth) return details;

  const tail = [effort, context].join(separator);
  const separatorWidth = visibleWidth(separator);
  if (visibleWidth(tail) <= maxWidth) {
    const modelWidth = maxWidth - visibleWidth(tail) - separatorWidth;
    return modelWidth > 0
      ? `${truncateToWidth(model, modelWidth, "")}${separator}${tail}`
      : tail;
  }

  return truncateToWidth(context, maxWidth, "");
}

export function installFooter(
  ctx: ExtensionContext,
  getState: () => FooterState,
): FooterController {
  let requestFooterRender: (() => void) | undefined;

  const controller: FooterController = {
    requestRender(): void {
      requestFooterRender?.();
    },
    dispose(): void {
      requestFooterRender = undefined;
    },
  };

  ctx.ui.setFooter((tui, theme) => {
    const requestRender = (): void => tui.requestRender();
    requestFooterRender = requestRender;

    return {
      dispose(): void {
        if (requestFooterRender === requestRender) controller.dispose();
      },
      invalidate() {},
      render(width: number): string[] {
        const state = getState();
        const separator = theme.fg("dim", " │ ");
        const contextValue =
          state.contextPercent == null
            ? "?%"
            : `${Math.round(Math.max(0, Math.min(100, state.contextPercent)))}%`;
        const contextColor =
          state.contextPercent != null && state.contextPercent >= 90
            ? "error"
            : state.contextPercent != null && state.contextPercent >= 75
              ? "warning"
              : "success";

        const model = theme.fg("text", state.modelId);
        const effort = theme.fg("dim", state.thinkingLevel);
        const context = theme.fg(contextColor, contextValue);
        const mode = theme.fg(
          state.enabled ? "accent" : "muted",
          state.enabled ? "calm" : "normal",
        );
        const right = mode;
        const rightWidth = visibleWidth(right);
        if (rightWidth >= width) {
          return [truncateToWidth(right, width, "")];
        }

        const leftWidth = width - rightWidth - 1;
        const left = fitDetails(model, effort, context, separator, leftWidth);
        const gap = " ".repeat(
          Math.max(1, width - visibleWidth(left) - rightWidth),
        );
        return [truncateToWidth(`${left}${gap}${right}`, width, "")];
      },
    };
  });

  return controller;
}
