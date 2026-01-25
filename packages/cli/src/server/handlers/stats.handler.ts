import type { IncomingMessage, ServerResponse } from "node:http";
import { analyzeIssues } from "../../analyzers/index.js";
import { InstructionsSource, SettingsSource } from "../../models/index.js";
import {
	collectInstructions,
	collectMcp,
	collectPlugins,
	collectSettings,
	collectStats,
} from "../../collectors/index.js";
import { sendJson } from "../routes/api.js";

export async function handleStats(
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

	// Count issues by severity
	const issuesBySeverity = {
		error: issues.filter((i) => i.severity === "error").length,
		warning: issues.filter((i) => i.severity === "warning").length,
		info: issues.filter((i) => i.severity === "info").length,
	};

	// Find settings layer statuses
	const userSettings = settings.layers.find((l) => l.source === SettingsSource.User);
	const projectSettings = settings.layers.find(
		(l) => l.source === SettingsSource.ProjectLocal || l.source === SettingsSource.ProjectShared,
	);

	// Find instruction layer statuses
	const userInstr = instructions.layers.find((l) => l.source === InstructionsSource.User);
	const projectInstr = instructions.layers.find(
		(l) =>
			l.source === InstructionsSource.ProjectRoot ||
			l.source === InstructionsSource.ProjectClaudeDir,
	);

	// Config files status
	const configFiles = [
		{ name: "User settings", exists: userSettings?.exists ?? false },
		{ name: "Project settings", exists: projectSettings?.exists ?? false },
		{ name: "User CLAUDE.md", exists: userInstr?.exists ?? false },
		{ name: "Project CLAUDE.md", exists: projectInstr?.exists ?? false },
	];

	// Count MCP servers
	const mcpServers = mcp.servers.length;

	sendJson(res, 200, {
		configFiles,
		mcpServers,
		plugins: plugins.plugins.length,
		issues: issuesBySeverity,
		usage: stats.stats,
	});
}
