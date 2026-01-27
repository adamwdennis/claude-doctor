import { spawn } from "node:child_process";
import type { McpServerConfig } from "../models/mcp.model.js";

export interface McpToolInfo {
	name: string;
	description?: string;
	inputSchema?: Record<string, unknown>;
}

interface JsonRpcResponse {
	jsonrpc: string;
	id: number;
	result?: {
		tools?: McpToolInfo[];
	};
	error?: {
		code: number;
		message: string;
	};
}

/**
 * List tools from an MCP server via stdio JSON-RPC.
 * Sends initialize + tools/list, then kills process.
 */
export async function listMcpTools(
	server: McpServerConfig,
	timeoutMs = 10000,
): Promise<McpToolInfo[]> {
	if (!server.command) return [];

	return new Promise((resolve) => {
		const proc = spawn(server.command!, server.args ?? [], {
			env: { ...process.env, ...server.env },
			stdio: ["pipe", "pipe", "pipe"],
		});

		let stdout = "";
		let resolved = false;

		const timer = setTimeout(() => {
			if (!resolved) {
				resolved = true;
				proc.kill();
				resolve([]);
			}
		}, timeoutMs);

		proc.stdout.on("data", (chunk: Buffer) => {
			stdout += chunk.toString();
			// Try parsing each complete JSON-RPC response
			const lines = stdout.split("\n");
			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				try {
					const msg = JSON.parse(trimmed) as JsonRpcResponse;
					if (msg.result?.tools && !resolved) {
						resolved = true;
						clearTimeout(timer);
						proc.kill();
						resolve(msg.result.tools);
					}
				} catch {
					// not complete JSON yet
				}
			}
		});

		proc.on("error", () => {
			if (!resolved) {
				resolved = true;
				clearTimeout(timer);
				resolve([]);
			}
		});

		proc.on("close", () => {
			if (!resolved) {
				resolved = true;
				clearTimeout(timer);
				resolve([]);
			}
		});

		// Send initialize
		const initMsg = JSON.stringify({
			jsonrpc: "2.0",
			id: 1,
			method: "initialize",
			params: {
				protocolVersion: "2024-11-05",
				capabilities: {},
				clientInfo: { name: "claude-doctor", version: "1.0.0" },
			},
		});
		proc.stdin.write(initMsg + "\n");

		// Send tools/list after brief delay for handshake
		setTimeout(() => {
			if (!resolved) {
				const toolsMsg = JSON.stringify({
					jsonrpc: "2.0",
					id: 2,
					method: "tools/list",
					params: {},
				});
				proc.stdin.write(toolsMsg + "\n");
			}
		}, 500);
	});
}
