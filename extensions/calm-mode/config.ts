import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const CONFIG_PATH = join(dirname(import.meta.filename), "config.json");
const LEGACY_CONFIG_PATH = join(
  dirname(dirname(import.meta.filename)),
  "calm-mode.json",
);

type CalmConfig = {
  enabled?: unknown;
};

async function readConfig(path: string): Promise<CalmConfig | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as CalmConfig;
  } catch {
    return undefined;
  }
}

export async function readEnabled(): Promise<boolean> {
  const config =
    (await readConfig(CONFIG_PATH)) ?? (await readConfig(LEGACY_CONFIG_PATH));
  return config?.enabled !== false;
}

export async function writeEnabled(enabled: boolean): Promise<void> {
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(
    CONFIG_PATH,
    `${JSON.stringify({ enabled }, null, 2)}\n`,
    "utf8",
  );
}
