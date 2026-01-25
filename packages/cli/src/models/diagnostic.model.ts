import type { SettingsConflict, SettingsHierarchy } from "./config.model.js";
import type { McpCollection } from "./mcp.model.js";
import type { PluginsCollection } from "./plugin.model.js";
import type { StatsCollection } from "./stats.model.js";

export enum InstructionsSource {
	ProjectClaudeDir = "project_claude_dir",
	ProjectRoot = "project_root",
	User = "user",
}

export const INSTRUCTIONS_SOURCE_LABELS: Record<InstructionsSource, string> = {
	[InstructionsSource.ProjectClaudeDir]: "Project (.claude/)",
	[InstructionsSource.ProjectRoot]: "Project Root",
	[InstructionsSource.User]: "User Global",
};

export interface InstructionsLayer {
	source: InstructionsSource;
	path: string;
	exists: boolean;
	lineCount: number;
	preview?: string;
}

export interface InstructionsCollection {
	layers: InstructionsLayer[];
	totalLines: number;
}

export enum IssueSeverity {
	Error = "error",
	Warning = "warning",
	Info = "info",
}

export interface DiagnosticIssue {
	severity: IssueSeverity;
	message: string;
	category: string;
	path?: string;
}

export interface DiagnosticReport {
	settings: SettingsHierarchy;
	mcp: McpCollection;
	plugins: PluginsCollection;
	instructions: InstructionsCollection;
	stats: StatsCollection;
	conflicts: SettingsConflict[];
	issues: DiagnosticIssue[];
	generatedAt: Date;
	projectPath: string;
}

export enum OutputFormat {
	Tree = "tree",
	Json = "json",
	Html = "html",
}
