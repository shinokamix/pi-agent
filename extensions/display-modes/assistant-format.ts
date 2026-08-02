import { truncateToWidth } from "@earendil-works/pi-tui";

const CSI = /^\x1b\[[0-?]*[ -/]*[@-~]/;
const OSC = /^\x1b\][^\x07]*(?:\x07|\x1b\\)/;
const ANSI_GLOBAL = /\x1b\[[0-?]*[ -/]*[@-~]|\x1b\][^\x07]*(?:\x07|\x1b\\)/g;

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

  for (let index = 0; index < text.length;) {
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
    visibleIndex++;
    index += character.length;
  }

  return result;
}

export function formatAssistantLine(line: string): string | undefined {
  const plain = stripAnsi(line);
  const trimmed = plain.trim();
  const leadingSpaces = plain.length - plain.trimStart().length;

  if (/^`{3,}[^`]*$/.test(trimmed)) return undefined;

  const heading = /^(#{3,6})\s+/.exec(plain.trimStart());
  if (!heading) return line;
  return removeVisibleRange(line, leadingSpaces, heading[0].length);
}

export function formatAssistantLines(
  lines: string[],
  width: number,
): string[] {
  return lines
    .flatMap((line) => {
      const formatted = formatAssistantLine(line);
      return formatted === undefined ? [] : [formatted];
    })
    .map((line) => truncateToWidth(line, Math.max(0, width), ""));
}
