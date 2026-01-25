export enum FileTraceType {
	Instructions = "instructions",
	Settings = "settings",
	Mcp = "mcp",
	ClaudeDir = "claude-dir",
}

export interface FileTraceEntry {
	path: string;
	type: FileTraceType;
	exists: boolean;
	size?: number;
}

export interface FileTraceLevel {
	directory: string;
	isProjectRoot: boolean;
	isUserHome: boolean;
	files: FileTraceEntry[];
}

export interface FileTraceCollection {
	levels: FileTraceLevel[];
	projectPath: string;
	homePath: string;
}
