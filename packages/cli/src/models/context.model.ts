export enum ContextSource {
	SystemPrompt = "system_prompt",
	Instructions = "instructions",
	McpTools = "mcp_tools",
	Permissions = "permissions",
	Hooks = "hooks",
}

export interface ContextSourceEntry {
	source: ContextSource;
	label: string;
	tokenEstimate: number;
	details?: string;
}

export interface ContextBudget {
	sources: ContextSourceEntry[];
	totalTokens: number;
	modelLimit: number;
	usagePercent: number;
}
