import { writeFileSync } from "node:fs";
import { Command } from "commander";
import type { GlobalOptions } from "../cli.js";
import { collectMcp } from "../collectors/index.js";
import { renderMcpJson, renderMcpTree } from "../renderers/index.js";
import { createSpinner, shouldShowSpinner } from "../utils/index.js";

interface McpOptions extends GlobalOptions {
	check?: boolean;
}

export function mcpCommand(): Command {
	return new Command("mcp")
		.description("Show MCP server configuration")
		.option("-c, --check", "Check connectivity to HTTP/SSE servers")
		.action(async (options, cmd) => {
			const globalOpts = cmd.optsWithGlobals() as McpOptions;
			await runMcp({ ...globalOpts, ...options });
		});
}

export async function runMcp(options: McpOptions): Promise<void> {
	const spinner = createSpinner();

	if (shouldShowSpinner(options.format)) {
		spinner.start();
	}

	const mcp = await collectMcp(options.project, options.check);

	spinner.stop();

	let output: string;
	if (options.format === "json") {
		output = renderMcpJson(mcp);
	} else {
		output = renderMcpTree(mcp);
	}

	if (options.output) {
		writeFileSync(options.output, output);
		console.log(`Output written to ${options.output}`);
	} else {
		console.log(output);
	}
}
