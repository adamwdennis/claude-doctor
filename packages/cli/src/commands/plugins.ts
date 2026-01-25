import { writeFileSync } from "node:fs";
import { Command } from "commander";
import type { GlobalOptions } from "../cli.js";
import { collectPlugins } from "../collectors/index.js";
import { renderPluginsJson, renderPluginsTree } from "../renderers/index.js";

export function pluginsCommand(): Command {
	return new Command("plugins")
		.description("Show installed plugins")
		.action(async (_options, cmd) => {
			const globalOpts = cmd.optsWithGlobals() as GlobalOptions;
			await runPlugins(globalOpts);
		});
}

export async function runPlugins(options: GlobalOptions): Promise<void> {
	const plugins = collectPlugins();

	let output: string;
	if (options.format === "json") {
		output = renderPluginsJson(plugins);
	} else {
		output = renderPluginsTree(plugins);
	}

	if (options.output) {
		writeFileSync(options.output, output);
		console.log(`Output written to ${options.output}`);
	} else {
		console.log(output);
	}
}
