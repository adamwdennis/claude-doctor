import type { IncomingMessage, ServerResponse } from "node:http";
import { analyzeConflicts, analyzeIssues } from "../../analyzers/index.js";
import {
	collectInstructions,
	collectMcp,
	collectPlugins,
	collectSettings,
	collectStats,
} from "../../collectors/index.js";
import type { DiagnosticReport } from "../../models/index.js";
import { sendJson } from "../routes/api.js";

export async function handleDiagnose(
	_req: IncomingMessage,
	res: ServerResponse,
	projectPath: string,
	url?: string,
): Promise<void> {
	const settings = collectSettings(projectPath);
	const mcp = await collectMcp(projectPath, false);
	const plugins = collectPlugins();
	const instructions = collectInstructions(projectPath);
	const stats = await collectStats(30);

	const conflicts = analyzeConflicts(settings);
	const issues = analyzeIssues(settings, mcp, plugins, instructions, stats);

	const report: DiagnosticReport = {
		settings,
		mcp,
		plugins,
		instructions,
		stats,
		conflicts,
		issues,
		generatedAt: new Date(),
		projectPath,
	};

	// Support format query param for export (F12)
	const urlObj = new URL(url ?? "/api/diagnose", "http://localhost");
	const format = urlObj.searchParams.get("format");

	if (format === "json-download") {
		res.writeHead(200, {
			"Content-Type": "application/json",
			"Content-Disposition": 'attachment; filename="claude-doctor-report.json"',
		});
		res.end(JSON.stringify(report, null, 2));
		return;
	}

	if (format === "html") {
		const html = generateHtmlReport(report);
		res.writeHead(200, {
			"Content-Type": "text/html",
			"Content-Disposition": 'attachment; filename="claude-doctor-report.html"',
		});
		res.end(html);
		return;
	}

	sendJson(res, 200, report);
}

function generateHtmlReport(report: DiagnosticReport): string {
	const issueRows = report.issues
		.map(
			(i) =>
				`<tr><td class="${i.severity}">${i.severity}</td><td>${i.category}</td><td>${i.message}</td></tr>`,
		)
		.join("\n");

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Claude Doctor Report</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; background: #1a1a2e; color: #e0e0e0; }
h1 { color: #a78bfa; }
h2 { color: #60a5fa; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #333; }
th { background: #2a2a4a; }
.error { color: #ef4444; font-weight: bold; }
.warning { color: #f59e0b; }
.info { color: #3b82f6; }
.stat { display: inline-block; padding: 1rem; margin: 0.5rem; background: #2a2a4a; border-radius: 8px; min-width: 120px; text-align: center; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #a78bfa; }
.stat-label { font-size: 0.8rem; color: #888; }
</style>
</head>
<body>
<h1>Claude Doctor Report</h1>
<p>Generated: ${report.generatedAt}</p>
<p>Project: ${report.projectPath}</p>

<h2>Summary</h2>
<div>
<div class="stat"><div class="stat-value">${report.issues.length}</div><div class="stat-label">Issues</div></div>
<div class="stat"><div class="stat-value">${report.mcp.servers.length}</div><div class="stat-label">MCP Servers</div></div>
<div class="stat"><div class="stat-value">${report.plugins.plugins.length}</div><div class="stat-label">Plugins</div></div>
<div class="stat"><div class="stat-value">${report.conflicts.length}</div><div class="stat-label">Conflicts</div></div>
</div>

<h2>Issues</h2>
<table>
<thead><tr><th>Severity</th><th>Category</th><th>Message</th></tr></thead>
<tbody>${issueRows || "<tr><td colspan='3'>No issues</td></tr>"}</tbody>
</table>

<h2>Settings Layers</h2>
<table>
<thead><tr><th>Source</th><th>Path</th><th>Exists</th></tr></thead>
<tbody>
${report.settings.layers.map((l) => `<tr><td>${l.source}</td><td>${l.path ?? "N/A"}</td><td>${l.exists ? "Yes" : "No"}</td></tr>`).join("\n")}
</tbody>
</table>

<h2>Instructions</h2>
<table>
<thead><tr><th>Source</th><th>Path</th><th>Lines</th></tr></thead>
<tbody>
${report.instructions.layers.map((l) => `<tr><td>${l.source}</td><td>${l.path}</td><td>${l.lineCount}</td></tr>`).join("\n")}
</tbody>
</table>
</body>
</html>`;
}
