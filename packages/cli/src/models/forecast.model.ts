export enum CostTrend {
	Up = "up",
	Down = "down",
	Stable = "stable",
}

export interface DailyCost {
	date: string;
	cost: number;
	sessions: number;
	tokens: number;
}

export interface CostForecast {
	dailyAverage: number;
	weeklyAverage: number;
	monthlyProjection: number;
	trend: CostTrend;
	periodAnalyzedDays: number;
	dataPoints: DailyCost[];
}
