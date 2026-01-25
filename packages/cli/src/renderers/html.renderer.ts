import {
	type DiagnosticReport,
	INSTRUCTIONS_SOURCE_LABELS,
	IssueSeverity,
	MCP_SOURCE_LABELS,
	McpStatus,
	PluginStatus,
	SETTINGS_SOURCE_LABELS,
} from "../models/index.js";

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function formatValue(value: unknown): string {
	if (typeof value === "object" && value !== null) {
		return `<code>${escapeHtml(JSON.stringify(value, null, 2))}</code>`;
	}
	return escapeHtml(String(value));
}

export function renderDiagnosticReportHtml(report: DiagnosticReport): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Claude Code Diagnostic Report</title>
  <style>
    :root {
      --bg: #1a1a2e;
      --surface: #16213e;
      --primary: #0f3460;
      --accent: #e94560;
      --text: #eee;
      --text-dim: #888;
      --success: #4ade80;
      --warning: #fbbf24;
      --error: #ef4444;
      --info: #60a5fa;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 2rem;
      line-height: 1.6;
    }
    h1, h2, h3 { margin: 0 0 1rem; }
    h1 { color: var(--accent); }
    .container { max-width: 1200px; margin: 0 auto; }
    .card {
      background: var(--surface);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .card h2 {
      border-bottom: 1px solid var(--primary);
      padding-bottom: 0.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      text-align: left;
      padding: 0.5rem;
      border-bottom: 1px solid var(--primary);
    }
    th { color: var(--text-dim); font-weight: 500; }
    .status-enabled { color: var(--success); }
    .status-disabled { color: var(--warning); }
    .status-error { color: var(--error); }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-success { background: var(--success); color: #000; }
    .badge-warning { background: var(--warning); color: #000; }
    .badge-error { background: var(--error); color: #fff; }
    .badge-info { background: var(--info); color: #000; }
    code {
      background: var(--primary);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9em;
      white-space: pre-wrap;
      word-break: break-all;
    }
    pre {
      background: var(--primary);
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    .dim { color: var(--text-dim); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .stat-box {
      background: var(--primary);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value { font-size: 2rem; font-weight: bold; color: var(--accent); }
    .stat-label { color: var(--text-dim); font-size: 0.875rem; }
    .issue-list { list-style: none; padding: 0; }
    .issue-item { padding: 0.5rem 0; border-bottom: 1px solid var(--primary); }
    footer { text-align: center; color: var(--text-dim); margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Claude Code Diagnostic Report</h1>
    <p class="dim">Project: ${escapeHtml(report.projectPath)} | Generated: ${report.generatedAt.toISOString()}</p>

    <div class="card">
      <h2>Settings Hierarchy</h2>
      <table>
        <thead>
          <tr><th>Source</th><th>Path</th><th>Status</th><th>Keys</th></tr>
        </thead>
        <tbody>
          ${report.settings.layers
						.map(
							(layer) => `
            <tr>
              <td>${SETTINGS_SOURCE_LABELS[layer.source]}</td>
              <td><code>${layer.path ?? "N/A"}</code></td>
              <td class="${layer.exists ? "status-enabled" : "dim"}">${layer.exists ? "Found" : "Not found"}</td>
              <td>${layer.content ? Object.keys(layer.content).length : 0}</td>
            </tr>
          `,
						)
						.join("")}
        </tbody>
      </table>
      ${
				Object.keys(report.settings.merged).length > 0
					? `
        <h3>Merged Settings</h3>
        <pre>${escapeHtml(JSON.stringify(report.settings.merged, null, 2))}</pre>
      `
					: ""
			}
    </div>

    <div class="card">
      <h2>MCP Servers</h2>
      ${
				report.mcp.servers.length === 0
					? '<p class="dim">No MCP servers configured</p>'
					: `
        <table>
          <thead>
            <tr><th>Name</th><th>Transport</th><th>Source</th><th>Status</th><th>Connectivity</th></tr>
          </thead>
          <tbody>
            ${report.mcp.servers
							.map(
								(server) => `
              <tr>
                <td>${escapeHtml(server.name)}</td>
                <td>${server.transport}</td>
                <td>${MCP_SOURCE_LABELS[server.source]}</td>
                <td class="${server.status === McpStatus.Enabled ? "status-enabled" : "status-disabled"}">
                  ${server.status}
                </td>
                <td>${
									server.connectivity
										? server.connectivity.reachable
											? `<span class="status-enabled">✓ ${server.connectivity.latencyMs ?? ""}ms</span>`
											: `<span class="status-error">✗ ${escapeHtml(server.connectivity.error ?? "")}</span>`
										: '<span class="dim">Not checked</span>'
								}</td>
              </tr>
            `,
							)
							.join("")}
          </tbody>
        </table>
      `
			}
    </div>

    <div class="card">
      <h2>Plugins (${report.plugins.enabledCount} enabled / ${report.plugins.disabledCount} disabled)</h2>
      ${
				report.plugins.plugins.length === 0
					? '<p class="dim">No plugins installed</p>'
					: `
        <table>
          <thead>
            <tr><th>Name</th><th>Package</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${report.plugins.plugins
							.map(
								(plugin) => `
              <tr>
                <td>${escapeHtml(plugin.name)}</td>
                <td>${escapeHtml(plugin.package)}</td>
                <td>
                  <span class="badge ${plugin.status === PluginStatus.Enabled ? "badge-success" : "badge-warning"}">
                    ${plugin.status}
                  </span>
                </td>
              </tr>
            `,
							)
							.join("")}
          </tbody>
        </table>
      `
			}
    </div>

    <div class="card">
      <h2>CLAUDE.md Instructions</h2>
      <table>
        <thead>
          <tr><th>Source</th><th>Path</th><th>Status</th><th>Lines</th></tr>
        </thead>
        <tbody>
          ${report.instructions.layers
						.map(
							(layer) => `
            <tr>
              <td>${INSTRUCTIONS_SOURCE_LABELS[layer.source]}</td>
              <td><code>${escapeHtml(layer.path)}</code></td>
              <td class="${layer.exists ? "status-enabled" : "dim"}">${layer.exists ? "Found" : "Not found"}</td>
              <td>${layer.lineCount}</td>
            </tr>
          `,
						)
						.join("")}
        </tbody>
      </table>
      <p class="dim">Total: ${report.instructions.totalLines} lines</p>
    </div>

    <div class="card">
      <h2>Usage Statistics (${report.stats.stats.periodDays > 0 ? `Last ${report.stats.stats.periodDays} days` : "All time"})</h2>
      <div class="grid">
        <div class="stat-box">
          <div class="stat-value">${report.stats.stats.messages.toLocaleString()}</div>
          <div class="stat-label">Messages</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${report.stats.stats.sessions.toLocaleString()}</div>
          <div class="stat-label">Sessions</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${report.stats.stats.toolCalls.toLocaleString()}</div>
          <div class="stat-label">Tool Calls</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${report.stats.stats.costUsd > 0 ? `$${report.stats.stats.costUsd.toFixed(2)}` : "N/A"}</div>
          <div class="stat-label">Cost</div>
        </div>
      </div>
    </div>

    ${
			report.conflicts.length > 0
				? `
    <div class="card">
      <h2>Settings Conflicts (${report.conflicts.length})</h2>
      <ul class="issue-list">
        ${report.conflicts
					.map(
						(conflict) => `
          <li class="issue-item">
            <strong>${escapeHtml(conflict.key)}</strong>
            <ul>
              ${conflict.values.map((v) => `<li>${SETTINGS_SOURCE_LABELS[v.source]}: ${formatValue(v.value)}</li>`).join("")}
            </ul>
          </li>
        `,
					)
					.join("")}
      </ul>
    </div>
    `
				: ""
		}

    ${
			report.issues.length > 0
				? `
    <div class="card">
      <h2>Issues (${report.issues.length})</h2>
      <ul class="issue-list">
        ${report.issues
					.map((issue) => {
						const badgeClass =
							issue.severity === IssueSeverity.Error
								? "badge-error"
								: issue.severity === IssueSeverity.Warning
									? "badge-warning"
									: "badge-info";
						return `
          <li class="issue-item">
            <span class="badge ${badgeClass}">${issue.severity}</span>
            ${escapeHtml(issue.message)}
          </li>
        `;
					})
					.join("")}
      </ul>
    </div>
    `
				: ""
		}

    <footer>
      Generated by claude-doctor v0.1.0
    </footer>
  </div>
</body>
</html>`;
}
