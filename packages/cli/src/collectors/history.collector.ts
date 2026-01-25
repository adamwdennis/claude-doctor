import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
	type HistoryEntry,
	type Session,
	type HistoryCollection,
	HistoryEntryType,
} from "../models/history.model.js";

function parseHistoryLine(line: string): HistoryEntry | null {
	try {
		const data = JSON.parse(line) as Record<string, unknown>;
		const entry: HistoryEntry = {
			timestamp: String(data.timestamp ?? ""),
			type: HistoryEntryType.Message,
		};

		// Determine type
		if (data.type === "session_start" || data.sessionStart) {
			entry.type = HistoryEntryType.SessionStart;
		} else if (data.type === "tool_call" || data.toolName) {
			entry.type = HistoryEntryType.ToolCall;
			entry.toolName = String(data.toolName ?? "");
		} else if (data.type === "api_request") {
			entry.type = HistoryEntryType.ApiRequest;
		} else if (data.type === "api_response" || data.costUsd !== undefined) {
			entry.type = HistoryEntryType.ApiResponse;
		}

		// Extract common fields
		if (data.sessionId) entry.sessionId = String(data.sessionId);
		if (data.tokensIn !== undefined) entry.tokensIn = Number(data.tokensIn);
		if (data.tokensOut !== undefined) entry.tokensOut = Number(data.tokensOut);
		if (typeof data.costUsd === "number") entry.costUsd = data.costUsd;
		if (data.message) entry.message = String(data.message);
		if (data.model) entry.model = String(data.model);
		if (data.cwd) entry.cwd = String(data.cwd);

		return entry;
	} catch {
		return null;
	}
}

function aggregateSessions(entries: HistoryEntry[]): Session[] {
	const sessionMap = new Map<string, Session>();
	let currentSessionId = "default";

	for (const entry of entries) {
		// Track session starts
		if (entry.type === HistoryEntryType.SessionStart) {
			currentSessionId = entry.sessionId ?? `session-${entry.timestamp}`;
			if (!sessionMap.has(currentSessionId)) {
				sessionMap.set(currentSessionId, {
					id: currentSessionId,
					startedAt: entry.timestamp,
					messageCount: 0,
					toolCalls: [],
					tokensIn: 0,
					tokensOut: 0,
					costUsd: 0,
					cwd: entry.cwd,
					model: entry.model,
				});
			}
		}

		// Use sessionId from entry if available
		const sessionId = entry.sessionId ?? currentSessionId;
		let session = sessionMap.get(sessionId);

		// Create session if not exists
		if (!session) {
			session = {
				id: sessionId,
				startedAt: entry.timestamp,
				messageCount: 0,
				toolCalls: [],
				tokensIn: 0,
				tokensOut: 0,
				costUsd: 0,
			};
			sessionMap.set(sessionId, session);
		}

		// Aggregate data
		if (entry.type === HistoryEntryType.Message) {
			session.messageCount++;
		}
		if (entry.type === HistoryEntryType.ToolCall && entry.toolName) {
			if (!session.toolCalls.includes(entry.toolName)) {
				session.toolCalls.push(entry.toolName);
			}
		}
		if (entry.tokensIn) session.tokensIn += entry.tokensIn;
		if (entry.tokensOut) session.tokensOut += entry.tokensOut;
		if (entry.costUsd) session.costUsd += entry.costUsd;

		// Update end time
		session.endedAt = entry.timestamp;

		// Update model if present
		if (entry.model) session.model = entry.model;
	}

	// Sort by startedAt descending (most recent first)
	return Array.from(sessionMap.values()).sort(
		(a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
	);
}

export function collectHistory(limit = 100): HistoryCollection {
	const mainHistoryPath = join(homedir(), ".claude", "history.jsonl");

	const entries: HistoryEntry[] = [];

	// Try to read the main history file
	if (existsSync(mainHistoryPath)) {
		try {
			const content = readFileSync(mainHistoryPath, "utf-8");
			const lines = content.trim().split("\n").filter(Boolean);
			for (const line of lines) {
				const entry = parseHistoryLine(line);
				if (entry) entries.push(entry);
			}
		} catch {
			// Ignore read errors
		}
	}

	// Aggregate into sessions
	const sessions = aggregateSessions(entries);
	const limitedSessions = sessions.slice(0, limit);

	// Calculate totals
	const totals = {
		sessionCount: sessions.length,
		messageCount: sessions.reduce((sum, s) => sum + s.messageCount, 0),
		toolCallCount: sessions.reduce((sum, s) => sum + s.toolCalls.length, 0),
		tokensIn: sessions.reduce((sum, s) => sum + s.tokensIn, 0),
		tokensOut: sessions.reduce((sum, s) => sum + s.tokensOut, 0),
		costUsd: sessions.reduce((sum, s) => sum + s.costUsd, 0),
	};

	// Date range
	const dateRange =
		sessions.length > 0
			? {
					first: sessions[sessions.length - 1].startedAt,
					last: sessions[0].startedAt,
				}
			: undefined;

	return {
		sessions: limitedSessions,
		totals,
		dateRange,
	};
}
