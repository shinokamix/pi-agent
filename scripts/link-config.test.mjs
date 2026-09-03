import { execFile } from "node:child_process";
import { mkdtemp, readFile, readlink, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const script = join(import.meta.dirname, "link-config.mjs");
const packageRoot = resolve(import.meta.dirname, "..");

async function resolvedLink(path) {
	return resolve(dirname(path), await readlink(path));
}

describe("link-config", () => {
	let agentDirectory;

	beforeEach(async () => {
		agentDirectory = await mkdtemp(join(tmpdir(), "pi-link-config-"));
	});

	afterEach(async () => {
		await rm(agentDirectory, { recursive: true, force: true });
	});

	async function run() {
		return execFileAsync(process.execPath, [script], {
			env: { ...process.env, PI_CODING_AGENT_DIR: agentDirectory },
		});
	}

	it("links global instructions and disables builtin subagents", async () => {
		await writeFile(
			join(agentDirectory, "settings.json"),
			'\u{FEFF}{"theme":"dark","subagents":{"modelScope":"all"}}\n',
		);
		await run();

		await expect(resolvedLink(join(agentDirectory, "AGENTS.md"))).resolves.toBe(
			join(packageRoot, "config", "AGENTS.md"),
		);
		expect(JSON.parse(await readFile(join(agentDirectory, "settings.json"), "utf8"))).toEqual({
			theme: "dark",
			subagents: { modelScope: "all", disableBuiltins: true },
		});
	});

	it("is idempotent", async () => {
		await run();

		const { stdout } = await run();

		expect(stdout).toContain("Already linked AGENTS.md");
		expect(stdout).toContain("Builtin subagents already disabled in settings.json");
	});

	it("refuses to replace a regular file", async () => {
		const target = join(agentDirectory, "AGENTS.md");
		await writeFile(target, "keep me");

		await expect(run()).rejects.toMatchObject({
			stderr: expect.stringContaining(`Refusing to replace existing config: ${target}`),
		});
		await expect(readFile(target, "utf8")).resolves.toBe("keep me");
	});

	it("refuses to replace an unrelated symlink", async () => {
		const target = join(agentDirectory, "AGENTS.md");
		const source = join(agentDirectory, "other-AGENTS.md");
		await writeFile(source, "keep me");
		await symlink(source, target);

		await expect(run()).rejects.toMatchObject({
			stderr: expect.stringContaining(`Refusing to replace existing config: ${target}`),
		});
		await expect(resolvedLink(target)).resolves.toBe(source);
	});
});
