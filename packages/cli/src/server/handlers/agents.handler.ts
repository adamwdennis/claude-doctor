import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { collectAgents } from "../../collectors/agents.collector.js";
import { fileExists, getUserSettingsPath, readJsonFile } from "../../utils/index.js";
import { parseJson, readBody, sendJson } from "../routes/api.js";

interface UserSettingsJson {
	enabledPlugins?: Record<string, boolean>;
	permissions?: { allow?: string[]; deny?: string[] };
	[key: string]: unknown;
}

export async function handleAgents(
	req: IncomingMessage,
	res: ServerResponse,
	url: string,
	method: string,
): Promise<void> {
	if (method === "GET" && url === "/api/agents") {
		const agents = collectAgents();
		sendJson(res, 200, agents);
		return;
	}

	if (method === "POST" && url === "/api/agents/toggle") {
		const body = await readBody(req);
		const data = parseJson<{ pluginFullName: string; enabled: boolean }>(body);

		if (
			data === null ||
			typeof data.pluginFullName !== "string" ||
			typeof data.enabled !== "boolean"
		) {
			sendJson(res, 400, {
				error: "Body must contain { pluginFullName: string, enabled: boolean }",
			});
			return;
		}

		const settingsPath = getUserSettingsPath();
		const settings = readJsonFile<UserSettingsJson>(settingsPath) ?? {};

		if (!settings.enabledPlugins) {
			settings.enabledPlugins = {};
		}

		settings.enabledPlugins[data.pluginFullName] = data.enabled;

		const dir = dirname(settingsPath);
		mkdirSync(dir, { recursive: true });

		if (fileExists(settingsPath)) {
			copyFileSync(settingsPath, `${settingsPath}.bak`);
		}

		writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
		sendJson(res, 200, {
			success: true,
			pluginFullName: data.pluginFullName,
			enabled: data.enabled,
		});
		return;
	}

	if (method === "POST" && url === "/api/agents/toggle-agent") {
		const body = await readBody(req);
		const data = parseJson<{ agentId: string; enabled: boolean }>(body);

		if (data === null || typeof data.agentId !== "string" || typeof data.enabled !== "boolean") {
			sendJson(res, 400, {
				error: "Body must contain { agentId: string, enabled: boolean }",
			});
			return;
		}

		// agentId format: "pluginFullName::agentBaseName"
		// deny key format: "Task(pluginBaseName:agentBaseName)"
		const sepIdx = data.agentId.indexOf("::");
		if (sepIdx === -1) {
			sendJson(res, 400, { error: "Invalid agentId format" });
			return;
		}
		const pluginFullName = data.agentId.slice(0, sepIdx);
		const agentBaseName = data.agentId.slice(sepIdx + 2);
		const atIdx = pluginFullName.indexOf("@");
		const pluginBaseName = atIdx === -1 ? pluginFullName : pluginFullName.slice(0, atIdx);
		const denyKey = `Task(${pluginBaseName}:${agentBaseName})`;

		const settingsPath = getUserSettingsPath();
		const settings = readJsonFile<UserSettingsJson>(settingsPath) ?? {};

		if (!settings.permissions) {
			settings.permissions = {};
		}
		if (!settings.permissions.deny) {
			settings.permissions.deny = [];
		}

		if (data.enabled) {
			settings.permissions.deny = settings.permissions.deny.filter((entry) => entry !== denyKey);
		} else {
			if (!settings.permissions.deny.includes(denyKey)) {
				settings.permissions.deny.push(denyKey);
			}
		}

		const dir = dirname(settingsPath);
		mkdirSync(dir, { recursive: true });

		if (fileExists(settingsPath)) {
			copyFileSync(settingsPath, `${settingsPath}.bak`);
		}

		writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
		sendJson(res, 200, {
			success: true,
			agentId: data.agentId,
			enabled: data.enabled,
		});
		return;
	}

	sendJson(res, 405, { error: "Method not allowed" });
}
