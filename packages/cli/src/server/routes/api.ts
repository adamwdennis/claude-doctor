import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAgents } from "../handlers/agents.handler.js";
import { handleContext } from "../handlers/context.handler.js";
import { handleDiagnose } from "../handlers/diagnose.handler.js";
import { addSseClient } from "../handlers/events.handler.js";
import { handleFileTrace } from "../handlers/filetrace.handler.js";
import { handleFix } from "../handlers/fix.handler.js";
import { handleForecast } from "../handlers/forecast.handler.js";
import { handleHistory } from "../handlers/history.handler.js";
import { handleHooks } from "../handlers/hooks.handler.js";
import { handleInstructions } from "../handlers/instructions.handler.js";
import { handleInstructionsLint } from "../handlers/instructions-lint.handler.js";
import { handleIssues } from "../handlers/issues.handler.js";
import { handleMcp } from "../handlers/mcp.handler.js";
import { handleMcpTools } from "../handlers/mcp-tools.handler.js";
import { handlePermissions } from "../handlers/permissions.handler.js";
import { handlePlugins } from "../handlers/plugins.handler.js";
import { handleSettings } from "../handlers/settings.handler.js";
import { handleSnapshots } from "../handlers/snapshots.handler.js";
import { handleStats } from "../handlers/stats.handler.js";
import { computeEffectiveConfig } from "../../analyzers/effective.analyzer.js";
import { collectSettings } from "../../collectors/settings.collector.js";

export async function handleApiRequest(
	req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const url = req.url ?? "";
	const method = req.method ?? "GET";

	try {
		if (url === "/api/events") {
			addSseClient(res);
			return;
		}
		if (url.startsWith("/api/context")) {
			await handleContext(req, res, projectPath);
		} else if (url.startsWith("/api/permissions")) {
			await handlePermissions(req, res, projectPath, url, method);
		} else if (url.startsWith("/api/hooks")) {
			await handleHooks(req, res, projectPath);
		} else if (url.startsWith("/api/instructions/lint")) {
			await handleInstructionsLint(req, res, projectPath);
		} else if (url.startsWith("/api/instructions/merged")) {
			const { collectMergedInstructions } =
				await import("../../collectors/instructions-merged.collector.js");
			sendJson(res, 200, collectMergedInstructions(projectPath));
		} else if (url.startsWith("/api/instructions")) {
			await handleInstructions(req, res, projectPath, url, method);
		} else if (url === "/api/settings/effective") {
			const settings = collectSettings(projectPath);
			const effective = computeEffectiveConfig(settings.layers);
			sendJson(res, 200, effective);
		} else if (url.startsWith("/api/settings")) {
			await handleSettings(req, res, projectPath, url, method);
		} else if (url.startsWith("/api/mcp/tools")) {
			await handleMcpTools(req, res, projectPath);
		} else if (url.startsWith("/api/mcp")) {
			await handleMcp(req, res, projectPath, url, method);
		} else if (url.startsWith("/api/plugins")) {
			await handlePlugins(req, res, url, method);
		} else if (url.startsWith("/api/diagnose")) {
			await handleDiagnose(req, res, projectPath, url);
		} else if (url.startsWith("/api/issues")) {
			await handleIssues(req, res, projectPath);
		} else if (url.startsWith("/api/stats/forecast")) {
			await handleForecast(req, res, url);
		} else if (url.startsWith("/api/stats")) {
			await handleStats(req, res, projectPath);
		} else if (url.startsWith("/api/file-trace")) {
			await handleFileTrace(req, res, projectPath, url, method);
		} else if (url.startsWith("/api/agents")) {
			await handleAgents(req, res, url, method);
		} else if (url.startsWith("/api/history/")) {
			await handleSessionDetail(req, res, url);
		} else if (url.startsWith("/api/history")) {
			await handleHistory(req, res, url);
		} else if (url.startsWith("/api/snapshots")) {
			await handleSnapshots(req, res, projectPath, url, method);
		} else if (url.startsWith("/api/fix")) {
			await handleFix(req, res, projectPath);
		} else {
			sendJson(res, 404, { error: "Not found" });
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		sendJson(res, 500, { error: message });
	}
}

async function handleSessionDetail(
	_req: IncomingMessage,
	res: ServerResponse,
	url: string,
): Promise<void> {
	const { collectSessionDetail } = await import("../../collectors/session-detail.collector.js");
	const sessionId = url.replace("/api/history/", "").split("?")[0];
	if (!sessionId) {
		sendJson(res, 400, { error: "Missing session ID" });
		return;
	}
	const detail = collectSessionDetail(decodeURIComponent(sessionId));
	if (!detail) {
		sendJson(res, 404, { error: "Session not found" });
		return;
	}
	sendJson(res, 200, detail);
}

export function sendJson(res: ServerResponse, status: number, data: unknown): void {
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(JSON.stringify(data, null, 2));
}

export async function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});
		req.on("end", () => resolve(body));
		req.on("error", reject);
	});
}

export function parseJson<T>(body: string): T | null {
	try {
		return JSON.parse(body) as T;
	} catch {
		return null;
	}
}
