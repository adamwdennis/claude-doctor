import {
	type DiffEntry,
	DiffChangeType,
	type DiagnosticReport,
	type SnapshotDiff,
	type SnapshotMeta,
} from "../models/diagnostic.model.js";

function flattenObject(obj: unknown, prefix = ""): Map<string, unknown> {
	const result = new Map<string, unknown>();

	if (obj === null || obj === undefined) return result;

	if (typeof obj !== "object" || obj instanceof Date) {
		result.set(prefix, obj);
		return result;
	}

	if (Array.isArray(obj)) {
		result.set(prefix, JSON.stringify(obj));
		return result;
	}

	for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;
		if (
			typeof value === "object" &&
			value !== null &&
			!Array.isArray(value) &&
			!(value instanceof Date)
		) {
			for (const [k, v] of flattenObject(value, fullKey)) {
				result.set(k, v);
			}
		} else {
			result.set(fullKey, typeof value === "object" ? JSON.stringify(value) : value);
		}
	}

	return result;
}

export function diffSnapshots(
	leftMeta: SnapshotMeta,
	leftReport: DiagnosticReport,
	rightMeta: SnapshotMeta,
	rightReport: DiagnosticReport,
): SnapshotDiff {
	const leftFlat = flattenObject(leftReport);
	const rightFlat = flattenObject(rightReport);

	const entries: DiffEntry[] = [];
	const allKeys = new Set([...leftFlat.keys(), ...rightFlat.keys()]);

	for (const key of allKeys) {
		const leftVal = leftFlat.get(key);
		const rightVal = rightFlat.get(key);

		if (leftVal === undefined) {
			entries.push({ path: key, changeType: DiffChangeType.Added, newValue: rightVal });
		} else if (rightVal === undefined) {
			entries.push({ path: key, changeType: DiffChangeType.Removed, oldValue: leftVal });
		} else if (String(leftVal) !== String(rightVal)) {
			entries.push({
				path: key,
				changeType: DiffChangeType.Changed,
				oldValue: leftVal,
				newValue: rightVal,
			});
		}
	}

	return {
		left: leftMeta,
		right: rightMeta,
		entries: entries.sort((a, b) => a.path.localeCompare(b.path)),
	};
}
