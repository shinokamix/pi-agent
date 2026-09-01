import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readlink, rm, symlink, writeFile } from "node:fs/promises";
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

	it("links agents and global configuration", async () => {
		await run();

		await expect(resolvedLink(join(agentDirectory, "agents", "scout.md"))).resolves.toBe(
			join(packageRoot, "agents", "scout.md"),
		);
		await expect(resolvedLink(join(agentDirectory, "AGENTS.md"))).resolves.toBe(
			join(packageRoot, "config", "AGENTS.md"),
		);
		await expect(resolvedLink(join(agentDirectory, "subagents.json"))).resolves.toBe(
			join(packageRoot, "config", "subagents.json"),
		);
	});

	it("is idempotent", async () => {
		await run();

		const { stdout } = await run();

		expect(stdout).toContain(`Already linked ${join("agents", "scout.md")}`);
		expect(stdout).toContain("Already linked AGENTS.md");
	});

	it("refuses to replace a regular file", async () => {
		const target = join(agentDirectory, "agents", "researcher.md");
		await mkdir(dirname(target), { recursive: true });
		await writeFile(target, "keep me");

		await expect(run()).rejects.toMatchObject({
			stderr: expect.stringContaining(`Refusing to replace existing config: ${target}`),
		});
		await expect(readFile(target, "utf8")).resolves.toBe("keep me");
	});

	it("updates an existing symlink", async () => {
		const target = join(agentDirectory, "agents", "researcher.md");
		const oldSource = join(agentDirectory, "old-researcher.md");
		await mkdir(dirname(target), { recursive: true });
		await writeFile(oldSource, "old");
		await symlink(oldSource, target);

		await run();

		await expect(resolvedLink(target)).resolves.toBe(join(packageRoot, "agents", "researcher.md"));
		expect(await resolvedLink(target)).not.toBe(oldSource);
	});
});
