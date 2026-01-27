import type { IncomingMessage, ServerResponse } from "node:http";
import { collectSettings } from "../../collectors/settings.collector.js";
import { debugPermission, getEffectivePermissions } from "../../analyzers/permissions.analyzer.js";
import { parseJson, readBody, sendJson } from "../routes/api.js";

export async function handlePermissions(
	req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
	url: string,
	method: string,
): Promise<void> {
	const pathParts = url.replace("/api/permissions", "").split("/").filter(Boolean);
	const action = pathParts[0];

	if (method === "GET" && action === "summary") {
		const settings = collectSettings(projectPath);
		const rules = getEffectivePermissions(settings);
		sendJson(res, 200, { rules });
		return;
	}

	if (method === "POST" && action === "debug") {
		const body = await readBody(req);
		const data = parseJson<{ query: string }>(body);
		if (!data?.query) {
			sendJson(res, 400, { error: "Missing 'query' in body" });
			return;
		}

		const settings = collectSettings(projectPath);
		const result = debugPermission(settings, data.query);
		sendJson(res, 200, result);
		return;
	}

	sendJson(res, 404, { error: "Not found" });
}
