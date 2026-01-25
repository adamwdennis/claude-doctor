import { homedir } from "node:os";
import { join, resolve } from "node:path";

export function getHomePath(): string {
	return homedir();
}

export function getClaudeUserDir(): string {
	return join(getHomePath(), ".claude");
}

export function getUserSettingsPath(): string {
	return join(getClaudeUserDir(), "settings.json");
}

export function getUserInstructionsPath(): string {
	return join(getClaudeUserDir(), "CLAUDE.md");
}

export function getUserMcpPath(): string {
	return join(getHomePath(), ".claude.json");
}

export function getInstalledPluginsPath(): string {
	return join(getClaudeUserDir(), "plugins", "installed_plugins.json");
}

export function getStatsCachePath(): string {
	return join(getClaudeUserDir(), "stats-cache.json");
}

export function getHistoryPath(): string {
	return join(getClaudeUserDir(), "history.jsonl");
}

export function getManagedPolicyDir(): string {
	return "/etc/claude-code";
}

export function getProjectClaudeDir(projectPath: string): string {
	return join(resolve(projectPath), ".claude");
}

export function getProjectLocalSettingsPath(projectPath: string): string {
	return join(getProjectClaudeDir(projectPath), "settings.local.json");
}

export function getProjectSharedSettingsPath(projectPath: string): string {
	return join(getProjectClaudeDir(projectPath), "settings.json");
}

export function getProjectMcpPath(projectPath: string): string {
	return join(resolve(projectPath), ".mcp.json");
}

export function getProjectClaudeDirInstructionsPath(projectPath: string): string {
	return join(getProjectClaudeDir(projectPath), "CLAUDE.md");
}

export function getProjectRootInstructionsPath(projectPath: string): string {
	return join(resolve(projectPath), "CLAUDE.md");
}
