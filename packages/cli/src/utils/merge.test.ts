import { describe, expect, it } from "vitest";
import { SettingsSource } from "../models/index.js";
import { detectConflicts, mergeSettings } from "./merge.js";

describe("merge utils", () => {
	describe("mergeSettings", () => {
		it("merges settings from lowest to highest precedence", () => {
			const layers = [
				{
					source: SettingsSource.User,
					path: "/user/settings.json",
					exists: true,
					content: { key1: "user-value", key2: "user-only" },
				},
				{
					source: SettingsSource.Default,
					path: null,
					exists: true,
					content: { key1: "default-value", key3: "default-only" },
				},
			];

			const merged = mergeSettings(layers);

			expect(merged.key1).toBe("user-value"); // User overrides default
			expect(merged.key2).toBe("user-only");
			expect(merged.key3).toBe("default-only");
		});

		it("handles empty layers", () => {
			const merged = mergeSettings([]);
			expect(merged).toEqual({});
		});

		it("skips layers with null content", () => {
			const layers = [
				{
					source: SettingsSource.User,
					path: "/user/settings.json",
					exists: false,
					content: null,
				},
				{
					source: SettingsSource.Default,
					path: null,
					exists: true,
					content: { key: "value" },
				},
			];

			const merged = mergeSettings(layers);
			expect(merged).toEqual({ key: "value" });
		});
	});

	describe("detectConflicts", () => {
		it("detects conflicting values for same key", () => {
			const layers = [
				{
					source: SettingsSource.User,
					path: "/user/settings.json",
					exists: true,
					content: { theme: "dark" },
				},
				{
					source: SettingsSource.ProjectShared,
					path: "/project/settings.json",
					exists: true,
					content: { theme: "light" },
				},
			];

			const conflicts = detectConflicts(layers);

			expect(conflicts).toHaveLength(1);
			expect(conflicts[0].key).toBe("theme");
			expect(conflicts[0].values).toHaveLength(2);
		});

		it("does not report identical values as conflicts", () => {
			const layers = [
				{
					source: SettingsSource.User,
					path: "/user/settings.json",
					exists: true,
					content: { theme: "dark" },
				},
				{
					source: SettingsSource.ProjectShared,
					path: "/project/settings.json",
					exists: true,
					content: { theme: "dark" },
				},
			];

			const conflicts = detectConflicts(layers);
			expect(conflicts).toHaveLength(0);
		});

		it("returns empty array when no conflicts", () => {
			const layers = [
				{
					source: SettingsSource.User,
					path: "/user/settings.json",
					exists: true,
					content: { key1: "value1" },
				},
				{
					source: SettingsSource.ProjectShared,
					path: "/project/settings.json",
					exists: true,
					content: { key2: "value2" },
				},
			];

			const conflicts = detectConflicts(layers);
			expect(conflicts).toHaveLength(0);
		});
	});
});
