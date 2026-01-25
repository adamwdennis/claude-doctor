import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { collectPlugins } from "../../collectors/plugins.collector.js";
import { fileExists, getUserSettingsPath, readJsonFile } from "../../utils/index.js";
import { parseJson, readBody, sendJson } from "../routes/api.js";

interface UserSettingsJson {
	enabledPlugins?: Record<string, boolean>;
	[key: string]: unknown;
}

export async function handlePlugins(
	req: IncomingMessage,
	res: ServerResponse,
	url: string,
	method: string,
): Promise<void> {
	const pathParts = url.replace("/api/plugins", "").split("/").filter(Boolean);
	const pluginName = pathParts.join("/"); // Handle names like "foo@bar"

	if (method === "GET") {
		const plugins = collectPlugins();
		sendJson(res, 200, plugins);
		return;
	}

	if (method === "PUT") {
		if (!pluginName) {
			sendJson(res, 400, { error: "Plugin name required" });
			return;
		}

		const body = await readBody(req);
		const data = parseJson<{ enabled: boolean }>(body);

		if (data === null || typeof data.enabled !== "boolean") {
			sendJson(res, 400, { error: "Body must contain { enabled: boolean }" });
			return;
		}

		const settingsPath = getUserSettingsPath();
		const settings = readJsonFile<UserSettingsJson>(settingsPath) ?? {};

		if (!settings.enabledPlugins) {
			settings.enabledPlugins = {};
		}

		settings.enabledPlugins[pluginName] = data.enabled;

		writeJsonWithBackup(settingsPath, settings);
		sendJson(res, 200, { success: true, pluginName, enabled: data.enabled });
		return;
	}

	sendJson(res, 405, { error: "Method not allowed" });
}

function writeJsonWithBackup(path: string, content: unknown): void {
	const dir = dirname(path);
	mkdirSync(dir, { recursive: true });

	if (fileExists(path)) {
		copyFileSync(path, `${path}.bak`);
	}

	writeFileSync(path, JSON.stringify(content, null, 2));
}
