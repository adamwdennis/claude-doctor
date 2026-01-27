export interface AgentInfo {
	name: string;
	description: string;
	pluginName: string;
	pluginFullName: string;
	model: string;
	filePath: string;
	enabled: boolean;
	agentId: string;
	agentEnabled: boolean;
}

export interface AgentsCollection {
	agents: AgentInfo[];
	enabledCount: number;
	disabledCount: number;
}
