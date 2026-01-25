import type { SettingsConflict, SettingsLayer, SettingsSource } from "../models/index.js";

export function mergeSettings(layers: SettingsLayer[]): Record<string, unknown> {
	const merged: Record<string, unknown> = {};

	// Iterate from lowest to highest precedence
	for (let i = layers.length - 1; i >= 0; i--) {
		const layer = layers[i];
		if (layer.content) {
			Object.assign(merged, layer.content);
		}
	}

	return merged;
}

export function detectConflicts(layers: SettingsLayer[]): SettingsConflict[] {
	const keyValues = new Map<string, Array<{ source: SettingsSource; value: unknown }>>();

	for (const layer of layers) {
		if (!layer.content) continue;

		for (const [key, value] of Object.entries(layer.content)) {
			if (!keyValues.has(key)) {
				keyValues.set(key, []);
			}
			keyValues.get(key)?.push({ source: layer.source, value });
		}
	}

	const conflicts: SettingsConflict[] = [];

	for (const [key, values] of keyValues) {
		if (values.length > 1) {
			// Check if values actually differ
			const uniqueValues = new Set(values.map((v) => JSON.stringify(v.value)));
			if (uniqueValues.size > 1) {
				conflicts.push({ key, values });
			}
		}
	}

	return conflicts;
}
