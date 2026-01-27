export enum SettingsSource {
	ManagedPolicy = "managed_policy",
	CliFlags = "cli_flags",
	ProjectLocal = "project_local",
	ProjectShared = "project_shared",
	User = "user",
	Default = "default",
}

export const SETTINGS_SOURCE_LABELS: Record<SettingsSource, string> = {
	[SettingsSource.ManagedPolicy]: "Managed Policy",
	[SettingsSource.CliFlags]: "CLI Flags",
	[SettingsSource.ProjectLocal]: "Project Local",
	[SettingsSource.ProjectShared]: "Project Shared",
	[SettingsSource.User]: "User",
	[SettingsSource.Default]: "Built-in Defaults",
};

export interface SettingsLayer {
	source: SettingsSource;
	path: string | null;
	exists: boolean;
	content: Record<string, unknown> | null;
}

export interface SettingsHierarchy {
	layers: SettingsLayer[];
	merged: Record<string, unknown>;
}

export interface SettingsConflict {
	key: string;
	values: Array<{
		source: SettingsSource;
		value: unknown;
	}>;
}

// Effective Config (F2)
export interface EffectiveConfigOverride {
	source: SettingsSource;
	value: unknown;
}

export interface EffectiveConfigEntry {
	key: string;
	value: unknown;
	source: SettingsSource;
	overrides: EffectiveConfigOverride[];
}

export interface EffectiveConfig {
	entries: EffectiveConfigEntry[];
}
