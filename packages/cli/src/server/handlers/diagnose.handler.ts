import type { IncomingMessage, ServerResponse } from "node:http";
import { analyzeConflicts, analyzeIssues } from "../../analyzers/index.js";
import {
	collectInstructions,
	collectMcp,
	collectPlugins,
	collectSettings,
	collectStats,
} from "../../collectors/index.js";
import type { DiagnosticReport } from "../../models/index.js";
import { sendJson } from "../routes/api.js";

export async function handleDiagnose(
	_req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const settings = collectSettings(projectPath);
	const mcp = await collectMcp(projectPath, false);
	const plugins = collectPlugins();
	const instructions = collectInstructions(projectPath);
	const stats = await collectStats(30);

	const conflicts = analyzeConflicts(settings);
	const issues = analyzeIssues(settings, mcp, plugins, instructions, stats);

	const report: DiagnosticReport = {
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

	sendJson(res, 200, report);
}
