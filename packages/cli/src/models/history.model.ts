export enum HistoryEntryType {
	SessionStart = "session_start",
	Message = "message",
	ToolCall = "tool_call",
	ApiRequest = "api_request",
	ApiResponse = "api_response",
}

export interface HistoryEntry {
	timestamp: string;
	type: HistoryEntryType;
	sessionId?: string;
	toolName?: string;
	tokensIn?: number;
	tokensOut?: number;
	costUsd?: number;
	message?: string;
	model?: string;
	cwd?: string;
}

export interface Session {
	id: string;
	startedAt: string;
	endedAt?: string;
	messageCount: number;
	toolCalls: string[];
	tokensIn: number;
	tokensOut: number;
	costUsd: number;
	cwd?: string;
	model?: string;
}

export interface HistoryCollection {
	sessions: Session[];
	totals: {
		sessionCount: number;
		messageCount: number;
		toolCallCount: number;
		tokensIn: number;
		tokensOut: number;
		costUsd: number;
	};
	dateRange?: {
		first: string;
		last: string;
	};
}

export interface SessionDetail {
	session: Session;
	entries: HistoryEntry[];
	entryCount: number;
}
