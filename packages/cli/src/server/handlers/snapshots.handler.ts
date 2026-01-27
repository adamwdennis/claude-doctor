import type { IncomingMessage, ServerResponse } from "node:http";
import {
	deleteSnapshot,
	getSnapshot,
	listSnapshots,
	saveSnapshot,
} from "../../collectors/snapshots.collector.js";
import { diffSnapshots } from "../../analyzers/diff.analyzer.js";
import { analyzeConflicts, analyzeIssues } from "../../analyzers/index.js";
import {
	collectInstructions,
	collectMcp,
	collectPlugins,
	collectSettings,
	collectStats,
} from "../../collectors/index.js";
import type { DiagnosticReport } from "../../models/diagnostic.model.js";
import { parseJson, readBody, sendJson } from "../routes/api.js";

async function buildReport(projectPath: string): Promise<DiagnosticReport> {
	const settings = collectSettings(projectPath);
	const mcp = await collectMcp(projectPath, false);
	const plugins = collectPlugins();
	const instructions = collectInstructions(projectPath);
	const stats = await collectStats(30);
	const conflicts = analyzeConflicts(settings);
	const issues = analyzeIssues(settings, mcp, plugins, instructions, stats);

	return {
		settings,
		mcp,
		plugins,
		instructions,
		stats,
		conflicts,
		issues,
		generatedAt: new Date(),
		projectPath,
	};
}

export async function handleSnapshots(
	req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
	url: string,
	method: string,
): Promise<void> {
	const pathParts = url.replace("/api/snapshots", "").split("/").filter(Boolean);
	const idOrAction = pathParts[0];

	// POST /api/snapshots — create
	if (method === "POST" && !idOrAction) {
		const body = await readBody(req);
		const data = parseJson<{ name?: string }>(body);
		const report = await buildReport(projectPath);
		const meta = saveSnapshot(report, data?.name);
		sendJson(res, 201, meta);
		return;
	}

	// POST /api/snapshots/diff — compare
	if (method === "POST" && idOrAction === "diff") {
		const body = await readBody(req);
		const data = parseJson<{ leftId: string; rightId: string }>(body);
		if (!data?.leftId || !data?.rightId) {
			sendJson(res, 400, { error: "Missing leftId or rightId" });
			return;
		}

		const left = getSnapshot(data.leftId);
		const right = getSnapshot(data.rightId);
		if (!left || !right) {
			sendJson(res, 404, { error: "Snapshot not found" });
			return;
		}

		const diff = diffSnapshots(left.meta, left.report, right.meta, right.report);
		sendJson(res, 200, diff);
		return;
	}

	// GET /api/snapshots — list
	if (method === "GET" && !idOrAction) {
		const metas = listSnapshots();
		sendJson(res, 200, { snapshots: metas });
		return;
	}

	// GET /api/snapshots/:id
	if (method === "GET" && idOrAction) {
		const snapshot = getSnapshot(idOrAction);
		if (!snapshot) {
			sendJson(res, 404, { error: "Snapshot not found" });
			return;
		}
		sendJson(res, 200, snapshot);
		return;
	}

	// DELETE /api/snapshots/:id
	if (method === "DELETE" && idOrAction) {
		const deleted = deleteSnapshot(idOrAction);
		if (!deleted) {
			sendJson(res, 404, { error: "Snapshot not found" });
			return;
		}
		sendJson(res, 200, { success: true });
		return;
	}

	sendJson(res, 404, { error: "Not found" });
}
