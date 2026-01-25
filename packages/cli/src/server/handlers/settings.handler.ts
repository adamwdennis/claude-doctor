import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { collectSettings } from "../../collectors/settings.collector.js";
import { SettingsSource } from "../../models/index.js";
import {
	fileExists,
	getProjectLocalSettingsPath,
	getProjectSharedSettingsPath,
	getUserSettingsPath,
} from "../../utils/index.js";
import { parseJson, readBody, sendJson } from "../routes/api.js";

type WritableLayer = "user" | "project-local" | "project-shared";

const LAYER_MAP: Record<WritableLayer, SettingsSource> = {
	user: SettingsSource.User,
	"project-local": SettingsSource.ProjectLocal,
	"project-shared": SettingsSource.ProjectShared,
};

export async function handleSettings(
	req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
	url: string,
	method: string,
): Promise<void> {
	const pathParts = url.replace("/api/settings", "").split("/").filter(Boolean);
	const layer = pathParts[0] as WritableLayer | undefined;

	if (method === "GET") {
		const settings = collectSettings(projectPath);

		if (!layer) {
			sendJson(res, 200, settings);
			return;
		}

		const source = LAYER_MAP[layer];
		if (!source) {
			sendJson(res, 400, { error: `Invalid layer: ${layer}` });
			return;
		}

		const found = settings.layers.find((l) => l.source === source);
		if (!found) {
			sendJson(res, 404, { error: "Layer not found" });
			return;
		}

		// Transform to match expected API shape
		sendJson(res, 200, {
			layer,
			path: found.path,
			exists: found.exists,
			data: found.content ?? {},
		});
		return;
	}

	if (method === "PUT" || method === "POST") {
		if (!layer || !LAYER_MAP[layer]) {
			sendJson(res, 400, { error: "Must specify layer: user, project-local, project-shared" });
			return;
		}

		const body = await readBody(req);
		const content = parseJson<Record<string, unknown>>(body);

		if (!content) {
			sendJson(res, 400, { error: "Invalid JSON body" });
			return;
		}

		const path = getPathForLayer(layer, projectPath);
		writeJsonWithBackup(path, content);
		sendJson(res, 200, { success: true, path });
		return;
	}

	sendJson(res, 405, { error: "Method not allowed" });
}

function getPathForLayer(layer: WritableLayer, projectPath: string): string {
	switch (layer) {
		case "user":
			return getUserSettingsPath();
		case "project-local":
			return getProjectLocalSettingsPath(projectPath);
		case "project-shared":
			return getProjectSharedSettingsPath(projectPath);
	}
}

function writeJsonWithBackup(path: string, content: Record<string, unknown>): void {
	const dir = dirname(path);
	mkdirSync(dir, { recursive: true });

	if (fileExists(path)) {
		copyFileSync(path, `${path}.bak`);
	}

	writeFileSync(path, JSON.stringify(content, null, 2));
}
