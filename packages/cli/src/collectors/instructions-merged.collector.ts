import {
	type MergedInstructionsBlock,
	type MergedInstructionsResult,
	InstructionsSource,
} from "../models/diagnostic.model.js";
import {
	fileExists,
	getProjectClaudeDirInstructionsPath,
	getProjectRootInstructionsPath,
	getUserInstructionsPath,
	readTextFile,
} from "../utils/index.js";
import { estimateTokens } from "../utils/tokens.js";

interface InstructionsFile {
	source: InstructionsSource;
	path: string;
}

export function collectMergedInstructions(projectPath: string): MergedInstructionsResult {
	const files: InstructionsFile[] = [
		{
			source: InstructionsSource.ProjectClaudeDir,
			path: getProjectClaudeDirInstructionsPath(projectPath),
		},
		{ source: InstructionsSource.ProjectRoot, path: getProjectRootInstructionsPath(projectPath) },
		{ source: InstructionsSource.User, path: getUserInstructionsPath() },
	];

	const blocks: MergedInstructionsBlock[] = [];
	let mergedContent = "";
	let currentLine = 1;

	for (const file of files) {
		if (!fileExists(file.path)) continue;

		const content = readTextFile(file.path);
		if (!content) continue;

		const lineCount = content.split("\n").length;
		const endLine = currentLine + lineCount - 1;

		blocks.push({
			source: file.source,
			path: file.path,
			content,
			tokenEstimate: estimateTokens(content),
			startLine: currentLine,
			endLine,
		});

		mergedContent += (mergedContent ? "\n\n" : "") + content;
		currentLine = endLine + 2; // +2 for blank line separator
	}

	return {
		blocks,
		mergedContent,
		totalTokens: estimateTokens(mergedContent),
		totalLines: mergedContent.split("\n").length,
	};
}
