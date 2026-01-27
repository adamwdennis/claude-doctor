import type { IncomingMessage, ServerResponse } from "node:http";
import { collectHooks } from "../../collectors/hooks.collector.js";
import { sendJson } from "../routes/api.js";

export async function handleHooks(
	_req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const hooks = collectHooks(projectPath);
	sendJson(res, 200, hooks);
}
