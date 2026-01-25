export enum PluginStatus {
	Enabled = "enabled",
	Disabled = "disabled",
}

export interface PluginInfo {
	name: string;
	package: string;
	fullName: string;
	status: PluginStatus;
	version?: string;
	description?: string;
	installedPath?: string;
}

export interface PluginsCollection {
	plugins: PluginInfo[];
	enabledCount: number;
	disabledCount: number;
	installedPluginsPath: string | null;
	installedPluginsExists: boolean;
}
