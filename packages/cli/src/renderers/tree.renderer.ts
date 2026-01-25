import chalk from "chalk";
import {
	type DiagnosticIssue,
	type DiagnosticReport,
	INSTRUCTIONS_SOURCE_LABELS,
	type InstructionsCollection,
	IssueSeverity,
	MCP_SOURCE_LABELS,
	type McpCollection,
	McpStatus,
	PluginStatus,
	type PluginsCollection,
	SETTINGS_SOURCE_LABELS,
	type SettingsConflict,
	type SettingsHierarchy,
	type StatsCollection,
} from "../models/index.js";

const TREE = {
	pipe: "│",
	tee: "├──",
	elbow: "└──",
	blank: "   ",
};

function statusIcon(enabled: boolean, exists = true): string {
	if (!exists) return chalk.gray("[!]");
	return enabled ? chalk.green("[*]") : chalk.dim("[ ]");
}

function mcpStatusIcon(status: McpStatus): string {
	switch (status) {
		case McpStatus.Enabled:
			return chalk.green("[E]");
		case McpStatus.Disabled:
			return chalk.yellow("[D]");
		default:
			return chalk.gray("[?]");
	}
}

function pluginStatusIcon(status: PluginStatus): string {
	return status === PluginStatus.Enabled ? chalk.green("[E]") : chalk.yellow("[D]");
}

function severityIcon(severity: IssueSeverity): string {
	switch (severity) {
		case IssueSeverity.Error:
			return chalk.red("[E]");
		case IssueSeverity.Warning:
			return chalk.yellow("[W]");
		case IssueSeverity.Info:
			return chalk.blue("[I]");
	}
}

function formatValue(value: unknown): string {
	if (typeof value === "object" && value !== null) {
		if (Array.isArray(value)) {
			return `[${value.length} items]`;
		}
		return `{${Object.keys(value).length} entries}`;
	}
	return String(value);
}

export function renderSettingsTree(settings: SettingsHierarchy): string {
	const lines: string[] = [];
	lines.push(chalk.bold("Settings Hierarchy"));

	const activeLayers = settings.layers.filter((l) => l.exists || l.path);

	for (let i = 0; i < activeLayers.length; i++) {
		const layer = activeLayers[i];
		const isLast = i === activeLayers.length - 1;
		const prefix = isLast ? TREE.elbow : TREE.tee;
		const icon = statusIcon(layer.exists, layer.path !== null);
		const label = SETTINGS_SOURCE_LABELS[layer.source];
		const pathInfo = layer.path ? chalk.dim(`: ${layer.path}`) : "";
		const notFound = !layer.exists && layer.path ? chalk.dim(" (not found)") : "";

		lines.push(`${prefix} ${icon} ${label}${pathInfo}${notFound}`);

		// Show content summary if exists
		if (layer.content && Object.keys(layer.content).length > 0) {
			const contentPrefix = isLast ? TREE.blank : TREE.pipe;
			for (const [key, value] of Object.entries(layer.content).slice(0, 3)) {
				lines.push(`${contentPrefix}   ${TREE.elbow} ${chalk.cyan(key)}: ${formatValue(value)}`);
			}
			if (Object.keys(layer.content).length > 3) {
				lines.push(
					`${contentPrefix}   ${TREE.elbow} ${chalk.dim(`... and ${Object.keys(layer.content).length - 3} more`)}`,
				);
			}
		}
	}

	return lines.join("\n");
}

export function renderMcpTree(mcp: McpCollection): string {
	const lines: string[] = [];
	lines.push(chalk.bold("MCP Servers"));

	if (mcp.servers.length === 0) {
		lines.push(`${TREE.elbow} ${chalk.dim("No MCP servers configured")}`);
		return lines.join("\n");
	}

	for (let i = 0; i < mcp.servers.length; i++) {
		const server = mcp.servers[i];
		const isLast = i === mcp.servers.length - 1;
		const prefix = isLast ? TREE.elbow : TREE.tee;
		const icon = mcpStatusIcon(server.status);
		const source = MCP_SOURCE_LABELS[server.source];
		const transport = chalk.dim(`(${server.transport})`);

		let connectivity = "";
		if (server.connectivity) {
			if (server.connectivity.reachable) {
				connectivity = chalk.green(` ✓ ${server.connectivity.latencyMs ?? ""}ms`);
			} else {
				connectivity = chalk.red(` ✗ ${server.connectivity.error ?? "unreachable"}`);
			}
		}

		lines.push(`${prefix} ${icon} ${server.name} ${transport} - ${source}${connectivity}`);
	}

	return lines.join("\n");
}

export function renderPluginsTree(plugins: PluginsCollection): string {
	const lines: string[] = [];
	lines.push(
		chalk.bold(`Plugins (${plugins.enabledCount} enabled / ${plugins.disabledCount} disabled)`),
	);

	if (plugins.plugins.length === 0) {
		lines.push(`${TREE.elbow} ${chalk.dim("No plugins installed")}`);
		return lines.join("\n");
	}

	const sorted = [...plugins.plugins].sort((a, b) => {
		if (a.status !== b.status) {
			return a.status === PluginStatus.Enabled ? -1 : 1;
		}
		return a.fullName.localeCompare(b.fullName);
	});

	for (let i = 0; i < sorted.length; i++) {
		const plugin = sorted[i];
		const isLast = i === sorted.length - 1;
		const prefix = isLast ? TREE.elbow : TREE.tee;
		const icon = pluginStatusIcon(plugin.status);

		lines.push(`${prefix} ${icon} ${plugin.fullName}`);
	}

	return lines.join("\n");
}

