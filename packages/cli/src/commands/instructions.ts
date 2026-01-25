import { writeFileSync } from "node:fs";
import { Command } from "commander";
import type { GlobalOptions } from "../cli.js";
import { collectInstructions } from "../collectors/index.js";
import { renderInstructionsJson, renderInstructionsTree } from "../renderers/index.js";

export function instructionsCommand(): Command {
	return new Command("instructions")
		.description("Show CLAUDE.md merge order")
		.action(async (_options, cmd) => {
			const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
			await runInstructions(globalOpts);
		});
}

export async function runInstructions(options: GlobalOptions): Promise<void> {
	const instructions = collectInstructions(options.project);

	let output: string;
	if (options.format === "json") {
		output = renderInstructionsJson(instructions);
	} else {
		output = renderInstructionsTree(instructions);
	}

	if (options.output) {
		writeFileSync(options.output, output);
		console.log(`Output written to ${options.output}`);
	} else {
		console.log(output);
	}
}
