import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { type CostForecast, CostTrend, type DailyCost } from "../models/forecast.model.js";

interface RawEntry {
	timestamp?: string;
	costUsd?: number;
	tokensIn?: number;
	tokensOut?: number;
	sessionId?: string;
}

function toDateKey(timestamp: string): string {
	const num = Number(timestamp);
	const date = !Number.isNaN(num) && num > 1_000_000_000 ? new Date(num) : new Date(timestamp);
	return date.toISOString().slice(0, 10);
}

export function collectForecast(days = 30): CostForecast {
	const historyPath = join(homedir(), ".claude", "history.jsonl");
	const dailyMap = new Map<string, { cost: number; sessions: Set<string>; tokens: number }>();

	if (existsSync(historyPath)) {
		const content = readFileSync(historyPath, "utf-8");
		const lines = content.trim().split("\n").filter(Boolean);

		for (const line of lines) {
			try {
				const entry = JSON.parse(line) as RawEntry;
				if (!entry.timestamp) continue;

				const dateKey = toDateKey(entry.timestamp);
				if (!dailyMap.has(dateKey)) {
					dailyMap.set(dateKey, { cost: 0, sessions: new Set(), tokens: 0 });
				}

				const day = dailyMap.get(dateKey)!;
				if (entry.costUsd) day.cost += entry.costUsd;
				if (entry.sessionId) day.sessions.add(entry.sessionId);
				if (entry.tokensIn) day.tokens += entry.tokensIn;
				if (entry.tokensOut) day.tokens += entry.tokensOut;
			} catch {
				// skip
			}
		}
	}

	// Convert to sorted array, limit to last N days
	const allDays = [...dailyMap.entries()]
		.map(([date, data]) => ({
			date,
			cost: Math.round(data.cost * 10000) / 10000,
			sessions: data.sessions.size,
			tokens: data.tokens,
		}))
		.sort((a, b) => a.date.localeCompare(b.date));

	const dataPoints: DailyCost[] = allDays.slice(-days);
	const periodAnalyzedDays = dataPoints.length;

	if (periodAnalyzedDays === 0) {
		return {
			dailyAverage: 0,
			weeklyAverage: 0,
			monthlyProjection: 0,
			trend: CostTrend.Stable,
			periodAnalyzedDays: 0,
			dataPoints: [],
		};
	}

	const totalCost = dataPoints.reduce((sum, d) => sum + d.cost, 0);
	const dailyAverage = totalCost / periodAnalyzedDays;
	const weeklyAverage = dailyAverage * 7;
	const monthlyProjection = dailyAverage * 30;

	// Trend: compare last 7d avg vs prior 7d avg
	let trend = CostTrend.Stable;
	if (dataPoints.length >= 14) {
		const recent = dataPoints.slice(-7);
		const prior = dataPoints.slice(-14, -7);
		const recentAvg = recent.reduce((s, d) => s + d.cost, 0) / 7;
		const priorAvg = prior.reduce((s, d) => s + d.cost, 0) / 7;

		if (priorAvg > 0) {
			const ratio = recentAvg / priorAvg;
			if (ratio > 1.1) trend = CostTrend.Up;
			else if (ratio < 0.9) trend = CostTrend.Down;
		}
	}

	return {
		dailyAverage: Math.round(dailyAverage * 10000) / 10000,
		weeklyAverage: Math.round(weeklyAverage * 10000) / 10000,
		monthlyProjection: Math.round(monthlyProjection * 100) / 100,
		trend,
		periodAnalyzedDays,
		dataPoints,
	};
}
