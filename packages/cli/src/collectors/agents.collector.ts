import { readdirSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";
import { type AgentInfo, type AgentsCollection, type UserSettingsJson } from "../models/index.js";
import {
	dirExists,
	fileExists,
	getAgentsPluginsDir,
	getInstalledPluginsPath,
	getUserSettingsPath,
	readJsonFile,
} from "../utils/index.js";

interface InstalledPluginsJson {
	version?: number;
	plugins?: Record<string, Array<{ scope?: string; installPath?: string }>>;
}

interface AgentFrontmatter {
	name?: string;
	description?: string;
	model?: string;
}

function parseFrontmatter(content: string): AgentFrontmatter {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return {};

	const yaml = match[1];
	const result: AgentFrontmatter = {};

	for (const line of yaml.split("\n")) {
		const colonIdx = line.indexOf(":");
		if (colonIdx === -1) continue;

		const key = line.slice(0, colonIdx).trim();
		const value = line
			.slice(colonIdx + 1)
			.trim()
			.replace(/^["']|["']$/g, "");

		if (key === "name") result.name = value;
		else if (key === "description") result.description = value;
		else if (key === "model") result.model = value;
	}

	return result;
}

function stripPluginScope(fullName: string): string {
	const atIdx = fullName.indexOf("@");
	return atIdx === -1 ? fullName : fullName.slice(0, atIdx);
}

function buildFolderToPluginMap(installedJson: InstalledPluginsJson | null): Map<string, string> {
	const map = new Map<string, string>();
	if (!installedJson?.plugins) return map;

	for (const [fullName, installations] of Object.entries(installedJson.plugins)) {
		for (const inst of installations) {
			if (inst.installPath) {
				const folder = basename(inst.installPath);
				map.set(folder, fullName);
			}
		}
	}
	return map;
}

export function collectAgents(): AgentsCollection {
	const agentsDir = getAgentsPluginsDir();
	const agents: AgentInfo[] = [];
	let enabledCount = 0;
	let disabledCount = 0;

	if (!dirExists(agentsDir)) {
		return { agents, enabledCount, disabledCount };
	}

	const installedJson = readJsonFile<InstalledPluginsJson>(getInstalledPluginsPath());
	const folderToPlugin = buildFolderToPluginMap(installedJson);

	const userSettings = readJsonFile<UserSettingsJson>(getUserSettingsPath());
	const enabledPlugins = userSettings?.enabledPlugins ?? {};
	const denyList = userSettings?.permissions?.deny ?? [];

	let pluginFolders: string[];
	try {
		pluginFolders = readdirSync(agentsDir);
	} catch {
		return { agents, enabledCount, disabledCount };
	}

	for (const pluginFolder of pluginFolders) {
		const agentsSubDir = join(agentsDir, pluginFolder, "agents");
		if (!dirExists(agentsSubDir)) continue;

		const pluginFullName = folderToPlugin.get(pluginFolder) ?? pluginFolder;
		const isEnabled = enabledPlugins[pluginFullName] !== false;

		let mdFiles: string[];
		try {
			mdFiles = readdirSync(agentsSubDir).filter((f) => f.endsWith(".md"));
		} catch {
			continue;
		}

		for (const mdFile of mdFiles) {
			const filePath = join(agentsSubDir, mdFile);
			if (!fileExists(filePath)) continue;

			let content: string;
			try {
				content = readFileSync(filePath, "utf-8");
			} catch {
				continue;
			}

			const fm = parseFrontmatter(content);
			const agentBaseName = basename(mdFile, ".md");
			const agentId = `${pluginFullName}::${agentBaseName}`;
			const denyKey = `Task(${stripPluginScope(pluginFullName)}:${agentBaseName})`;
			const agentEnabled = isEnabled && !denyList.includes(denyKey);

			agents.push({
				name: fm.name ?? basename(mdFile, ".md"),
				description: fm.description ?? "",
				pluginName: pluginFolder,
				pluginFullName,
				model: fm.model ?? "",
				filePath,
				enabled: isEnabled,
				agentId,
				agentEnabled,
			});

			if (agentEnabled) enabledCount++;
			else disabledCount++;
		}
	}

	return { agents, enabledCount, disabledCount };
}
