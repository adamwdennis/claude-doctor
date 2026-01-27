export interface ToolInventoryItem {
	name: string;
	server: string;
	description: string;
	inputSchema?: Record<string, unknown>;
	tokenEstimate: number;
}

export interface McpToolsCollection {
	tools: ToolInventoryItem[];
	servers: string[];
	totalTokens: number;
	totalTools: number;
}
