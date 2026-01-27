import type { IncomingMessage, ServerResponse } from "node:http";
import { collectContext } from "../../collectors/context.collector.js";
import { sendJson } from "../routes/api.js";

export async function handleContext(
	_req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const budget = await collectContext(projectPath);
	sendJson(res, 200, budget);
}
