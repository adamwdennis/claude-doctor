import {
	type PermissionDebugResult,
	type PermissionRule,
	PermissionVerdict,
} from "../models/diagnostic.model.js";
import type { SettingsHierarchy } from "../models/config.model.js";

function extractRules(
	content: Record<string, unknown> | null,
	source: string,
	sourcePath: string,
): PermissionRule[] {
	if (!content) return [];
	const rules: PermissionRule[] = [];

	const permissions = content.permissions as Record<string, unknown> | undefined;
	if (!permissions) return rules;

	for (const type of ["allow", "deny", "ask"] as const) {
		const list = permissions[type];
		if (!Array.isArray(list)) continue;
		for (const pattern of list) {
			if (typeof pattern === "string") {
				rules.push({ pattern, source, sourcePath, type });
			}
		}
	}

	return rules;
}

function matchesPattern(pattern: string, query: string): boolean {
	// Exact match
	if (pattern === query) return true;

	// Parse tool name and args from both
	const patternMatch = pattern.match(/^(\w+)\((.+)\)$/);
	const queryMatch = query.match(/^(\w+)\((.+)\)$/);

	if (!patternMatch || !queryMatch) {
		// Simple wildcard: pattern ends with *
		if (pattern.endsWith("*")) {
			return query.startsWith(pattern.slice(0, -1));
		}
		return pattern === query;
	}

	const [, patternTool, patternArgs] = patternMatch;
	const [, queryTool, queryArgs] = queryMatch;

	// Tool name must match
	if (patternTool !== queryTool) return false;

	// Wildcard args
	if (patternArgs === "*") return true;

	// Glob-style matching
	if (patternArgs.includes("*")) {
		const regex = new RegExp("^" + patternArgs.replace(/\*/g, ".*") + "$");
		return regex.test(queryArgs);
	}

	return patternArgs === queryArgs;
}

export function debugPermission(
	hierarchy: SettingsHierarchy,
	query: string,
): PermissionDebugResult {
	const allRules: PermissionRule[] = [];

	// Collect rules from all layers (highest precedence first)
	for (const layer of hierarchy.layers) {
		const rules = extractRules(layer.content, layer.source, layer.path ?? "");
		allRules.push(...rules);
	}

	// Check deny first across all layers
	for (const rule of allRules) {
		if (rule.type === "deny" && matchesPattern(rule.pattern, query)) {
			return { query, verdict: PermissionVerdict.Denied, matchedRule: rule, allRules };
		}
	}

	// Check ask
	for (const rule of allRules) {
		if (rule.type === "ask" && matchesPattern(rule.pattern, query)) {
			return { query, verdict: PermissionVerdict.Ask, matchedRule: rule, allRules };
		}
	}

	// Check allow
	for (const rule of allRules) {
		if (rule.type === "allow" && matchesPattern(rule.pattern, query)) {
			return { query, verdict: PermissionVerdict.Allowed, matchedRule: rule, allRules };
		}
	}

	return { query, verdict: PermissionVerdict.NoMatch, matchedRule: undefined, allRules };
}

export function getEffectivePermissions(hierarchy: SettingsHierarchy): PermissionRule[] {
	const allRules: PermissionRule[] = [];
	for (const layer of hierarchy.layers) {
		const rules = extractRules(layer.content, layer.source, layer.path ?? "");
		allRules.push(...rules);
	}
	return allRules;
}
