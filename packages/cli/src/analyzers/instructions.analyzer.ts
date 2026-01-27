import {
	type InstructionsLintIssue,
	type InstructionsLintResult,
	InstructionsSource,
	LintSeverity,
} from "../models/diagnostic.model.js";
import { collectMergedInstructions } from "../collectors/instructions-merged.collector.js";
import { existsSync } from "node:fs";

export function lintInstructions(projectPath: string): InstructionsLintResult {
	const merged = collectMergedInstructions(projectPath);
	const issues: InstructionsLintIssue[] = [];

	for (const block of merged.blocks) {
		const lines = block.content.split("\n");

		// Token count warning
		if (block.tokenEstimate > 3000) {
			issues.push({
				severity: LintSeverity.Warning,
				message: `File has ~${block.tokenEstimate} tokens (>3000). Consider trimming to reduce context usage.`,
				source: block.source,
				ruleId: "token-budget",
			});
		}

		// Long lines
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].length > 200) {
				issues.push({
					severity: LintSeverity.Info,
					message: `Line ${block.startLine + i} exceeds 200 characters (${lines[i].length} chars)`,
					source: block.source,
					line: block.startLine + i,
					suggestion: "Break into shorter lines for readability",
					ruleId: "long-line",
				});
			}
		}

		// Stale file references
		const pathRefs = block.content.match(/(?:src\/|\.\/|packages\/)[^\s)'"`,]+/g);
		if (pathRefs) {
			for (const ref of pathRefs) {
				const fullPath = `${projectPath}/${ref}`;
				if (!existsSync(fullPath)) {
					const lineNum = lines.findIndex((l) => l.includes(ref));
					issues.push({
						severity: LintSeverity.Warning,
						message: `Referenced path "${ref}" does not exist on disk`,
						source: block.source,
						line: lineNum >= 0 ? block.startLine + lineNum : undefined,
						suggestion: "Update or remove stale path reference",
						ruleId: "stale-path",
					});
				}
			}
		}
	}

	// Duplicate lines across files
	if (merged.blocks.length > 1) {
		const seenLines = new Map<string, InstructionsSource>();
		for (const block of merged.blocks) {
			const lines = block.content
				.split("\n")
				.map((l) => l.trim())
				.filter((l) => l.length > 20);
			for (const line of lines) {
				const existing = seenLines.get(line);
				if (existing && existing !== block.source) {
					issues.push({
						severity: LintSeverity.Info,
						message: `Duplicate line found across ${existing} and ${block.source}: "${line.slice(0, 60)}..."`,
						source: block.source,
						suggestion: "Remove duplicate to reduce token usage",
						ruleId: "duplicate-line",
					});
					break; // Only report first duplicate per block
				}
				seenLines.set(line, block.source);
			}
		}
	}

	// Contradictory patterns
	const fullText = merged.mergedContent.toLowerCase();
	const contradictions = [
		["always use tabs", "always use spaces"],
		["never use any", "use any"],
		["always use semicolons", "never use semicolons"],
	];
	for (const [a, b] of contradictions) {
		if (fullText.includes(a) && fullText.includes(b)) {
			issues.push({
				severity: LintSeverity.Warning,
				message: `Potential contradiction: "${a}" vs "${b}"`,
				source: InstructionsSource.ProjectRoot,
				suggestion: "Resolve conflicting instructions",
				ruleId: "contradiction",
			});
		}
	}

	return {
		issues,
		totalIssues: issues.length,
	};
}
