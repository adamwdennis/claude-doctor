import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
	type HistoryEntry,
	type Session,
	type SessionDetail,
	HistoryEntryType,
} from "../models/history.model.js";

function parseHistoryLine(line: string): HistoryEntry | null {
	try {
		const data = JSON.parse(line) as Record<string, unknown>;
		const entry: HistoryEntry = {
			timestamp: String(data.timestamp ?? ""),
			type: HistoryEntryType.Message,
		};

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

export function collectSessionDetail(sessionId: string): SessionDetail | null {
	const historyPath = join(homedir(), ".claude", "history.jsonl");
	if (!existsSync(historyPath)) return null;

	const content = readFileSync(historyPath, "utf-8");
	const lines = content.trim().split("\n").filter(Boolean);

	const entries: HistoryEntry[] = [];
	for (const line of lines) {
		const entry = parseHistoryLine(line);
		if (entry && entry.sessionId === sessionId) {
			entries.push(entry);
		}
	}

	if (entries.length === 0) return null;

	// Build session summary from entries
	const session: Session = {
		id: sessionId,
		startedAt: entries[0].timestamp,
		endedAt: entries[entries.length - 1].timestamp,
		messageCount: entries.filter((e) => e.type === HistoryEntryType.Message).length,
		toolCalls: [...new Set(entries.filter((e) => e.toolName).map((e) => e.toolName!))],
		tokensIn: entries.reduce((sum, e) => sum + (e.tokensIn ?? 0), 0),
		tokensOut: entries.reduce((sum, e) => sum + (e.tokensOut ?? 0), 0),
		costUsd: entries.reduce((sum, e) => sum + (e.costUsd ?? 0), 0),
		cwd: entries.find((e) => e.cwd)?.cwd,
		model: entries.find((e) => e.model)?.model,
	};

	return {
		session,
		entries,
		entryCount: entries.length,
	};
}
