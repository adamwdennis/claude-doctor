import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { collectInstructions } from "../../collectors/instructions.collector.js";
import { InstructionsSource } from "../../models/index.js";
import {
	fileExists,
	getProjectClaudeDirInstructionsPath,
	getProjectRootInstructionsPath,
	getUserInstructionsPath,
	readTextFile,
} from "../../utils/index.js";
import { readBody, sendJson } from "../routes/api.js";

type InstructionsLevel = "user" | "project" | "project-claude";

const LEVEL_MAP: Record<InstructionsLevel, InstructionsSource> = {
	user: InstructionsSource.User,
	project: InstructionsSource.ProjectRoot,
	"project-claude": InstructionsSource.ProjectClaudeDir,
};

export async function handleInstructions(
	req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
	url: string,
	method: string,
): Promise<void> {
	const pathParts = url.replace("/api/instructions", "").split("/").filter(Boolean);
	const level = pathParts[0] as InstructionsLevel | undefined;

	if (method === "GET") {
		const instructions = collectInstructions(projectPath);

		if (!level) {
			// Return all with full content
			const result = instructions.layers.map((layer) => ({
				...layer,
				content: layer.exists ? readTextFile(layer.path) : null,
			}));
			sendJson(res, 200, { layers: result, totalLines: instructions.totalLines });
			return;
		}

		const source = LEVEL_MAP[level];
		if (!source) {
			sendJson(res, 400, { error: `Invalid level: ${level}` });
			return;
		}

		const found = instructions.layers.find((l) => l.source === source);
		if (!found) {
			sendJson(res, 404, { error: "Level not found" });
			return;
		}

		const content = found.exists ? readTextFile(found.path) : null;
		sendJson(res, 200, { ...found, content });
		return;
	}

	if (method === "PUT") {
		if (!level || !LEVEL_MAP[level]) {
			sendJson(res, 400, { error: "Must specify level: user, project, project-claude" });
			return;
		}

		const body = await readBody(req);
		const path = getPathForLevel(level, projectPath);
		writeTextWithBackup(path, body);
		sendJson(res, 200, { success: true, path });
		return;
	}

	sendJson(res, 405, { error: "Method not allowed" });
}

function getPathForLevel(level: InstructionsLevel, projectPath: string): string {
	switch (level) {
		case "user":
			return getUserInstructionsPath();
		case "project":
			return getProjectRootInstructionsPath(projectPath);
		case "project-claude":
			return getProjectClaudeDirInstructionsPath(projectPath);
	}
}

function writeTextWithBackup(path: string, content: string): void {
	const dir = dirname(path);
	mkdirSync(dir, { recursive: true });

	if (fileExists(path)) {
		copyFileSync(path, `${path}.bak`);
	}

	writeFileSync(path, content);
}
