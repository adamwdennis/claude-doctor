import type { IncomingMessage, ServerResponse } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { collectFileTrace } from "../../collectors/filetrace.collector.js";
import { sendJson, readBody, parseJson } from "../routes/api.js";

export async function handleFileTrace(
	req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
	url: string,
	method: string,
): Promise<void> {
	// GET /api/file-trace - list all files
	if (url === "/api/file-trace" && method === "GET") {
		const trace = collectFileTrace(projectPath);
		sendJson(res, 200, trace);
		return;
	}

	// GET /api/file-trace/read?path=... - read single file
	if (url.startsWith("/api/file-trace/read") && method === "GET") {
		const urlObj = new URL(url, "http://localhost");
		const filePath = urlObj.searchParams.get("path");
		if (!filePath) {
			sendJson(res, 400, { error: "Missing path parameter" });
			return;
		}
		if (!existsSync(filePath)) {
			sendJson(res, 404, { error: "File not found" });
			return;
		}
		try {
			const content = readFileSync(filePath, "utf-8");
			sendJson(res, 200, { path: filePath, content });
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to read file";
			sendJson(res, 500, { error: msg });
		}
		return;
	}

	// PUT /api/file-trace/save - save file content
	if (url === "/api/file-trace/save" && method === "PUT") {
		const body = await readBody(req);
		const data = parseJson<{ path: string; content: string }>(body);
		if (!data || !data.path || data.content === undefined) {
			sendJson(res, 400, { error: "Missing path or content" });
			return;
		}
		try {
			writeFileSync(data.path, data.content, "utf-8");
			sendJson(res, 200, { success: true, path: data.path });
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to write file";
			sendJson(res, 500, { error: msg });
		}
		return;
	}

	sendJson(res, 404, { error: "Not found" });
}
