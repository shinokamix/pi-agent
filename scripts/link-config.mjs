import { randomUUID } from "node:crypto";
import { lstat, mkdir, readdir, readlink, rename, rm, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const agentDirectory = process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".pi", "agent");

async function linkFile(source, target) {
	try {
		await symlink(source, target);
		console.log(`Linked ${relative(agentDirectory, target)}`);
		return;
	} catch (error) {
		if (error.code !== "EEXIST") {
			throw error;
		}
	}

	const stats = await lstat(target);
	if (!stats.isSymbolicLink()) {
		throw new Error(`Refusing to replace existing config: ${target}`);
	}

	if (resolve(dirname(target), await readlink(target)) === source) {
		console.log(`Already linked ${relative(agentDirectory, target)}`);
		return;
	}

	const temporaryTarget = `${target}.tmp-${randomUUID()}`;
	await symlink(source, temporaryTarget);

	try {
		await rename(temporaryTarget, target);
	} catch (error) {
		await rm(temporaryTarget, { force: true });
		throw error;
	}

	console.log(`Relinked ${relative(agentDirectory, target)}`);
}

const sourceAgentDirectory = join(packageRoot, "agents");
const targetAgentDirectory = join(agentDirectory, "agents");
await mkdir(targetAgentDirectory, { recursive: true });

const agentFiles = (await readdir(sourceAgentDirectory, { withFileTypes: true }))
	.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
	.map((entry) => entry.name);

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
