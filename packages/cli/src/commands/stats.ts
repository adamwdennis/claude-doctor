import { writeFileSync } from "node:fs";
import { Command } from "commander";
import type { GlobalOptions } from "../cli.js";
import { collectStats } from "../collectors/index.js";
import { renderStatsJson, renderStatsTree } from "../renderers/index.js";

interface StatsOptions extends GlobalOptions {
	days?: number;
}

export function statsCommand(): Command {
	return new Command("stats")
		.description("Show usage statistics")
		.option("-d, --days <number>", "Number of days to analyze", "30")
		.action(async (options, cmd) => {
			const globalOpts = cmd.optsWithGlobals() as StatsOptions;
			await runStats({ ...globalOpts, days: Number.parseInt(options.days, 10) });
		});
}

export async function runStats(options: StatsOptions): Promise<void> {
	const stats = await collectStats(options.days ?? 30);

	let output: string;
	if (options.format === "json") {
		output = renderStatsJson(stats);
	} else {
		output = renderStatsTree(stats);
	}

	if (options.output) {
		writeFileSync(options.output, output);
		console.log(`Output written to ${options.output}`);
	} else {
		console.log(output);
	}
}
