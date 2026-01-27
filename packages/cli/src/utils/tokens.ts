/**
 * Estimate token count using chars/4 heuristic.
 * Good enough for context budget estimation.
 */
export function estimateTokens(text: string): number {
	if (!text) return 0;
	return Math.ceil(text.length / 4);
}
