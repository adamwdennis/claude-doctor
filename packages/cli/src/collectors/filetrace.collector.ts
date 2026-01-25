import { statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
	type FileTraceCollection,
	type FileTraceLevel,
	FileTraceType,
} from "../models/filetrace.model.js";
import { dirExists, fileExists } from "../utils/index.js";

function getFileSize(path: string): number | undefined {
	try {
		return statSync(path).size;
	} catch {
		return undefined;
	}
}

function checkFile(level: FileTraceLevel, path: string, type: FileTraceType): void {
	const exists = fileExists(path);
	level.files.push({
		path,
		type,
		exists,
		size: exists ? getFileSize(path) : undefined,
	});
}

function checkDir(level: FileTraceLevel, path: string, type: FileTraceType): void {
	const exists = dirExists(path);
	level.files.push({
		path,
		type,
		exists,
	});
}

export function collectFileTrace(projectPath: string): FileTraceCollection {
	const levels: FileTraceLevel[] = [];
	let current = resolve(projectPath);
	const home = homedir();

	while (current.startsWith(home) || current === home) {
		const level: FileTraceLevel = {
			directory: current,
			isProjectRoot: current === resolve(projectPath),
			isUserHome: current === home,
			files: [],
		};

		// Check for Claude files at this level
		checkFile(level, join(current, "CLAUDE.md"), FileTraceType.Instructions);
		checkFile(level, join(current, ".mcp.json"), FileTraceType.Mcp);
		checkDir(level, join(current, ".claude"), FileTraceType.ClaudeDir);

		// If .claude/ exists, check files inside
		const claudeDir = join(current, ".claude");
		if (dirExists(claudeDir)) {
			checkFile(level, join(claudeDir, "CLAUDE.md"), FileTraceType.Instructions);
			checkFile(level, join(claudeDir, "settings.json"), FileTraceType.Settings);
			checkFile(level, join(claudeDir, "settings.local.json"), FileTraceType.Settings);
		}

		// Special case: at home, also check for .claude.json (user MCP)
		if (current === home) {
			checkFile(level, join(home, ".claude.json"), FileTraceType.Mcp);
		}

		levels.push(level);

		if (current === home) break;
		current = dirname(current);
	}

	return { levels, projectPath: resolve(projectPath), homePath: home };
}
