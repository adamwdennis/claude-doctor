import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { homedir } from "node:os";
import type { DiagnosticReport, Snapshot, SnapshotMeta } from "../models/diagnostic.model.js";

function getSnapshotsDir(): string {
	return join(homedir(), ".claude", "doctor-snapshots");
}

function ensureDir(): string {
	const dir = getSnapshotsDir();
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	return dir;
}

export function saveSnapshot(report: DiagnosticReport, name?: string): SnapshotMeta {
	const dir = ensureDir();
	const id = randomUUID();
	const meta: SnapshotMeta = {
		id,
		name: name ?? new Date().toISOString().replace(/[:.]/g, "-"),
		createdAt: new Date().toISOString(),
		projectPath: report.projectPath,
	};

	const snapshot: Snapshot = { meta, report };
	writeFileSync(join(dir, `${id}.json`), JSON.stringify(snapshot, null, 2));

	return meta;
}

export function listSnapshots(): SnapshotMeta[] {
	const dir = getSnapshotsDir();
	if (!existsSync(dir)) return [];

	const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
	const metas: SnapshotMeta[] = [];

	for (const file of files) {
		try {
			const content = readFileSync(join(dir, file), "utf-8");
			const snapshot = JSON.parse(content) as Snapshot;
			metas.push(snapshot.meta);
		} catch {
			// skip corrupt files
		}
	}

	return metas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getSnapshot(id: string): Snapshot | null {
	const path = join(getSnapshotsDir(), `${id}.json`);
	if (!existsSync(path)) return null;

	try {
		const content = readFileSync(path, "utf-8");
		return JSON.parse(content) as Snapshot;
	} catch {
		return null;
	}
}

export function deleteSnapshot(id: string): boolean {
	const path = join(getSnapshotsDir(), `${id}.json`);
	if (!existsSync(path)) return false;
	unlinkSync(path);
	return true;
}
