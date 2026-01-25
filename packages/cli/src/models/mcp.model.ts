export enum McpSource {
	UserGlobal = "user_global",
	Project = "project",
	Plugin = "plugin",
	ProjectOverride = "project_override",
}

export const MCP_SOURCE_LABELS: Record<McpSource, string> = {
	[McpSource.UserGlobal]: "User Global",
	[McpSource.Project]: "Project",
	[McpSource.Plugin]: "Plugin",
	[McpSource.ProjectOverride]: "Project Override",
};

export enum McpTransport {
	Http = "http",
	Sse = "sse",
	Stdio = "stdio",
}

export enum McpStatus {
	Enabled = "enabled",
	Disabled = "disabled",
	Unknown = "unknown",
}

export interface McpServerConfig {
	name: string;
	source: McpSource;
	transport: McpTransport;
	status: McpStatus;
	url?: string;
	command?: string;
	args?: string[];
	env?: Record<string, string>;
	disabled?: boolean;
	connectivity?: McpConnectivityResult;
}

export interface McpConnectivityResult {
	reachable: boolean;
	latencyMs?: number;
	error?: string;
}

export interface McpCollection {
	servers: McpServerConfig[];
	sources: Array<{
		source: McpSource;
		path: string | null;
		exists: boolean;
	}>;
}
