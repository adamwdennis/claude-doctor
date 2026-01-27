export enum HookEvent {
	PreToolUse = "PreToolUse",
	PostToolUse = "PostToolUse",
	Notification = "Notification",
	Stop = "Stop",
}

export interface HookEntry {
	event: HookEvent;
	command: string;
	matcher?: string;
	timeout?: number;
	source: string;
	sourcePath: string;
}

export interface HooksCollection {
	hooks: HookEntry[];
	totalHooks: number;
}
