import { lstat, mkdir, readFile, readlink, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import lockfile from "proper-lockfile";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const configuredAgentDirectory = process.env.PI_CODING_AGENT_DIR;
const agentDirectory = configuredAgentDirectory
	? resolve(configuredAgentDirectory.replace(/^~(?=$|[\\/])/, homedir()))
	: join(homedir(), ".pi", "agent");

async function linkFile(source, target) {
	await mkdir(dirname(target), { recursive: true });

	try {
		const stats = await lstat(target);
		if (stats.isSymbolicLink() && resolve(dirname(target), await readlink(target)) === source) {
			console.log(`Already linked ${relative(agentDirectory, target)}`);
			return;
		}
		throw new Error(`Refusing to replace existing config: ${target}`);
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}

	await symlink(source, target);
	console.log(`Linked ${relative(agentDirectory, target)}`);
}

async function disableBuiltinSubagents() {
	const settingsPath = join(agentDirectory, "settings.json");
	await mkdir(dirname(settingsPath), { recursive: true });

	const release = await lockfile.lock(settingsPath, {
		realpath: false,
		retries: { retries: 10, minTimeout: 20, maxTimeout: 100 },
	});

	try {
		let settings = {};

		try {
			const contents = await readFile(settingsPath, "utf8");
			settings = JSON.parse(contents.replace(/^\u{FEFF}/u, ""));
		} catch (error) {
			if (error.code !== "ENOENT") {
				throw new Error(`Could not read Pi settings: ${settingsPath}`, { cause: error });
			}
		}

		if (settings === null || typeof settings !== "object" || Array.isArray(settings)) {
			throw new Error(`Pi settings must contain a JSON object: ${settingsPath}`);
		}
		if (
			settings.subagents !== undefined &&
			(settings.subagents === null || typeof settings.subagents !== "object" || Array.isArray(settings.subagents))
		) {
			throw new Error(`Pi subagent settings must contain a JSON object: ${settingsPath}`);
		}
		if (settings.subagents?.disableBuiltins === true) {
			console.log("Builtin subagents already disabled in settings.json");
			return;
		}

		settings.subagents = { ...settings.subagents, disableBuiltins: true };
		await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
		console.log("Disabled builtin subagents in settings.json");
	} finally {
		await release();
	}
}

await linkFile(join(packageRoot, "config", "AGENTS.md"), join(agentDirectory, "AGENTS.md"));
await disableBuiltinSubagents();
