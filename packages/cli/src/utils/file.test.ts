import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	countLines,
	dirExists,
	fileExists,
	getPreview,
	readJsonFile,
	readTextFile,
} from "./file.js";

describe("file utils", () => {
	const testDir = join(tmpdir(), "claude-doctor-test");

	beforeEach(() => {
		mkdirSync(testDir, { recursive: true });
	});

	afterEach(() => {
		rmSync(testDir, { recursive: true, force: true });
	});

	describe("fileExists", () => {
		it("returns true for existing file", () => {
			const path = join(testDir, "test.txt");
			writeFileSync(path, "test");
			expect(fileExists(path)).toBe(true);
		});

		it("returns false for non-existing file", () => {
			expect(fileExists(join(testDir, "nonexistent.txt"))).toBe(false);
		});

		it("returns false for directory", () => {
			expect(fileExists(testDir)).toBe(false);
		});
	});

	describe("dirExists", () => {
		it("returns true for existing directory", () => {
			expect(dirExists(testDir)).toBe(true);
		});

		it("returns false for non-existing directory", () => {
			expect(dirExists(join(testDir, "nonexistent"))).toBe(false);
		});

		it("returns false for file", () => {
			const path = join(testDir, "test.txt");
			writeFileSync(path, "test");
			expect(dirExists(path)).toBe(false);
		});
	});

	describe("readJsonFile", () => {
		it("reads valid JSON file", () => {
			const path = join(testDir, "test.json");
			writeFileSync(path, '{"key": "value"}');
			expect(readJsonFile(path)).toEqual({ key: "value" });
		});

		it("returns null for invalid JSON", () => {
			const path = join(testDir, "invalid.json");
			writeFileSync(path, "not json");
			expect(readJsonFile(path)).toBe(null);
		});

		it("returns null for non-existing file", () => {
			expect(readJsonFile(join(testDir, "nonexistent.json"))).toBe(null);
		});
	});

	describe("readTextFile", () => {
		it("reads text file", () => {
			const path = join(testDir, "test.txt");
			writeFileSync(path, "hello world");
			expect(readTextFile(path)).toBe("hello world");
		});

		it("returns null for non-existing file", () => {
			expect(readTextFile(join(testDir, "nonexistent.txt"))).toBe(null);
		});
	});

	describe("countLines", () => {
		it("counts lines correctly", () => {
			expect(countLines("line1\nline2\nline3")).toBe(3);
		});

		it("returns 1 for single line", () => {
			expect(countLines("single line")).toBe(1);
		});

		it("returns 0 for empty string", () => {
			expect(countLines("")).toBe(0);
		});
	});

	describe("getPreview", () => {
		it("returns first N lines", () => {
			const content = "line1\nline2\nline3\nline4\nline5\nline6";
			expect(getPreview(content, 3)).toBe("line1\nline2\nline3");
		});

		it("returns all lines if less than limit", () => {
			const content = "line1\nline2";
			expect(getPreview(content, 5)).toBe("line1\nline2");
		});

		it("returns empty string for empty content", () => {
			expect(getPreview("", 5)).toBe("");
		});
	});
});
