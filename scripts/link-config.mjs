import { randomUUID } from "node:crypto";
import { lstat, mkdir, readdir, readlink, rename, rm, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const agentDirectory = process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".pi", "agent");
const sourceAgentDirectory = join(packageRoot, "agents");
const targetAgentDirectory = join(agentDirectory, "agents");

async function linkFile(source, target) {
	let targetStats;

	try {
		targetStats = await lstat(target);
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}

	const linkTarget = source;
	const displayTarget = relative(agentDirectory, target);

	if (!targetStats) {
		await symlink(linkTarget, target);
		console.log(`Linked ${displayTarget}`);
		return;
	}

	if (!targetStats.isSymbolicLink()) {
		throw new Error(`Refusing to replace existing config: ${target}`);
	}

	if (resolve(dirname(target), await readlink(target)) === source) {
		console.log(`Already linked ${displayTarget}`);
		return;
	}

	const temporaryTarget = `${target}.tmp-${randomUUID()}`;
	await symlink(linkTarget, temporaryTarget);

	try {
		await rename(temporaryTarget, target);
	} catch (error) {
		await rm(temporaryTarget, { force: true });
		throw error;
	}

	console.log(`Relinked ${displayTarget}`);
}

await mkdir(targetAgentDirectory, { recursive: true });

const entries = await readdir(sourceAgentDirectory, { withFileTypes: true });
const agentFiles = entries
	.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
	.map((entry) => entry.name)
	.toSorted((left, right) => left.localeCompare(right));

const links = agentFiles.map((filename) => [
	join(sourceAgentDirectory, filename),
	join(targetAgentDirectory, filename),
]);

links.push(
	[join(packageRoot, "config", "AGENTS.md"), join(agentDirectory, "AGENTS.md")],
	[join(packageRoot, "config", "subagents.json"), join(agentDirectory, "subagents.json")],
);

for (const [source, target] of links) {
	await linkFile(source, target);
}
