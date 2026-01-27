export interface SettingsPermissions {
	allow?: string[];
	deny?: string[];
}

export interface UserSettingsJson {
	enabledPlugins?: Record<string, boolean>;
	permissions?: SettingsPermissions;
	enableBetaTools?: boolean;
	[key: string]: unknown;
}
