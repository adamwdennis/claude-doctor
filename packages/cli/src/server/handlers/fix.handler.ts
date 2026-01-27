import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { FixType } from "../../models/diagnostic.model.js";
import { getProjectRootInstructionsPath, getUserSettingsPath } from "../../utils/index.js";
import { parseJson, readBody, sendJson } from "../routes/api.js";

interface FixRequest {
	fixType: FixType;
	payload: Record<string, unknown>;
}

const CLAUDE_MD_TEMPLATE = `# Project Instructions

## Code Conventions

- Follow existing patterns in the codebase
- Write clear, maintainable code

## Testing

- Run tests before committing

## Commit Messages

- Use conventional commit format
`;

const SETTINGS_TEMPLATE: Record<string, unknown> = {
	permissions: {
		allow: [],
		deny: [],
	},
};

export async function handleFix(
	req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const body = await readBody(req);
	const data = parseJson<FixRequest>(body);

	if (!data?.fixType) {
		sendJson(res, 400, { error: "Missing fixType" });
		return;
	}

	switch (data.fixType) {
		case FixType.CreateFile: {
			const fileType = data.payload.fileType as string;
			let path: string;
			let content: string;

			if (fileType === "claude-md") {
				path = getProjectRootInstructionsPath(projectPath);
				content = CLAUDE_MD_TEMPLATE;
			} else if (fileType === "settings") {
				path = getUserSettingsPath();
				content = JSON.stringify(SETTINGS_TEMPLATE, null, 2);
			} else {
				sendJson(res, 400, { error: `Unknown fileType: ${fileType}` });
				return;
			}

			mkdirSync(dirname(path), { recursive: true });
			writeFileSync(path, content);
			sendJson(res, 200, { success: true, path });
			return;
		}

		case FixType.NavigateToTab: {
			// Client-side only — just acknowledge
			sendJson(res, 200, { success: true, navigateTo: data.payload.tab });
			return;
		}

		default:
			sendJson(res, 400, { error: `Unsupported fixType: ${data.fixType}` });
	}
}
