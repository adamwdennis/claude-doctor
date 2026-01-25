import type { SettingsConflict, SettingsHierarchy } from "../models/index.js";

export function analyzeConflicts(settings: SettingsHierarchy): SettingsConflict[] {
	const keyValues = new Map<
		string,
		Array<{ source: SettingsHierarchy["layers"][0]["source"]; value: unknown }>
	>();

	// Collect all key-value pairs from each layer
	for (const layer of settings.layers) {
		if (!layer.content || !layer.exists) continue;

		for (const [key, value] of Object.entries(layer.content)) {
			if (!keyValues.has(key)) {
				keyValues.set(key, []);
			}
			keyValues.get(key)?.push({ source: layer.source, value });
		}
	}

	const conflicts: SettingsConflict[] = [];

	// Find keys with conflicting values
	for (const [key, values] of keyValues) {
		if (values.length <= 1) continue;

		// Check if values actually differ (using JSON stringification for comparison)
		const uniqueValues = new Set(values.map((v) => JSON.stringify(v.value)));
		if (uniqueValues.size > 1) {
			conflicts.push({ key, values });
		}
	}

	return conflicts;
}
