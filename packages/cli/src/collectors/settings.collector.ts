import { type SettingsHierarchy, type SettingsLayer, SettingsSource } from "../models/index.js";
import {
	dirExists,
	getManagedPolicyDir,
	getProjectLocalSettingsPath,
	getProjectSharedSettingsPath,
	getUserSettingsPath,
	readJsonFile,
} from "../utils/index.js";

const DEFAULT_SETTINGS: Record<string, unknown> = {
	// Claude Code default settings
	enableBetaTools: false,
};

export function collectSettings(projectPath: string): SettingsHierarchy {
	const layers: SettingsLayer[] = [];

	// 1. Managed policies (highest precedence)
	const managedPolicyDir = getManagedPolicyDir();
	layers.push({
		source: SettingsSource.ManagedPolicy,
		path: managedPolicyDir,
		exists: dirExists(managedPolicyDir),
		content: null, // Would need to read all files in directory
	});

	// 2. CLI flags (not applicable here - handled at runtime)
	layers.push({
		source: SettingsSource.CliFlags,
		path: null,
		exists: false,
		content: null,
	});

	// 3. Project local settings
	const projectLocalPath = getProjectLocalSettingsPath(projectPath);
	const projectLocalContent = readJsonFile<Record<string, unknown>>(projectLocalPath);
	layers.push({
		source: SettingsSource.ProjectLocal,
		path: projectLocalPath,
		exists: projectLocalContent !== null,
		content: projectLocalContent,
	});

	// 4. Project shared settings
	const projectSharedPath = getProjectSharedSettingsPath(projectPath);
	const projectSharedContent = readJsonFile<Record<string, unknown>>(projectSharedPath);
	layers.push({
		source: SettingsSource.ProjectShared,
		path: projectSharedPath,
		exists: projectSharedContent !== null,
		content: projectSharedContent,
	});

	// 5. User settings
	const userPath = getUserSettingsPath();
	const userContent = readJsonFile<Record<string, unknown>>(userPath);
	layers.push({
		source: SettingsSource.User,
		path: userPath,
		exists: userContent !== null,
		content: userContent,
	});

	// 6. Built-in defaults (lowest precedence)
	layers.push({
		source: SettingsSource.Default,
		path: null,
		exists: true,
		content: DEFAULT_SETTINGS,
	});

	// Merge settings (highest precedence first)
	const merged: Record<string, unknown> = {};
	for (let i = layers.length - 1; i >= 0; i--) {
		const layer = layers[i];
		if (layer.content) {
			Object.assign(merged, layer.content);
		}
	}

	return { layers, merged };
}
