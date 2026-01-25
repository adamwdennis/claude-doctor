import { existsSync, readFileSync, statSync } from "node:fs";

export function fileExists(path: string): boolean {
	try {
		return existsSync(path) && statSync(path).isFile();
	} catch {
		return false;
	}
}

export function dirExists(path: string): boolean {
	try {
		return existsSync(path) && statSync(path).isDirectory();
	} catch {
		return false;
	}
}

export function readJsonFile<T>(path: string): T | null {
	try {
		if (!fileExists(path)) return null;
		const content = readFileSync(path, "utf-8");
		return JSON.parse(content) as T;
	} catch {
		return null;
	}
}

export function readTextFile(path: string): string | null {
	try {
		if (!fileExists(path)) return null;
		return readFileSync(path, "utf-8");
	} catch {
		return null;
	}
}

export function countLines(content: string): number {
	if (!content) return 0;
	return content.split("\n").length;
}

export function getPreview(content: string, maxLines = 5): string {
	if (!content) return "";
	const lines = content.split("\n").slice(0, maxLines);
	return lines.join("\n");
}
