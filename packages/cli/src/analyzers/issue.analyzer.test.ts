import { describe, expect, it } from "vitest";
import {
	InstructionsSource,
	IssueSeverity,
	McpSource,
	McpStatus,
	McpTransport,
	PluginStatus,
	SettingsSource,
} from "../models/index.js";
import { analyzeIssues } from "./issue.analyzer.js";

describe("issue analyzer", () => {
	const baseSettings = {
		layers: [{ source: SettingsSource.User, path: "/user", exists: true, content: {} }],
		merged: {},
	};

	const baseMcp = {
		servers: [],
		sources: [],
	};

	const basePlugins = {
		plugins: [],
		enabledCount: 0,
		disabledCount: 0,
		installedPluginsPath: "/plugins",
		installedPluginsExists: true,
	};

	const baseInstructions = {
		layers: [
			{ source: InstructionsSource.User, path: "/user/CLAUDE.md", exists: true, lineCount: 10 },
		],
		totalLines: 10,
	};

	const baseStats = {
		stats: {
			messages: 100,
			sessions: 10,
			toolCalls: 50,
			tokensIn: 0,
			tokensOut: 0,
			costUsd: 0,
			periodDays: 30,
		},
		historyPath: "/history",
		historyExists: true,
		statsCachePath: "/cache",
		statsCacheExists: true,
	};

	it("reports warning for missing project instructions", () => {
		const instructions = {
			layers: [
				{
					source: InstructionsSource.ProjectClaudeDir,
					path: "/p/.claude/CLAUDE.md",
					exists: false,
					lineCount: 0,
				},
				{
					source: InstructionsSource.ProjectRoot,
					path: "/p/CLAUDE.md",
					exists: false,
					lineCount: 0,
				},
				{ source: InstructionsSource.User, path: "/user/CLAUDE.md", exists: true, lineCount: 10 },
			],
			totalLines: 10,
		};

		const issues = analyzeIssues(baseSettings, baseMcp, basePlugins, instructions, baseStats);

		const warning = issues.find(
			(i) => i.severity === IssueSeverity.Warning && i.category === "instructions",
		);
		expect(warning).toBeDefined();
		expect(warning?.message).toContain("project-level CLAUDE.md");
	});

	it("reports info for disabled MCP servers", () => {
		const mcp = {
			servers: [
				{
					name: "test-server",
					source: McpSource.UserGlobal,
					transport: McpTransport.Http,
					status: McpStatus.Disabled,
				},
			],
			sources: [],
		};

		const issues = analyzeIssues(baseSettings, mcp, basePlugins, baseInstructions, baseStats);

		const info = issues.find((i) => i.category === "mcp" && i.message.includes("disabled"));
		expect(info).toBeDefined();
	});

	it("reports error for unreachable MCP servers", () => {
		const mcp = {
			servers: [
				{
					name: "test-server",
					source: McpSource.UserGlobal,
					transport: McpTransport.Http,
					status: McpStatus.Enabled,
					connectivity: { reachable: false, error: "Connection refused" },
				},
			],
			sources: [],
		};

		const issues = analyzeIssues(baseSettings, mcp, basePlugins, baseInstructions, baseStats);

		const error = issues.find((i) => i.severity === IssueSeverity.Error);
		expect(error).toBeDefined();
		expect(error?.message).toContain("unreachable");
	});

	it("reports info for disabled plugins", () => {
		const plugins = {
			plugins: [
				{ name: "test", package: "pkg", fullName: "test@pkg", status: PluginStatus.Disabled },
			],
			enabledCount: 0,
			disabledCount: 1,
			installedPluginsPath: "/plugins",
			installedPluginsExists: true,
		};

		const issues = analyzeIssues(baseSettings, baseMcp, plugins, baseInstructions, baseStats);

		const info = issues.find((i) => i.category === "plugins" && i.message.includes("disabled"));
		expect(info).toBeDefined();
	});
});
