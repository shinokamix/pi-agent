#!/usr/bin/env node

import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ACTION = process.argv[2];
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TRACKED_PATH = join(REPO_ROOT, "config", "settings.json");
const PI_DIR = process.env.PI_CODING_AGENT_DIR
  ? resolve(process.env.PI_CODING_AGENT_DIR)
  : join(homedir(), ".pi", "agent");
const LIVE_PATH = join(PI_DIR, "settings.json");
const ALLOWED_KEYS = [
  "theme",
  "quietStartup",
  "hideThinkingBlock",
  "defaultProvider",
  "defaultModel",
  "defaultThinkingLevel",
  "externalEditor",
  "collapseChangelog",
  "defaultProjectTrust",
  "doubleEscapeAction",
  "treeFilterMode",
  "editorPaddingX",
  "outputPad",
  "autocompleteMaxVisible",
  "showHardwareCursor",
  "enableInstallTelemetry",
  "compaction",
  "branchSummary",
  "retry",
  "steeringMode",
  "followUpMode",
  "transport",
  "httpIdleTimeoutMs",
  "websocketConnectTimeoutMs",
  "terminal",
  "images",
  "enabledModels",
  "markdown"
];

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

function deepMerge(base, override) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const previous = result[key];
    result[key] =
      value && typeof value === "object" && !Array.isArray(value) &&
      previous && typeof previous === "object" && !Array.isArray(previous)
        ? deepMerge(previous, value)
        : value;
  }
  return result;
}

async function writeJsonAtomic(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp-${process.pid}`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, path);
}

async function apply() {
  const desired = await readJson(TRACKED_PATH, {});
  const current = await readJson(LIVE_PATH, {});
  if (Object.keys(current).length > 0) {
    const backupPath = `${LIVE_PATH}.bak-${new Date().toISOString().replaceAll(":", "-")}`;
    await copyFile(LIVE_PATH, backupPath);
    console.log(`Backed up settings to ${backupPath}`);
  }
  await writeJsonAtomic(LIVE_PATH, deepMerge(current, desired));
  console.log(`Applied ${TRACKED_PATH} to ${LIVE_PATH}`);
}

async function capture() {
  const current = await readJson(LIVE_PATH, undefined);
  if (!current) throw new Error(`Pi settings not found: ${LIVE_PATH}`);

  const captured = {};
  for (const key of ALLOWED_KEYS) {
    if (Object.hasOwn(current, key)) captured[key] = current[key];
  }
  await writeJsonAtomic(TRACKED_PATH, captured);
  console.log(`Captured portable settings to ${TRACKED_PATH}`);
}

if (ACTION === "apply") await apply();
else if (ACTION === "capture") await capture();
else {
  console.error("Usage: settings.mjs <apply|capture>");
  process.exitCode = 2;
}
