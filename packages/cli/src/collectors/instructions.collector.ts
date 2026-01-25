import {
	type InstructionsCollection,
	type InstructionsLayer,
	InstructionsSource,
} from "../models/index.js";
import {
	countLines,
	fileExists,
	getPreview,
	getProjectClaudeDirInstructionsPath,
	getProjectRootInstructionsPath,
	getUserInstructionsPath,
	readTextFile,
} from "../utils/index.js";

export function collectInstructions(projectPath: string): InstructionsCollection {
	const layers: InstructionsLayer[] = [];
	let totalLines = 0;

	// 1. Project .claude/CLAUDE.md (highest precedence)
	const projectClaudeDirPath = getProjectClaudeDirInstructionsPath(projectPath);
	const projectClaudeDirContent = readTextFile(projectClaudeDirPath);
	const projectClaudeDirLines = countLines(projectClaudeDirContent ?? "");
	layers.push({
		source: InstructionsSource.ProjectClaudeDir,
		path: projectClaudeDirPath,
		exists: fileExists(projectClaudeDirPath),
		lineCount: projectClaudeDirLines,
		preview: projectClaudeDirContent ? getPreview(projectClaudeDirContent) : undefined,
	});
	totalLines += projectClaudeDirLines;

	// 2. Project root CLAUDE.md
	const projectRootPath = getProjectRootInstructionsPath(projectPath);
	const projectRootContent = readTextFile(projectRootPath);
	const projectRootLines = countLines(projectRootContent ?? "");
	layers.push({
		source: InstructionsSource.ProjectRoot,
		path: projectRootPath,
		exists: fileExists(projectRootPath),
		lineCount: projectRootLines,
		preview: projectRootContent ? getPreview(projectRootContent) : undefined,
	});
	totalLines += projectRootLines;

	// 3. User global ~/.claude/CLAUDE.md (lowest precedence)
	const userPath = getUserInstructionsPath();
	const userContent = readTextFile(userPath);
	const userLines = countLines(userContent ?? "");
	layers.push({
		source: InstructionsSource.User,
		path: userPath,
		exists: fileExists(userPath),
		lineCount: userLines,
		preview: userContent ? getPreview(userContent) : undefined,
	});
	totalLines += userLines;

	return { layers, totalLines };
}
