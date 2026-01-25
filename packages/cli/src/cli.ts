import { Command } from "commander";
import { configCommand } from "./commands/config.js";
import { diagnoseCommand } from "./commands/diagnose.js";
import { instructionsCommand } from "./commands/instructions.js";
import { mcpCommand } from "./commands/mcp.js";
import { pluginsCommand } from "./commands/plugins.js";
import { serveCommand } from "./commands/serve.js";
import { statsCommand } from "./commands/stats.js";

export interface GlobalOptions {
	project: string;
	format: "tree" | "json" | "html";
	output?: string;
}

export function createCli(): Command {
	const program = new Command();

	program
		.name("claude-doctor")
		.description("Diagnose Claude Code configuration")
		.version("0.1.0")
		.option("-p, --project <path>", "Project directory", process.cwd())
		.option("-f, --format <type>", "Output format: tree|json|html", "tree")
		.option("-o, --output <file>", "Output file");

	program.addCommand(configCommand());
	program.addCommand(mcpCommand());
	program.addCommand(pluginsCommand());
	program.addCommand(instructionsCommand());
	program.addCommand(statsCommand());
	program.addCommand(diagnoseCommand());
	program.addCommand(serveCommand());

	// Default action runs diagnose
	program.action(async (options: GlobalOptions) => {
		const { runDiagnose } = await import("./commands/diagnose.js");
		await runDiagnose(options);
	});

	return program;
}
