import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import { analyzeConflicts, analyzeIssues } from "../analyzers/index.js";
import type { GlobalOptions } from "../cli.js";
import {
	collectInstructions,
	collectMcp,
	collectPlugins,
	collectSettings,
	collectStats,
} from "../collectors/index.js";
import type { DiagnosticReport } from "../models/index.js";
import {
	renderDiagnosticReport,
	renderDiagnosticReportHtml,
	renderDiagnosticReportJson,
} from "../renderers/index.js";
import { createSpinner, shouldShowSpinner } from "../utils/index.js";

interface DiagnoseOptions extends GlobalOptions {
	check?: boolean;
	days?: number;
}

export function diagnoseCommand(): Command {
	return new Command("diagnose")
		.description("Full diagnostic report")
		.option("-c, --check", "Check MCP connectivity")
		.option("-d, --days <number>", "Days for stats analysis", "30")
		.action(async (options, cmd) => {
			const globalOpts = cmd.optsWithGlobals() as DiagnoseOptions;
			await runDiagnose({
				...globalOpts,
				check: options.check,
				days: options.days ? Number.parseInt(options.days, 10) : 30,
			});
		});
}

export async function runDiagnose(
	options: GlobalOptions & { check?: boolean; days?: number },
): Promise<void> {
	const projectPath = resolve(options.project);
	const spinner = createSpinner();

	if (shouldShowSpinner(options.format)) {
		spinner.start();
	}

	// Collect all data
	const settings = collectSettings(projectPath);
	const mcp = await collectMcp(projectPath, options.check);
	const plugins = collectPlugins();
	const instructions = collectInstructions(projectPath);
	const stats = await collectStats(options.days ?? 30);

	spinner.stop();

	// Analyze
	const conflicts = analyzeConflicts(settings);
	const issues = analyzeIssues(settings, mcp, plugins, instructions, stats);

	const report: DiagnosticReport = {
		settings,
		mcp,
		plugins,
		instructions,
		stats,
		conflicts,
		issues,
		generatedAt: new Date(),
		projectPath,
	};

	let output: string;
	switch (options.format) {
		case "json":
			output = renderDiagnosticReportJson(report);
			break;
		case "html":
			output = renderDiagnosticReportHtml(report);
			break;
		default:
			output = renderDiagnosticReport(report);
	}

	if (options.output) {
		writeFileSync(options.output, output);
		console.log(`Output written to ${options.output}`);
	} else {
		console.log(output);
	}
}
