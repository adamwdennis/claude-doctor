// Settings form types

export enum DefaultPermissionMode {
	Default = "default",
	Plan = "plan",
	AcceptEdits = "acceptEdits",
	BypassPermissions = "bypassPermissions",
}

export enum AutoUpdatesChannel {
	Stable = "stable",
	Latest = "latest",
}

export interface PermissionsSettings {
	allow: string[];
	deny: string[];
	ask: string[];
	additionalDirectories: string[];
	defaultMode: DefaultPermissionMode;
	disableBypassPermissionsMode?: "disable";
}

export interface HookConfig {
	command: string;
	timeout?: number;
	matcher?: string;
}

export enum HookEvent {
	PreToolUse = "PreToolUse",
	PostToolUse = "PostToolUse",
	Notification = "Notification",
	Stop = "Stop",
}

export interface HooksSettings {
	[HookEvent.PreToolUse]?: HookConfig[];
	[HookEvent.PostToolUse]?: HookConfig[];
	[HookEvent.Notification]?: HookConfig[];
	[HookEvent.Stop]?: HookConfig[];
}

export interface SandboxNetworkSettings {
	allowUnixSockets?: string[];
	allowLocalBinding?: boolean;
	httpProxyPort?: number;
	socksProxyPort?: number;
}

export interface SandboxSettings {
	enabled?: boolean;
	autoAllowBashIfSandboxed?: boolean;
	excludedCommands?: string[];
	allowUnsandboxedCommands?: boolean;
	network?: SandboxNetworkSettings;
	enableWeakerNestedSandbox?: boolean;
}

export interface AttributionSettings {
	commit?: string;
	pr?: string;
}

export interface SettingsFormData {
	// Plugins
	enabledPlugins?: Record<string, boolean>;

	// Permissions
	permissions?: PermissionsSettings;

	// Hooks
	hooks?: HooksSettings;

	// Environment
	env?: Record<string, string>;

	// MCP Servers
	enableAllProjectMcpServers?: boolean;
	enabledMcpjsonServers?: string[];
	disabledMcpjsonServers?: string[];

	// Behavior
	showTurnDuration?: boolean;
	spinnerTipsEnabled?: boolean;
	terminalProgressBarEnabled?: boolean;
	language?: string;
	outputStyle?: string;
	autoUpdatesChannel?: AutoUpdatesChannel;

	// Sandbox
	sandbox?: SandboxSettings;

	// Attribution
	attribution?: AttributionSettings;

	// Advanced
	model?: string;
	cleanupPeriodDays?: number;
	plansDirectory?: string;
	respectGitignore?: boolean;
	alwaysThinkingEnabled?: boolean;
}

export interface SectionProps {
	data: Record<string, unknown>;
	onChange: (data: Record<string, unknown>) => void;
}
