import type { IncomingMessage, ServerResponse } from "node:http";
import { analyzeIssues } from "../../analyzers/index.js";
import {
	collectInstructions,
	collectMcp,
	collectPlugins,
	collectSettings,
	collectStats,
} from "../../collectors/index.js";
import { sendJson } from "../routes/api.js";

export async function handleIssues(
	_req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const settings = collectSettings(projectPath);
	const mcp = await collectMcp(projectPath, false);
	const plugins = collectPlugins();
	const instructions = collectInstructions(projectPath);
	const stats = await collectStats(30);

	const issues = analyzeIssues(settings, mcp, plugins, instructions, stats);

	sendJson(res, 200, issues);
}
