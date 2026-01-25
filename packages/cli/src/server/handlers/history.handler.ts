import type { IncomingMessage, ServerResponse } from "node:http";
import { collectHistory } from "../../collectors/history.collector.js";
import { sendJson } from "../routes/api.js";

export async function handleHistory(
	_req: IncomingMessage,
	res: ServerResponse,
	url: string,
): Promise<void> {
	const urlObj = new URL(url, "http://localhost");
	const limitParam = urlObj.searchParams.get("limit");
	const limit = limitParam ? parseInt(limitParam, 10) : 100;

	const history = collectHistory(limit);
	sendJson(res, 200, history);
}
