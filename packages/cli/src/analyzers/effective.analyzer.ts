import {
	type EffectiveConfig,
	type EffectiveConfigEntry,
	type SettingsHierarchy,
} from "../models/config.model.js";

export function computeEffectiveConfig(hierarchy: SettingsHierarchy): EffectiveConfig {
	const keyMap = new Map<string, EffectiveConfigEntry>();

	// Walk layers from highest precedence (index 0) to lowest
	for (const layer of hierarchy.layers) {
		if (!layer.content || !layer.exists) continue;

		for (const [key, value] of Object.entries(layer.content)) {
			if (keyMap.has(key)) {
				// Already set by higher-precedence layer — add as override
				const entry = keyMap.get(key)!;
				entry.overrides.push({ source: layer.source, value });
			} else {
				// First layer to define this key wins
				keyMap.set(key, {
					key,
					value,
					source: layer.source,
					overrides: [],
				});
			}
		}
	}

	const entries = [...keyMap.values()].sort((a, b) => a.key.localeCompare(b.key));
	return { entries };
}
