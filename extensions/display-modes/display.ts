export const DISPLAY_MODES = ["normal", "calm", "zen"] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];
export const DEFAULT_DISPLAY_MODE: DisplayMode = "calm";

export const DISPLAY_MODE_CHANGED_EVENT = "display-modes:changed";

export type DisplayModeChangedEvent = {
  mode: DisplayMode;
};

export type DisplayProfile = {
  assistantVisibility: "all" | "visible" | "final";
  toolVisibility: "all" | "none" | ReadonlySet<string>;
  markFinalAnswer?: true;
  systemInstruction?: string;
};

const DISPLAY_PROFILES: Readonly<Record<DisplayMode, DisplayProfile>> = {
  normal: {
    assistantVisibility: "all",
    toolVisibility: "all",
  },
  calm: {
    assistantVisibility: "visible",
    toolVisibility: new Set(["researcher", "subagent"]),
    markFinalAnswer: true,
    systemInstruction: "Calm display mode is active. Keep tool calls, file contents, diffs, command output, reasoning, and checks out of user-facing prose. You may stream one brief progress sentence between meaningful stages, but do not narrate individual reads, edits, commands, or checks. Show the final result when the task is complete, and surface clarifications or blocking errors when needed.",
  },
  zen: {
    assistantVisibility: "final",
    toolVisibility: "none",
    markFinalAnswer: true,
    systemInstruction: "Zen display mode is active. Do not send progress updates or narrate tool use, reasoning, checks, or intermediate work. Send only the final answer when the task is complete. Surface a clarification or blocking error only when the work cannot continue.",
  },
};

export function isDisplayMode(value: unknown): value is DisplayMode {
  return typeof value === "string" &&
    DISPLAY_MODES.includes(value as DisplayMode);
}

export function getDisplayProfile(mode: DisplayMode): DisplayProfile {
  return DISPLAY_PROFILES[mode];
}
