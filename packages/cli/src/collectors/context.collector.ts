import {
	type ContextBudget,
	type ContextSourceEntry,
	ContextSource,
} from "../models/context.model.js";
import { estimateTokens } from "../utils/tokens.js";
import { collectMergedInstructions } from "./instructions-merged.collector.js";
import { collectMcpTools } from "./mcp-tools.collector.js";
import { collectHooks } from "./hooks.collector.js";
import { collectSettings } from "./settings.collector.js";

const SYSTEM_PROMPT_TOKENS = 3500;
const MODEL_LIMIT = 200000;

export async function collectContext(projectPath: string): Promise<ContextBudget> {
	const sources: ContextSourceEntry[] = [];

	// System prompt (constant estimate)
	sources.push({
		source: ContextSource.SystemPrompt,
		label: "System Prompt",
		tokenEstimate: SYSTEM_PROMPT_TOKENS,
		details: "Base system prompt injected by Claude Code",
	});

	// Instructions (CLAUDE.md files)
	const instructions = collectMergedInstructions(projectPath);
	sources.push({
		source: ContextSource.Instructions,
		label: "CLAUDE.md Instructions",
		tokenEstimate: instructions.totalTokens,
		details: `${instructions.blocks.length} file(s), ${instructions.totalLines} lines`,
	});

	// MCP tools
	const mcpTools = await collectMcpTools(projectPath);
	sources.push({
		source: ContextSource.McpTools,
		label: "MCP Tool Definitions",
		tokenEstimate: mcpTools.totalTokens,
		details: `${mcpTools.totalTools} tools from ${mcpTools.servers.length} server(s)`,
	});

	// Permissions
	const settings = collectSettings(projectPath);
	const permissionsText = JSON.stringify(settings.merged.permissions ?? {});
	const permTokens = estimateTokens(permissionsText);
	sources.push({
		source: ContextSource.Permissions,
		label: "Permissions Rules",
		tokenEstimate: permTokens,
		details: `Merged permission rules`,
	});

	// Hooks overhead
	const hooks = collectHooks(projectPath);
	const hooksText = hooks.hooks.map((h) => `${h.event}: ${h.command}`).join("\n");
	const hookTokens = estimateTokens(hooksText);
	sources.push({
		source: ContextSource.Hooks,
		label: "Hooks",
		tokenEstimate: hookTokens,
		details: `${hooks.totalHooks} hook(s)`,
	});

	const totalTokens = sources.reduce((sum, s) => sum + s.tokenEstimate, 0);
	const usagePercent = Math.round((totalTokens / MODEL_LIMIT) * 100 * 10) / 10;

	return {
		sources,
		totalTokens,
		modelLimit: MODEL_LIMIT,
		usagePercent,
	};
}
