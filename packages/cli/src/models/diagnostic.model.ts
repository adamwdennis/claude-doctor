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

// Merge Preview (F3)
export interface MergedInstructionsBlock {
	source: InstructionsSource;
	path: string;
	content: string;
	tokenEstimate: number;
	startLine: number;
	endLine: number;
}

export interface MergedInstructionsResult {
	blocks: MergedInstructionsBlock[];
	mergedContent: string;
	totalTokens: number;
	totalLines: number;
}

// Instructions Linter (F8)
export enum LintSeverity {
	Error = "error",
	Warning = "warning",
	Info = "info",
}

export interface InstructionsLintIssue {
	severity: LintSeverity;
	message: string;
	source: InstructionsSource;
	line?: number;
	suggestion?: string;
	ruleId: string;
}

export interface InstructionsLintResult {
	issues: InstructionsLintIssue[];
	totalIssues: number;
}

// Permissions Debugger (F4)
export enum PermissionVerdict {
	Allowed = "allowed",
	Denied = "denied",
	Ask = "ask",
	NoMatch = "no_match",
}

export interface PermissionRule {
	pattern: string;
	source: string;
	sourcePath: string;
	type: "allow" | "deny" | "ask";
}

export interface PermissionDebugResult {
	query: string;
	verdict: PermissionVerdict;
	matchedRule?: PermissionRule;
	allRules: PermissionRule[];
}

// Snapshots (F7)
export interface SnapshotMeta {
	id: string;
	name: string;
	createdAt: string;
	projectPath: string;
}

export interface Snapshot {
	meta: SnapshotMeta;
	report: DiagnosticReport;
}

export enum DiffChangeType {
	Added = "added",
	Removed = "removed",
	Changed = "changed",
}

export interface DiffEntry {
	path: string;
	changeType: DiffChangeType;
	oldValue?: unknown;
	newValue?: unknown;
}

export interface SnapshotDiff {
	left: SnapshotMeta;
	right: SnapshotMeta;
	entries: DiffEntry[];
}

// Quick-Fix Actions (F10)
export enum FixType {
	EnableServer = "enable_server",
	CreateFile = "create_file",
	TogglePlugin = "toggle_plugin",
	NavigateToTab = "navigate_to_tab",
}

export interface DiagnosticIssueFix {
	type: FixType;
	label: string;
	payload: Record<string, unknown>;
}
