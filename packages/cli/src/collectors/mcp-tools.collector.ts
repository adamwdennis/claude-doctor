import type { McpToolsCollection, ToolInventoryItem } from "../models/mcp-tools.model.js";
import { collectMcp } from "./mcp.collector.js";
import { McpStatus, McpTransport } from "../models/mcp.model.js";
import { listMcpTools } from "../utils/mcp-rpc.js";
import { estimateTokens } from "../utils/tokens.js";

function estimateToolTokens(tool: {
	name: string;
	description?: string;
	inputSchema?: Record<string, unknown>;
}): number {
	let text = tool.name;
	if (tool.description) text += " " + tool.description;
	if (tool.inputSchema) text += " " + JSON.stringify(tool.inputSchema);
	return estimateTokens(text);
}

export async function collectMcpTools(projectPath: string): Promise<McpToolsCollection> {
	const mcp = await collectMcp(projectPath, false);
	const enabledStdioServers = mcp.servers.filter(
		(s) => s.status === McpStatus.Enabled && s.transport === McpTransport.Stdio,
	);

	const tools: ToolInventoryItem[] = [];
	const servers = new Set<string>();

	const results = await Promise.allSettled(
		enabledStdioServers.map(async (server) => {
			const serverTools = await listMcpTools(server);
			return { server: server.name, tools: serverTools };
		}),
	);

	for (const result of results) {
		if (result.status === "fulfilled") {
			const { server, tools: serverTools } = result.value;
			servers.add(server);
			for (const tool of serverTools) {
				tools.push({
					name: tool.name,
					server,
					description: tool.description ?? "",
					inputSchema: tool.inputSchema,
					tokenEstimate: estimateToolTokens(tool),
				});
			}
		}
	}

	const totalTokens = tools.reduce((sum, t) => sum + t.tokenEstimate, 0);

	return {
		tools,
		servers: [...servers],
		totalTokens,
		totalTools: tools.length,
	};
}
