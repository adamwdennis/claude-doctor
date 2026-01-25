import {
	type DiagnosticIssue,
	type InstructionsCollection,
	IssueSeverity,
	type McpCollection,
	McpStatus,
	PluginStatus,
	type PluginsCollection,
	type SettingsHierarchy,
	type StatsCollection,
} from "../models/index.js";

export function analyzeIssues(
	settings: SettingsHierarchy,
	mcp: McpCollection,
	plugins: PluginsCollection,
	instructions: InstructionsCollection,
	stats: StatsCollection,
): DiagnosticIssue[] {
	const issues: DiagnosticIssue[] = [];

	// Check for missing user settings
	const userLayer = settings.layers.find((l) => l.source === "user");
	if (userLayer && !userLayer.exists) {
		issues.push({
			severity: IssueSeverity.Info,
			message: "No user settings file found",
			category: "settings",
			path: userLayer.path ?? undefined,
		});
	}

	// Check for missing project-level instructions
	const projectInstructions = instructions.layers.filter((l) => l.source !== "user" && !l.exists);
	if (projectInstructions.length === instructions.layers.length - 1) {
		issues.push({
			severity: IssueSeverity.Warning,
			message: "No project-level CLAUDE.md found",
			category: "instructions",
		});
	}

	// Check for disabled MCP servers
	const disabledServers = mcp.servers.filter((s) => s.status === McpStatus.Disabled);
	if (disabledServers.length > 0) {
		issues.push({
			severity: IssueSeverity.Info,
			message: `${disabledServers.length} MCP server(s) disabled`,
			category: "mcp",
		});
	}

	// Check for MCP connectivity issues
	const unreachableServers = mcp.servers.filter((s) => s.connectivity && !s.connectivity.reachable);
	for (const server of unreachableServers) {
		issues.push({
			severity: IssueSeverity.Error,
			message: `MCP server '${server.name}' unreachable: ${server.connectivity?.error}`,
			category: "mcp",
		});
	}

	// Check for disabled plugins
	const disabledPlugins = plugins.plugins.filter((p) => p.status === PluginStatus.Disabled);
	if (disabledPlugins.length > 0) {
		issues.push({
			severity: IssueSeverity.Info,
			message: `${disabledPlugins.length} plugin(s) disabled`,
			category: "plugins",
		});
	}

	// Check for empty plugin list
	if (!plugins.installedPluginsExists) {
		issues.push({
			severity: IssueSeverity.Info,
			message: "No plugins installed",
			category: "plugins",
			path: plugins.installedPluginsPath ?? undefined,
		});
	}

	// Check for missing history/stats files
	if (!stats.historyExists && !stats.statsCacheExists) {
		issues.push({
			severity: IssueSeverity.Info,
			message: "No usage history found",
			category: "stats",
		});
	}

	return issues;
}
