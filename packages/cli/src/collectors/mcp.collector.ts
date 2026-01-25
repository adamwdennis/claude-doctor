import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
	type McpCollection,
	type McpConnectivityResult,
	type McpServerConfig,
	McpSource,
	McpStatus,
	McpTransport,
} from "../models/index.js";
import { fileExists, getProjectMcpPath, getUserMcpPath, readJsonFile } from "../utils/index.js";

function commandExists(cmd: string): boolean {
	// If it's an absolute/relative path, check file exists
	if (cmd.includes("/") || cmd.includes("\\")) {
		return existsSync(resolve(cmd));
	}
	// Otherwise check PATH using which/where
	try {
		const whichCmd = process.platform === "win32" ? "where" : "which";
		execSync(`${whichCmd} ${cmd}`, { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

interface McpServerRaw {
	type?: string;
	url?: string;
	command?: string;
	args?: string[];
	env?: Record<string, string>;
	disabled?: boolean;
}

interface McpJsonConfig {
	mcpServers?: Record<string, McpServerRaw>;
}

function determineTransport(config: McpServerRaw): McpTransport {
	if (config.type === "http" || config.url?.startsWith("http")) {
		return McpTransport.Http;
	}
	if (config.type === "sse" || config.url?.includes("sse")) {
		return McpTransport.Sse;
	}
	if (config.command) {
		return McpTransport.Stdio;
	}
	return McpTransport.Http;
}

function parseServers(json: McpJsonConfig | null, source: McpSource): McpServerConfig[] {
	if (!json?.mcpServers) return [];

	return Object.entries(json.mcpServers).map(([name, config]) => ({
		name,
		source,
		transport: determineTransport(config),
		status: config.disabled ? McpStatus.Disabled : McpStatus.Enabled,
		url: config.url,
		command: config.command,
		args: config.args,
		env: config.env,
		disabled: config.disabled,
	}));
}

export async function checkConnectivity(server: McpServerConfig): Promise<McpConnectivityResult> {
	if (server.transport === McpTransport.Stdio) {
		// Check if command exists in PATH or as file
		if (server.command) {
			const exists = commandExists(server.command);
			return {
				reachable: exists,
				error: exists ? undefined : `Command not found: ${server.command}`,
			};
		}
		return { reachable: false, error: "No command specified" };
	}

	if (!server.url) {
		return { reachable: false, error: "No URL specified" };
	}

	try {
		const start = Date.now();
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(server.url, {
			method: "HEAD",
			signal: controller.signal,
		});

		clearTimeout(timeout);

		return {
			reachable: response.ok || response.status < 500,
			latencyMs: Date.now() - start,
		};
	} catch (error) {
		return {
			reachable: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function collectMcp(
	projectPath: string,
	checkConnections = false,
): Promise<McpCollection> {
	const sources: McpCollection["sources"] = [];
	const servers: McpServerConfig[] = [];

	// 1. User global (~/.claude.json)
	const userMcpPath = getUserMcpPath();
	const userMcpExists = fileExists(userMcpPath);
	sources.push({
		source: McpSource.UserGlobal,
		path: userMcpPath,
		exists: userMcpExists,
	});
	if (userMcpExists) {
		const userJson = readJsonFile<McpJsonConfig>(userMcpPath);
		servers.push(...parseServers(userJson, McpSource.UserGlobal));
	}

	// 2. Project (.mcp.json)
	const projectMcpPath = getProjectMcpPath(projectPath);
	const projectMcpExists = fileExists(projectMcpPath);
	sources.push({
		source: McpSource.Project,
		path: projectMcpPath,
		exists: projectMcpExists,
	});
	if (projectMcpExists) {
		const projectJson = readJsonFile<McpJsonConfig>(projectMcpPath);
		servers.push(...parseServers(projectJson, McpSource.Project));
	}

	// Check connectivity if requested
	if (checkConnections) {
		for (const server of servers) {
			if (server.status === McpStatus.Enabled) {
				server.connectivity = await checkConnectivity(server);
			}
		}
	}

	return { servers, sources };
}
