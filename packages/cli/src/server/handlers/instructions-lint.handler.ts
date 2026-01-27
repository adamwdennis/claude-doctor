import type { IncomingMessage, ServerResponse } from "node:http";
import { lintInstructions } from "../../analyzers/instructions.analyzer.js";
import { sendJson } from "../routes/api.js";

export async function handleInstructionsLint(
	_req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
): Promise<void> {
	const result = lintInstructions(projectPath);
	sendJson(res, 200, result);
}
