import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PATCH_KEY = Symbol.for("pi.calm-mode.transcript-patch");
const CSI_GLOBAL = /\x1b\[[0-?]*[ -/]*[@-~]/g;
const OSC_GLOBAL = /\x1b\][^\x07]*(?:\x07|\x1b\\)/g;

type AssistantContent = {
  type: string;
  text?: string;
};

export type AssistantRenderMessage = {
  content?: AssistantContent[];
  stopReason?: string;
};

type ToolExecutionPrototype = {
  render(width: number): string[];
};

type UserMessagePrototype = {
  render(width: number): string[];
};

type AssistantMessagePrototype = {
  render(width: number): string[];
  lastMessage?: AssistantRenderMessage;
};

type PatchRecord = {
  enabled: boolean;
  owners: number;
  toolPrototype?: ToolExecutionPrototype;
  originalToolRender?: ToolExecutionPrototype["render"];
  patchedToolRender?: ToolExecutionPrototype["render"];
  userPrototype?: UserMessagePrototype;
  originalUserRender?: UserMessagePrototype["render"];
  patchedUserRender?: UserMessagePrototype["render"];
  assistantPrototype?: AssistantMessagePrototype;
  originalAssistantRender?: AssistantMessagePrototype["render"];
  patchedAssistantRender?: AssistantMessagePrototype["render"];
};

type GlobalPatchState = typeof globalThis & {
  [PATCH_KEY]?: PatchRecord;
};

export type TranscriptPatch = {
  setEnabled(enabled: boolean): void;
  uninstall(): void;
};

function stripTerminalControls(line: string): string {
  return line.replace(OSC_GLOBAL, "").replace(CSI_GLOBAL, "");
}

function extractOscControls(line: string): string {
  return line.match(OSC_GLOBAL)?.join("") ?? "";
}

export function isVisuallyEmpty(line: string): boolean {
  return stripTerminalControls(line).trim().length === 0;
}

export function appendUserMessageSpacing(lines: string[]): string[] {
  return lines.length === 0 ? lines : [...lines, ""];
}

export function trimVisuallyEmptyEdges(lines: string[]): string[] {
  let start = 0;
  let end = lines.length - 1;
  while (start <= end && isVisuallyEmpty(lines[start] ?? "")) start++;
  while (end >= start && isVisuallyEmpty(lines[end] ?? "")) end--;
  if (start > end) return [];

  const visibleLines = lines.slice(start, end + 1);
  const leadingOsc = lines.slice(0, start).map(extractOscControls).join("");
  const trailingOsc = lines
    .slice(end + 1)
    .map(extractOscControls)
    .join("");

  visibleLines[0] = leadingOsc + visibleLines[0]!;
  visibleLines[visibleLines.length - 1] =
    visibleLines[visibleLines.length - 1]! + trailingOsc;
  return visibleLines;
}

function isIntermediateAssistant(
  message: AssistantRenderMessage | undefined,
): boolean {
  return Boolean(
    message?.stopReason === "toolUse" ||
    message?.content?.some((content) => content.type === "toolCall"),
  );
}

export function appendIntermediateSeparator(
  lines: string[],
  message: AssistantRenderMessage | undefined,
  width: number,
): string[] {
  if (lines.length === 0 || width <= 0 || !isIntermediateAssistant(message)) {
    return lines;
  }

  return [...lines, "", `\x1b[2m${"─".repeat(width)}\x1b[22m`, ""];
}

export function shouldRenderAssistant(
  message: AssistantRenderMessage | undefined,
): boolean {
  if (!message) return false;

  const hasVisibleText = message.content?.some(
    (content) => content.type === "text" && Boolean(content.text?.trim()),
  );
  const shouldShowFailure =
    message.stopReason === "error" ||
    message.stopReason === "aborted" ||
    message.stopReason === "length";

  return Boolean(hasVisibleText || shouldShowFailure);
}

