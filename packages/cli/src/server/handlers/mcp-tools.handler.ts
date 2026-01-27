import type { IncomingMessage, ServerResponse } from "node:http";
import { collectMcpTools } from "../../collectors/mcp-tools.collector.js";
import { sendJson } from "../routes/api.js";

export async function handleMcpTools(
	_req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const tools = await collectMcpTools(projectPath);
	sendJson(res, 200, tools);
}
