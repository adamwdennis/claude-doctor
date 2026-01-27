import {
	type PluginInfo,
	PluginStatus,
	type PluginsCollection,
	type UserSettingsJson,
} from "../models/index.js";
import {
	fileExists,
	getInstalledPluginsPath,
	getUserSettingsPath,
	readJsonFile,
} from "../utils/index.js";

interface PluginInstallation {
	scope?: string;
	installPath?: string;
	version?: string;
	installedAt?: string;
	lastUpdated?: string;
	projectPath?: string;
}

interface InstalledPluginsJson {
	version?: number;
	plugins?: Record<string, PluginInstallation[]>;
}

export function collectPlugins(): PluginsCollection {
	const installedPluginsPath = getInstalledPluginsPath();
	const installedPluginsExists = fileExists(installedPluginsPath);

	const plugins: PluginInfo[] = [];
	let enabledCount = 0;
	let disabledCount = 0;

	if (installedPluginsExists) {
		const installedJson = readJsonFile<InstalledPluginsJson>(installedPluginsPath);
		const userSettingsPath = getUserSettingsPath();
		const userSettings = readJsonFile<UserSettingsJson>(userSettingsPath);
		const enabledPlugins = userSettings?.enabledPlugins ?? {};

		if (installedJson?.plugins && typeof installedJson.plugins === "object") {
			for (const [fullName, installations] of Object.entries(installedJson.plugins)) {
				const [name, packageName] = fullName.split("@");
				const installation = installations[0]; // Take first installation
				const isEnabled = enabledPlugins[fullName] !== false;

				plugins.push({
					name: name ?? "unknown",
					package: packageName ?? "unknown",
					fullName,
					status: isEnabled ? PluginStatus.Enabled : PluginStatus.Disabled,
					version: installation?.version,
					installedPath: installation?.installPath,
				});

				if (isEnabled) {
					enabledCount++;
				} else {
					disabledCount++;
				}
			}
		}
	}

	return {
		plugins,
		enabledCount,
		disabledCount,
		installedPluginsPath,
		installedPluginsExists,
	};
}
