import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { checkConnectivity, collectMcp } from "../../collectors/mcp.collector.js";
import { McpStatus } from "../../models/index.js";
import { fileExists, getProjectMcpPath, getUserMcpPath } from "../../utils/index.js";
import { parseJson, readBody, sendJson } from "../routes/api.js";

interface McpJsonConfig {
	mcpServers?: Record<string, unknown>;
}

type McpLayer = "user" | "project";

export async function handleMcp(
	req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
	url: string,
	method: string,
): Promise<void> {
	const pathParts = url.replace("/api/mcp", "").split("/").filter(Boolean);
	const action = pathParts[0];

	if (method === "GET" && !action) {
		const mcp = await collectMcp(projectPath, false);
		sendJson(res, 200, mcp);
		return;
	}

	if (method === "POST" && action === "check") {
		const serverName = pathParts[1];
		if (!serverName) {
			sendJson(res, 400, { error: "Server name required" });
			return;
		}

		const mcp = await collectMcp(projectPath, false);
		const server = mcp.servers.find((s) => s.name === serverName);

		if (!server) {
			sendJson(res, 404, { error: `Server not found: ${serverName}` });
			return;
		}

		if (server.status === McpStatus.Disabled) {
			sendJson(res, 200, { reachable: false, error: "Server is disabled" });
			return;
		}

		const result = await checkConnectivity(server);
		sendJson(res, 200, result);
		return;
	}

	if (method === "PUT") {
		const layer = action as McpLayer;
		if (layer !== "user" && layer !== "project") {
			sendJson(res, 400, { error: "Must specify layer: user or project" });
			return;
		}

		const body = await readBody(req);
		const content = parseJson<McpJsonConfig>(body);

		if (!content) {
			sendJson(res, 400, { error: "Invalid JSON body" });
			return;
		}

		const path = layer === "user" ? getUserMcpPath() : getProjectMcpPath(projectPath);
		writeJsonWithBackup(path, content);
		sendJson(res, 200, { success: true, path });
		return;
	}

	sendJson(res, 405, { error: "Method not allowed" });
}

function writeJsonWithBackup(path: string, content: unknown): void {
	const dir = dirname(path);
	mkdirSync(dir, { recursive: true });

	if (fileExists(path)) {
		copyFileSync(path, `${path}.bak`);
	}

	writeFileSync(path, JSON.stringify(content, null, 2));
}
