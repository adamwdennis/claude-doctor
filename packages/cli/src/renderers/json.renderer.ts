import type {
	DiagnosticReport,
	InstructionsCollection,
	McpCollection,
	PluginsCollection,
	SettingsHierarchy,
	StatsCollection,
} from "../models/index.js";

export function renderSettingsJson(settings: SettingsHierarchy): string {
	return JSON.stringify(settings, null, 2);
}

export function renderMcpJson(mcp: McpCollection): string {
	return JSON.stringify(mcp, null, 2);
}

export function renderPluginsJson(plugins: PluginsCollection): string {
	return JSON.stringify(plugins, null, 2);
}

export function renderInstructionsJson(instructions: InstructionsCollection): string {
	return JSON.stringify(instructions, null, 2);
}

export function renderStatsJson(stats: StatsCollection): string {
	return JSON.stringify(stats, null, 2);
}

export function renderDiagnosticReportJson(report: DiagnosticReport): string {
	return JSON.stringify(report, null, 2);
}
