import type { IncomingMessage, ServerResponse } from "node:http";
import { collectForecast } from "../../collectors/forecast.collector.js";
import { sendJson } from "../routes/api.js";

export async function handleForecast(
	_req: IncomingMessage,
	res: ServerResponse,
	url: string,
): Promise<void> {
	const urlObj = new URL(url, "http://localhost");
	const daysParam = urlObj.searchParams.get("days");
	const days = daysParam ? parseInt(daysParam, 10) : 30;

	const forecast = collectForecast(days);
	sendJson(res, 200, forecast);
}
