import { watch, type FSWatcher } from "node:fs";
import { dirname, join } from "node:path";
import {
	getClaudeUserDir,
	getProjectClaudeDir,
	getProjectMcpPath,
	getProjectRootInstructionsPath,
	getUserMcpPath,
} from "../utils/index.js";

export type WatchCallback = (event: string, fullPath: string) => void;

export interface FileWatcher {
	close: () => void;
}

export function createFileWatcher(projectPath: string, callback: WatchCallback): FileWatcher {
	const watchers: FSWatcher[] = [];
	const watchedDirs = new Set<string>();

	const dirsToWatch = [
		getClaudeUserDir(),
		getProjectClaudeDir(projectPath),
		dirname(getUserMcpPath()),
		dirname(getProjectMcpPath(projectPath)),
		dirname(getProjectRootInstructionsPath(projectPath)),
	];

	for (const dir of dirsToWatch) {
		if (watchedDirs.has(dir)) continue;
		watchedDirs.add(dir);

		try {
			const watcher = watch(dir, { persistent: false }, (event, filename) => {
				if (isRelevantFile(filename)) {
					const fullPath = join(dir, filename as string);
					callback(event, fullPath);
				}
			});
			watchers.push(watcher);
		} catch {
			// Dir doesn't exist, skip
		}
	}

	return {
		close: () => {
			for (const w of watchers) {
				w.close();
			}
		},
	};
}

function isRelevantFile(filename: string | null): boolean {
	if (!filename) return false;
	const lower = filename.toLowerCase();
	return (
		lower.endsWith(".json") ||
		lower === "claude.md" ||
		lower.endsWith("settings.json") ||
		lower.endsWith("settings.local.json") ||
		lower === ".claude.json" ||
		lower === ".mcp.json" ||
		lower === "installed_plugins.json"
	);
}
