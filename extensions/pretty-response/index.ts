import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
  Markdown,
  truncateToWidth,
  type Component,
} from "@earendil-works/pi-tui";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PATCH_KEY = Symbol.for("pi.pretty-response.patch");
const markedMarkdown = new WeakSet<object>();

const CSI = /^\x1b\[[0-?]*[ -/]*[@-~]/;
const OSC = /^\x1b\][^\x07]*(?:\x07|\x1b\\)/;
const ANSI_GLOBAL = /\x1b\[[0-?]*[ -/]*[@-~]|\x1b\][^\x07]*(?:\x07|\x1b\\)/g;

type AssistantInstance = Component & {
  contentContainer?: {
    addChild(component: Component): void;
  };
};

type AssistantPrototype = {
  updateContent(this: AssistantInstance, message: unknown): void;
};

type MarkdownRender = (this: Markdown, width: number) => string[];
type AssistantUpdate = AssistantPrototype["updateContent"];

type PatchRecord = {
  markdownRender: MarkdownRender;
  patchedMarkdownRender: MarkdownRender;
  assistantPrototype?: AssistantPrototype;
  assistantUpdate?: AssistantUpdate;
  patchedAssistantUpdate?: AssistantUpdate;
};

type GlobalPatchState = typeof globalThis & {
  [PATCH_KEY]?: PatchRecord;
};

function stripAnsi(text: string): string {
  return text.replace(ANSI_GLOBAL, "");
}

function removeVisibleRange(
  text: string,
  start: number,
  length: number,
): string {
  const end = start + length;
  let visibleIndex = 0;
  let result = "";

  for (let index = 0; index < text.length; ) {
    const rest = text.slice(index);
    const escape = rest.match(CSI)?.[0] ?? rest.match(OSC)?.[0];
    if (escape) {
      result += escape;
      index += escape.length;
      continue;
    }

    const codePoint = text.codePointAt(index);
    if (codePoint === undefined) break;
    const character = String.fromCodePoint(codePoint);
    if (visibleIndex < start || visibleIndex >= end) result += character;
    visibleIndex += 1;
    index += character.length;
  }

  return result;
}

function formatAssistantLine(
  line: string,
  paddingX: number,
): string | undefined {
  const plain = stripAnsi(line);
  const trimmed = plain.trim();
  const leadingSpaces = plain.length - plain.trimStart().length;

  if (leadingSpaces === paddingX && /^`{3,}[^`]*$/.test(trimmed))
    return undefined;

  const heading = /^(#{3,6})\s+/.exec(plain.trimStart());
  if (!heading) return line;

  return removeVisibleRange(line, leadingSpaces, heading[0].length);
}

async function loadAssistantPrototype(): Promise<
  AssistantPrototype | undefined
> {
  try {
    const codingAgentEntry = fileURLToPath(
      import.meta.resolve("@earendil-works/pi-coding-agent"),
    );
    const moduleUrl = pathToFileURL(
      join(
        dirname(codingAgentEntry),
        "modes/interactive/components/assistant-message.js",
      ),
    ).href;
    const module = (await import(moduleUrl)) as {
      AssistantMessageComponent?: { prototype?: AssistantPrototype };
    };
    const prototype = module.AssistantMessageComponent?.prototype;
    return typeof prototype?.updateContent === "function"
      ? prototype
      : undefined;
  } catch (error) {
    console.warn(
      `[pretty-response] Assistant renderer is unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
    return undefined;
  }
}

async function installPatch(): Promise<void> {
  const state = globalThis as GlobalPatchState;
  if (state[PATCH_KEY]) return;

  const markdownPrototype = Markdown.prototype as typeof Markdown.prototype & {
    render: MarkdownRender;
  };
  const markdownRender = markdownPrototype.render;
  const patchedMarkdownRender: MarkdownRender = function (width) {
    const lines = markdownRender.call(this, width);
    const paddingX = (this as unknown as { paddingX?: number }).paddingX ?? 0;
    const formattedLines = markedMarkdown.has(this)
      ? lines.flatMap((line) => {
          const formatted = formatAssistantLine(line, paddingX);
          return formatted === undefined ? [] : [formatted];
        })
      : lines;

    return formattedLines.map((line) =>
      truncateToWidth(line, Math.max(0, width), ""),
    );
  };
  markdownPrototype.render = patchedMarkdownRender;

  const record: PatchRecord = { markdownRender, patchedMarkdownRender };
  state[PATCH_KEY] = record;

  const assistantPrototype = await loadAssistantPrototype();
  if (!assistantPrototype) return;

  const assistantUpdate = assistantPrototype.updateContent;
  const patchedAssistantUpdate: AssistantUpdate = function (message) {
    const container = this.contentContainer;
    const addChild = container?.addChild;

    if (container && addChild) {
      container.addChild = function (component: Component): void {
        if (component instanceof Markdown) markedMarkdown.add(component);
        addChild.call(this, component);
      };
    }

    try {
      assistantUpdate.call(this, message);
    } finally {
      if (container && addChild) container.addChild = addChild;
    }
  };

  assistantPrototype.updateContent = patchedAssistantUpdate;
  record.assistantPrototype = assistantPrototype;
  record.assistantUpdate = assistantUpdate;
  record.patchedAssistantUpdate = patchedAssistantUpdate;
}

function uninstallPatch(): void {
  const state = globalThis as GlobalPatchState;
  const record = state[PATCH_KEY];
  if (!record) return;

  const markdownPrototype = Markdown.prototype as typeof Markdown.prototype & {
    render: MarkdownRender;
  };
  if (markdownPrototype.render === record.patchedMarkdownRender) {
    markdownPrototype.render = record.markdownRender;
  }

  if (
    record.assistantPrototype &&
    record.assistantUpdate &&
    record.assistantPrototype.updateContent === record.patchedAssistantUpdate
  ) {
    record.assistantPrototype.updateContent = record.assistantUpdate;
  }

  delete state[PATCH_KEY];
}

export default async function prettyResponse(pi: ExtensionAPI): Promise<void> {
  await installPatch();
  pi.on("session_shutdown", uninstallPatch);
}
