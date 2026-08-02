import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { DisplayProfile } from "./display.ts";
import { formatAssistantLines } from "./assistant-format.ts";

export type AssistantRenderMessage = {
  content?: Array<{ type: string; text?: string }>;
  stopReason?: string;
};

export type TranscriptBlock =
  | { kind: "user" }
  | { kind: "assistant"; message?: AssistantRenderMessage }
  | { kind: "tool"; toolName: string };

export type TranscriptPresentation = {
  gap?: number;
  isVisible?(block: TranscriptBlock): boolean;
  decorate?(block: TranscriptBlock, lines: string[], width: number): string[];
};

type NativeTranscriptUi = ExtensionContext["ui"] & {
  setTranscriptPresentation(presentation?: TranscriptPresentation): void;
};

export function supportsTranscriptPresentation(
  ctx: ExtensionContext,
): ctx is ExtensionContext & { ui: NativeTranscriptUi } {
  return typeof (ctx.ui as NativeTranscriptUi).setTranscriptPresentation === "function";
}

function isFinalResponse(message: AssistantRenderMessage | undefined): boolean {
  const hasText = message?.content?.some(
    (content) => content.type === "text" && Boolean(content.text?.trim()),
  );
  return Boolean(
    hasText &&
      message?.stopReason !== "toolUse" &&
      message?.stopReason !== "pending" &&
      message?.stopReason !== "error" &&
      message?.stopReason !== "aborted",
  );
}

function isFailure(message: AssistantRenderMessage | undefined): boolean {
  return message?.stopReason === "error" ||
    message?.stopReason === "aborted" ||
    message?.stopReason === "length";
}

function hasVisibleText(message: AssistantRenderMessage | undefined): boolean {
  return Boolean(
    message?.content?.some(
      (content) => content.type === "text" && Boolean(content.text?.trim()),
    ),
  );
}

function isToolVisible(profile: DisplayProfile, toolName: string): boolean {
  if (profile.toolVisibility === "all") return true;
  if (profile.toolVisibility === "none") return false;
  return profile.toolVisibility.has(toolName);
}

function answerMarker(width: number, style: (text: string) => string): string {
  const label = width < 3
    ? "─".repeat(Math.max(0, width))
    : `── ${"answer".slice(0, Math.max(0, width - 3))}`;
  return style(label);
}

export function createTranscriptPresentation(
  profile: DisplayProfile,
  styleAnswerMarker: (text: string) => string,
): TranscriptPresentation {
  const presentation: TranscriptPresentation = {
    gap: 1,
    decorate(block, lines, width): string[] {
      if (block.kind !== "assistant") return lines;

      const formattedLines = formatAssistantLines(lines, width);
      if (
        !profile.markFinalAnswer ||
        !isFinalResponse(block.message) ||
        formattedLines.length === 0
      ) {
        return formattedLines;
      }
      return [
        answerMarker(width, styleAnswerMarker),
        "",
        ...formattedLines,
      ];
    },
  };

  if (
    profile.assistantVisibility === "all" &&
    profile.toolVisibility === "all"
  ) {
    return presentation;
  }

  presentation.isVisible = (block): boolean => {
    if (block.kind === "user") return true;
    if (block.kind === "tool") return isToolVisible(profile, block.toolName);
    if (profile.assistantVisibility === "final") {
      return isFinalResponse(block.message) || isFailure(block.message);
    }
    return hasVisibleText(block.message) || isFailure(block.message);
  };
  return presentation;
}
