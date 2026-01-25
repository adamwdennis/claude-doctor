export interface UsageStats {
	messages: number;
	sessions: number;
	toolCalls: number;
	tokensIn: number;
	tokensOut: number;
	costUsd: number;
	periodDays: number;
	firstActivity?: Date;
	lastActivity?: Date;
}

export interface StatsCollection {
	stats: UsageStats;
	historyPath: string | null;
	historyExists: boolean;
	statsCachePath: string | null;
	statsCacheExists: boolean;
}
