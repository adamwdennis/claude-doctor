import type { IncomingMessage, ServerResponse } from "node:http";
import { collectFileTrace } from "../../collectors/filetrace.collector.js";
import { sendJson } from "../routes/api.js";

export async function handleFileTrace(
	_req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const trace = collectFileTrace(projectPath);
	sendJson(res, 200, trace);
}
