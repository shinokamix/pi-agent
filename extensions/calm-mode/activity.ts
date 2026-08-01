import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export type ActivityController = {
  start(): void;
  stop(): void;
  setEnabled(enabled: boolean): void;
  requestRender(): void;
  dispose(): void;
};

export function installActivityWidget(
  ctx: ExtensionContext,
  initialEnabled: boolean,
): ActivityController {
  let enabled = initialEnabled;
  let working = false;
  let frame = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  let requestWidgetRender: (() => void) | undefined;
  let disposed = false;

  const stopTimer = (): void => {
    if (timer) clearInterval(timer);
    timer = undefined;
  };

  const startTimer = (): void => {
    if (timer || !enabled || !working || disposed) return;
    timer = setInterval(() => {
      frame = (frame + 1) % SPINNER_FRAMES.length;
      requestWidgetRender?.();
    }, 80);
  };

  const controller: ActivityController = {
    start(): void {
      working = true;
      startTimer();
      requestWidgetRender?.();
    },
    stop(): void {
      working = false;
      stopTimer();
      requestWidgetRender?.();
    },
    setEnabled(nextEnabled: boolean): void {
      enabled = nextEnabled;
      if (enabled) startTimer();
      else stopTimer();
      requestWidgetRender?.();
    },
    requestRender(): void {
      requestWidgetRender?.();
    },
    dispose(): void {
      disposed = true;
      stopTimer();
      requestWidgetRender = undefined;
    },
  };

  ctx.ui.setWidget(
    "calm-working",
    (tui, theme) => {
      const requestRender = (): void => tui.requestRender();
      requestWidgetRender = requestRender;

      return {
        dispose(): void {
          if (requestWidgetRender === requestRender) {
            controller.dispose();
          }
        },
        invalidate() {},
        render(width: number): string[] {
          if (!enabled || !working) return [];
          const indicator = theme.fg("accent", SPINNER_FRAMES[frame]!);
          const message = theme.fg("dim", "Thinking…");
          return [truncateToWidth(`${indicator} ${message}`, width)];
        },
      };
    },
    { placement: "aboveEditor" },
  );

  return controller;
}
