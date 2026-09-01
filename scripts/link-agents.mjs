import { lstat, mkdir, readdir, readlink, symlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = join(packageRoot, "agents");
const agentDirectory = process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".pi", "agent");
const targetDirectory = join(agentDirectory, "agents");

await mkdir(targetDirectory, { recursive: true });

const entries = await readdir(sourceDirectory, { withFileTypes: true });
const agentFiles = entries
	.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
	.map((entry) => entry.name)
	.toSorted((left, right) => left.localeCompare(right));

for (const filename of agentFiles) {
	const source = join(sourceDirectory, filename);
	const target = join(targetDirectory, filename);
	let targetStats;

	try {
		targetStats = await lstat(target);
	} catch (error) {
		if (error.code !== "ENOENT") {
			throw error;
		}
	}

	if (targetStats) {
		if (!targetStats.isSymbolicLink() || resolve(dirname(target), await readlink(target)) !== source) {
			throw new Error(`Refusing to replace existing agent: ${target}`);
		}

		console.log(`Already linked ${filename}`);
		continue;
	}

	await symlink(relative(dirname(target), source), target);
	console.log(`Linked ${filename}`);
}
