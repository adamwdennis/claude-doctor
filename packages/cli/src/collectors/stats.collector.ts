import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import type { StatsCollection, UsageStats } from "../models/index.js";
import { fileExists, getHistoryPath, getStatsCachePath, readJsonFile } from "../utils/index.js";

interface StatsCacheJson {
	totalMessages?: number;
	totalSessions?: number;
	totalToolCalls?: number;
	totalTokensIn?: number;
	totalTokensOut?: number;
	totalCostUsd?: number;
}

interface HistoryEntry {
	timestamp?: string;
	type?: string;
	toolName?: string;
	tokensIn?: number;
	tokensOut?: number;
	costUsd?: number;
}

async function parseHistory(historyPath: string, periodDays: number): Promise<UsageStats> {
	const stats: UsageStats = {
		messages: 0,
		sessions: 0,
		toolCalls: 0,
		tokensIn: 0,
		tokensOut: 0,
		costUsd: 0,
		periodDays,
	};

	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - periodDays);

	const sessionIds = new Set<string>();
	let firstActivity: Date | undefined;
	let lastActivity: Date | undefined;

	try {
		const fileStream = createReadStream(historyPath);
		const rl = createInterface({
			input: fileStream,
			crlfDelay: Number.POSITIVE_INFINITY,
		});

		for await (const line of rl) {
			try {
				const entry = JSON.parse(line) as HistoryEntry;
				const timestamp = entry.timestamp ? new Date(entry.timestamp) : null;

				if (timestamp && timestamp < cutoffDate) continue;

				if (timestamp) {
					if (!firstActivity || timestamp < firstActivity) {
						firstActivity = timestamp;
					}
					if (!lastActivity || timestamp > lastActivity) {
						lastActivity = timestamp;
					}
				}

				if (entry.type === "message") {
					stats.messages++;
				} else if (entry.type === "tool_call" || entry.toolName) {
					stats.toolCalls++;
				} else if (entry.type === "session_start") {
					const sessionId = `${entry.timestamp}`;
					sessionIds.add(sessionId);
				}

				if (entry.tokensIn) stats.tokensIn += entry.tokensIn;
				if (entry.tokensOut) stats.tokensOut += entry.tokensOut;
				if (entry.costUsd) stats.costUsd += entry.costUsd;
			} catch {
				// Skip malformed lines
			}
		}

		stats.sessions = sessionIds.size || Math.ceil(stats.messages / 20); // Estimate if no session markers
		stats.firstActivity = firstActivity;
		stats.lastActivity = lastActivity;
	} catch {
		// File read error - return empty stats
	}

	return stats;
}

export async function collectStats(periodDays = 30): Promise<StatsCollection> {
	const historyPath = getHistoryPath();
	const historyExists = fileExists(historyPath);

	const statsCachePath = getStatsCachePath();
	const statsCacheExists = fileExists(statsCachePath);

	let stats: UsageStats = {
		messages: 0,
		sessions: 0,
		toolCalls: 0,
		tokensIn: 0,
		tokensOut: 0,
		costUsd: 0,
		periodDays,
	};

	// Try to get stats from cache first
	if (statsCacheExists) {
		const cacheJson = readJsonFile<StatsCacheJson>(statsCachePath);
		if (cacheJson) {
			stats = {
				messages: cacheJson.totalMessages ?? 0,
				sessions: cacheJson.totalSessions ?? 0,
				toolCalls: cacheJson.totalToolCalls ?? 0,
				tokensIn: cacheJson.totalTokensIn ?? 0,
				tokensOut: cacheJson.totalTokensOut ?? 0,
				costUsd: cacheJson.totalCostUsd ?? 0,
				periodDays: -1, // Cache represents all time
			};
		}
	}

	// Parse history if available for period-specific stats
	if (historyExists && periodDays > 0) {
		stats = await parseHistory(historyPath, periodDays);
	}

	return {
		stats,
		historyPath,
		historyExists,
		statsCachePath,
		statsCacheExists,
	};
}
