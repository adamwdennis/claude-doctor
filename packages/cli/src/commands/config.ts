import { writeFileSync } from "node:fs";
import { Command } from "commander";
import type { GlobalOptions } from "../cli.js";
import { collectSettings } from "../collectors/index.js";
import { renderSettingsJson, renderSettingsTree } from "../renderers/index.js";

export function configCommand(): Command {
	return new Command("config")
		.description("Show settings hierarchy")
		.action(async (_options, cmd) => {
			const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
			await runConfig(globalOpts);
		});
}

export async function runConfig(options: GlobalOptions): Promise<void> {
	const settings = collectSettings(options.project);

	let output: string;
	if (options.format === "json") {
		output = renderSettingsJson(settings);
	} else {
		output = renderSettingsTree(settings);
	}

	if (options.output) {
		writeFileSync(options.output, output);
		console.log(`Output written to ${options.output}`);
	} else {
		console.log(output);
	}
}