export function renderInstructionsTree(instructions: InstructionsCollection): string {
	const lines: string[] = [];
	lines.push(chalk.bold("CLAUDE.md Instructions"));

	for (let i = 0; i < instructions.layers.length; i++) {
		const layer = instructions.layers[i];
		const isLast = i === instructions.layers.length - 1;
		const prefix = isLast ? TREE.elbow : TREE.tee;
		const icon = statusIcon(layer.exists);
		const label = INSTRUCTIONS_SOURCE_LABELS[layer.source];
		const pathInfo = chalk.dim(`: ${layer.path}`);
		const lineInfo = layer.exists ? chalk.cyan(` (${layer.lineCount} lines)`) : "";
		const notFound = !layer.exists ? chalk.dim(" (not found)") : "";

		lines.push(`${prefix} ${icon} ${label}${pathInfo}${lineInfo}${notFound}`);
	}

	return lines.join("\n");
}

export function renderStatsTree(statsCollection: StatsCollection): string {
	const lines: string[] = [];
	const { stats } = statsCollection;

	const periodLabel = stats.periodDays > 0 ? `Last ${stats.periodDays} days` : "All time";
	lines.push(chalk.bold(`Usage Stats (${periodLabel})`));

	lines.push(`${TREE.tee} Messages: ${chalk.cyan(stats.messages.toLocaleString())}`);
	lines.push(`${TREE.tee} Sessions: ${chalk.cyan(stats.sessions.toLocaleString())}`);
	lines.push(`${TREE.tee} Tool Calls: ${chalk.cyan(stats.toolCalls.toLocaleString())}`);
	if (stats.tokensIn > 0 || stats.tokensOut > 0) {
		lines.push(`${TREE.tee} Tokens In: ${chalk.cyan(stats.tokensIn.toLocaleString())}`);
		lines.push(`${TREE.tee} Tokens Out: ${chalk.cyan(stats.tokensOut.toLocaleString())}`);
	}
	if (stats.costUsd > 0) {
		lines.push(`${TREE.elbow} Cost: ${chalk.cyan(`$${stats.costUsd.toFixed(2)}`)}`);
	} else {
		lines.push(`${TREE.elbow} Cost: ${chalk.dim("N/A")}`);
	}

	return lines.join("\n");
}

export function renderConflictsTree(conflicts: SettingsConflict[]): string {
	if (conflicts.length === 0) return "";

	const lines: string[] = [];
	lines.push(chalk.bold.yellow(`Conflicts (${conflicts.length})`));

	for (let i = 0; i < conflicts.length; i++) {
		const conflict = conflicts[i];
		const isLast = i === conflicts.length - 1;
		const prefix = isLast ? TREE.elbow : TREE.tee;

		lines.push(`${prefix} ${chalk.yellow(conflict.key)}`);

		const valPrefix = isLast ? TREE.blank : TREE.pipe;
		for (let j = 0; j < conflict.values.length; j++) {
			const val = conflict.values[j];
			const valIsLast = j === conflict.values.length - 1;
			const valPipe = valIsLast ? TREE.elbow : TREE.tee;
			const source = SETTINGS_SOURCE_LABELS[val.source];
			lines.push(`${valPrefix}   ${valPipe} ${source}: ${formatValue(val.value)}`);
		}
	}

	return lines.join("\n");
}

export function renderIssuesTree(issues: DiagnosticIssue[]): string {
	if (issues.length === 0) return "";

	const errors = issues.filter((i) => i.severity === IssueSeverity.Error);
	const warnings = issues.filter((i) => i.severity === IssueSeverity.Warning);
	const infos = issues.filter((i) => i.severity === IssueSeverity.Info);

	const summary = [
		errors.length > 0 ? `${errors.length} errors` : null,
		warnings.length > 0 ? `${warnings.length} warnings` : null,
		infos.length > 0 ? `${infos.length} info` : null,
	]
		.filter(Boolean)
		.join(", ");

	const lines: string[] = [];
	lines.push(chalk.bold(`Issues (${summary})`));

	for (let i = 0; i < issues.length; i++) {
		const issue = issues[i];
		const isLast = i === issues.length - 1;
		const prefix = isLast ? TREE.elbow : TREE.tee;
		const icon = severityIcon(issue.severity);

		lines.push(`${prefix} ${icon} ${issue.message}`);
	}

	return lines.join("\n");
}

export function renderDiagnosticReport(report: DiagnosticReport): string {
	const sections: string[] = [];

	sections.push(chalk.bold.underline("Claude Code Configuration"));
	sections.push(chalk.dim(`Project: ${report.projectPath}`));
	sections.push("");

	sections.push(renderSettingsTree(report.settings));
	sections.push("");

	sections.push(renderMcpTree(report.mcp));
	sections.push("");

	sections.push(renderPluginsTree(report.plugins));
	sections.push("");

	sections.push(renderInstructionsTree(report.instructions));
	sections.push("");

	sections.push(renderStatsTree(report.stats));

	const conflictsTree = renderConflictsTree(report.conflicts);
	if (conflictsTree) {
		sections.push("");
		sections.push(conflictsTree);
	}

	const issuesTree = renderIssuesTree(report.issues);
	if (issuesTree) {
		sections.push("");
		sections.push(issuesTree);
	}

	sections.push("");
	sections.push(chalk.dim(`Generated: ${report.generatedAt.toISOString()}`));

	return sections.join("\n");
}