async function loadPrototype<T>(
  fileName: string,
  exportName: string,
): Promise<T | undefined> {
  try {
    const codingAgentEntry = fileURLToPath(
      import.meta.resolve("@earendil-works/pi-coding-agent"),
    );
    const moduleUrl = pathToFileURL(
      join(dirname(codingAgentEntry), "modes/interactive/components", fileName),
    ).href;
    const module = (await import(moduleUrl)) as Record<
      string,
      { prototype?: T } | undefined
    >;
    const prototype = module[exportName]?.prototype;
    if (!prototype) {
      console.warn(
        `[calm-mode] ${exportName} has changed; transcript hiding is disabled for this component.`,
      );
    }
    return prototype;
  } catch (error) {
    console.warn(
      `[calm-mode] ${exportName} is unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
    return undefined;
  }
}

function createHandle(record: PatchRecord): TranscriptPatch {
  let installed = true;

  return {
    setEnabled(enabled: boolean): void {
      record.enabled = enabled;
    },
    uninstall(): void {
      if (!installed) return;
      installed = false;
      record.owners--;
      if (record.owners > 0) return;

      if (
        record.toolPrototype &&
        record.originalToolRender &&
        record.toolPrototype.render === record.patchedToolRender
      ) {
        record.toolPrototype.render = record.originalToolRender;
      }
      if (
        record.userPrototype &&
        record.originalUserRender &&
        record.userPrototype.render === record.patchedUserRender
      ) {
        record.userPrototype.render = record.originalUserRender;
      }
      if (
        record.assistantPrototype &&
        record.originalAssistantRender &&
        record.assistantPrototype.render === record.patchedAssistantRender
      ) {
        record.assistantPrototype.render = record.originalAssistantRender;
      }

      const state = globalThis as GlobalPatchState;
      if (state[PATCH_KEY] === record) delete state[PATCH_KEY];
    },
  };
}

export async function installTranscriptPatch(
  enabled: boolean,
): Promise<TranscriptPatch> {
  const state = globalThis as GlobalPatchState;
  const existing = state[PATCH_KEY];
  if (existing) {
    existing.enabled = enabled;
    existing.owners++;
    return createHandle(existing);
  }

  const [toolPrototype, userPrototype, assistantPrototype] = await Promise.all([
    loadPrototype<ToolExecutionPrototype>(
      "tool-execution.js",
      "ToolExecutionComponent",
    ),
    loadPrototype<UserMessagePrototype>(
      "user-message.js",
      "UserMessageComponent",
    ),
    loadPrototype<AssistantMessagePrototype>(
      "assistant-message.js",
      "AssistantMessageComponent",
    ),
  ]);

  const record: PatchRecord = { enabled, owners: 1 };

  if (toolPrototype) {
    const originalToolRender = toolPrototype.render;
    const patchedToolRender: ToolExecutionPrototype["render"] = function (
      this: ToolExecutionPrototype,
      width,
    ) {
      return record.enabled ? [] : originalToolRender.call(this, width);
    };
    record.toolPrototype = toolPrototype;
    record.originalToolRender = originalToolRender;
    record.patchedToolRender = patchedToolRender;
    toolPrototype.render = patchedToolRender;
  }

  if (userPrototype) {
    const originalUserRender = userPrototype.render;
    const patchedUserRender: UserMessagePrototype["render"] = function (
      this: UserMessagePrototype,
      width,
    ) {
      const lines = originalUserRender.call(this, width);
      return record.enabled ? appendUserMessageSpacing(lines) : lines;
    };
    record.userPrototype = userPrototype;
    record.originalUserRender = originalUserRender;
    record.patchedUserRender = patchedUserRender;
    userPrototype.render = patchedUserRender;
  }

  if (assistantPrototype) {
    const originalAssistantRender = assistantPrototype.render;
    const patchedAssistantRender: AssistantMessagePrototype["render"] =
      function (this: AssistantMessagePrototype, width) {
        if (!record.enabled) return originalAssistantRender.call(this, width);
        if (!shouldRenderAssistant(this.lastMessage)) return [];
        return appendIntermediateSeparator(
          trimVisuallyEmptyEdges(originalAssistantRender.call(this, width)),
          this.lastMessage,
          width,
        );
      };
    record.assistantPrototype = assistantPrototype;
    record.originalAssistantRender = originalAssistantRender;
    record.patchedAssistantRender = patchedAssistantRender;
    assistantPrototype.render = patchedAssistantRender;
  }

  state[PATCH_KEY] = record;
  return createHandle(record);
}
