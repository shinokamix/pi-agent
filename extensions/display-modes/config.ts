import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  DEFAULT_DISPLAY_MODE,
  isDisplayMode,
  type DisplayMode,
} from "./display.ts";

const PI_DIR = process.env.PI_CODING_AGENT_DIR
  ? resolve(process.env.PI_CODING_AGENT_DIR)
  : join(homedir(), ".pi", "agent");
const CONFIG_PATH = join(PI_DIR, "display-mode.json");

export function parseModeConfig(value: unknown): DisplayMode {
  if (
    typeof value !== "object" ||
    value === null ||
    !("mode" in value) ||
    !isDisplayMode(value.mode)
  ) {
    throw new Error(`Invalid display mode config: ${CONFIG_PATH}`);
  }
  return value.mode;
}

export async function readMode(): Promise<DisplayMode> {
  try {
    return parseModeConfig(JSON.parse(await readFile(CONFIG_PATH, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return DEFAULT_DISPLAY_MODE;
    }
    throw error;
  }
}

export async function writeMode(mode: DisplayMode): Promise<void> {
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, `${JSON.stringify({ mode }, null, 2)}\n`, "utf8");
}
