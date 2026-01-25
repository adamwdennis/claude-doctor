export function renderDashboard(projectPath: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Claude Doctor Dashboard</title>
	<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
	<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
	<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
	<style>
		* { box-sizing: border-box; margin: 0; padding: 0; }
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
			background: #0d1117;
			color: #c9d1d9;
			line-height: 1.5;
		}
		.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
		header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20px 0;
			border-bottom: 1px solid #30363d;
			margin-bottom: 20px;
		}
		header h1 { font-size: 24px; color: #58a6ff; }
		.project-path { font-size: 12px; color: #8b949e; }

		.tabs {
			display: flex;
			gap: 4px;
			border-bottom: 1px solid #30363d;
			margin-bottom: 20px;
		}
		.tab {
			padding: 10px 16px;
			background: none;
			border: none;
			color: #8b949e;
			cursor: pointer;
			font-size: 14px;
			border-bottom: 2px solid transparent;
		}
		.tab:hover { color: #c9d1d9; }
		.tab.active {
			color: #58a6ff;
			border-bottom-color: #f78166;
		}

		.panel {
			background: #161b22;
			border: 1px solid #30363d;
			border-radius: 6px;
			padding: 16px;
			margin-bottom: 16px;
		}
		.panel h2 {
			font-size: 16px;
			margin-bottom: 12px;
			color: #c9d1d9;
		}
		.panel h3 {
			font-size: 14px;
			margin: 12px 0 8px;
			color: #8b949e;
		}

		.layer {
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 4px;
			padding: 12px;
			margin-bottom: 8px;
		}
		.layer-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
		}
		.layer-title { font-weight: 600; color: #58a6ff; }
		.layer-path { font-size: 12px; color: #8b949e; word-break: break-all; }
		.badge {
			font-size: 11px;
			padding: 2px 8px;
			border-radius: 10px;
			background: #238636;
			color: #fff;
		}
		.badge.missing { background: #6e7681; }
		.badge.disabled { background: #da3633; }
		.badge.warning { background: #d29922; }

		textarea {
			width: 100%;
			min-height: 200px;
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 4px;
			color: #c9d1d9;
			padding: 12px;
			font-family: monospace;
			font-size: 13px;
			resize: vertical;
		}
		textarea:focus { outline: none; border-color: #58a6ff; }

		.btn {
			padding: 8px 16px;
			background: #238636;
			border: none;
			border-radius: 4px;
			color: #fff;
			cursor: pointer;
			font-size: 14px;
		}
		.btn:hover { background: #2ea043; }
		.btn:disabled { background: #6e7681; cursor: not-allowed; }
		.btn-secondary {
			background: #21262d;
			border: 1px solid #30363d;
		}
		.btn-secondary:hover { background: #30363d; }

		.toggle {
			position: relative;
			width: 40px;
			height: 20px;
			background: #6e7681;
			border-radius: 10px;
			cursor: pointer;
		}
		.toggle.on { background: #238636; }
		.toggle::after {
			content: "";
			position: absolute;
			width: 16px;
			height: 16px;
			background: #fff;
			border-radius: 50%;
			top: 2px;
			left: 2px;
			transition: left 0.2s;
		}
		.toggle.on::after { left: 22px; }

		.server-item, .plugin-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 12px;
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 4px;
			margin-bottom: 8px;
		}
		.server-name, .plugin-name { font-weight: 600; }
		.server-info, .plugin-info { font-size: 12px; color: #8b949e; }

		.issue {
			padding: 12px;
			background: #0d1117;
			border-left: 3px solid #d29922;
			margin-bottom: 8px;
		}
		.issue.error { border-color: #da3633; }
		.issue.info { border-color: #58a6ff; }
		.issue-title { font-weight: 600; margin-bottom: 4px; }
		.issue-desc { font-size: 13px; color: #8b949e; }

		.stats-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 12px;
		}
		.stat-card {
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 4px;
			padding: 16px;
			text-align: center;
		}
		.stat-value { font-size: 32px; font-weight: 700; color: #58a6ff; }
		.stat-label { font-size: 12px; color: #8b949e; }

		.actions { display: flex; gap: 8px; margin-top: 12px; }

		.loading { text-align: center; padding: 40px; color: #8b949e; }
		.error-msg { color: #da3633; padding: 12px; background: #161b22; border-radius: 4px; margin: 8px 0; }
		.success-msg { color: #238636; padding: 12px; background: #161b22; border-radius: 4px; margin: 8px 0; }

		.live-indicator {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 12px;
			color: #8b949e;
		}
		.live-dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: #238636;
			animation: pulse 2s infinite;
		}
		.live-dot.disconnected { background: #da3633; animation: none; }
		@keyframes pulse {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.5; }
		}
		.update-toast {
			position: fixed;
			bottom: 20px;
			right: 20px;
			background: #238636;
			color: #fff;
			padding: 12px 20px;
			border-radius: 6px;
			font-size: 14px;
			animation: fadeInOut 2s forwards;
		}
		@keyframes fadeInOut {
			0% { opacity: 0; transform: translateY(10px); }
			10% { opacity: 1; transform: translateY(0); }
			90% { opacity: 1; }
			100% { opacity: 0; }
		}

		.editor-tabs {
			display: flex;
			gap: 2px;
			margin-bottom: 12px;
			border-bottom: 1px solid #30363d;
		}
		.editor-tab {
			padding: 8px 16px;
			background: none;
			border: none;
			color: #8b949e;
			cursor: pointer;
			font-size: 13px;
			border-bottom: 2px solid transparent;
		}
		.editor-tab:hover { color: #c9d1d9; }
		.editor-tab.active { color: #58a6ff; border-bottom-color: #58a6ff; }

		.form-field {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 10px 12px;
			background: #161b22;
			border: 1px solid #30363d;
			border-radius: 4px;
			margin-bottom: 8px;
		}
		.form-field:hover { border-color: #484f58; }
		.field-key {
			font-family: monospace;
			font-size: 13px;
			color: #79c0ff;
			min-width: 180px;
		}
		.field-value {
			flex: 1;
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.field-input {
			flex: 1;
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 4px;
			color: #c9d1d9;
			padding: 6px 10px;
			font-size: 13px;
			font-family: monospace;
		}
		.field-input:focus { outline: none; border-color: #58a6ff; }
		.field-type {
			font-size: 11px;
			color: #8b949e;
			background: #21262d;
			padding: 2px 6px;
			border-radius: 3px;
		}
		.field-delete {
			background: none;
			border: none;
			color: #8b949e;
			cursor: pointer;
			padding: 4px;
			font-size: 16px;
		}
		.field-delete:hover { color: #da3633; }

		.add-field {
			display: flex;
			gap: 8px;
			padding: 12px;
			background: #0d1117;
			border: 1px dashed #30363d;
			border-radius: 4px;
			margin-top: 12px;
		}
		.add-field input {
			flex: 1;
			background: #161b22;
			border: 1px solid #30363d;
			border-radius: 4px;
			color: #c9d1d9;
			padding: 6px 10px;
			font-size: 13px;
		}
		.add-field input:focus { outline: none; border-color: #58a6ff; }
		.add-field select {
			background: #161b22;
			border: 1px solid #30363d;
			border-radius: 4px;
			color: #c9d1d9;
			padding: 6px 10px;
			font-size: 13px;
		}

		.validation-msg {
			padding: 8px 12px;
			border-radius: 4px;
			font-size: 13px;
			margin-bottom: 12px;
		}
		.validation-msg.valid { background: rgba(35, 134, 54, 0.2); color: #3fb950; }
		.validation-msg.invalid { background: rgba(218, 54, 51, 0.2); color: #f85149; }

		.checkbox-field {
			width: 18px;
			height: 18px;
			cursor: pointer;
		}

		/* Nested editor styles */
		.nested-container {
			margin-top: 4px;
			border-left: 2px solid #30363d;
			padding-left: 12px;
			margin-left: 4px;
		}
		.collapse-header {
			display: flex;
			align-items: center;
			gap: 8px;
			cursor: pointer;
			padding: 6px 0;
			user-select: none;
		}
		.collapse-header:hover { color: #58a6ff; }
		.collapse-toggle {
			font-size: 10px;
			color: #8b949e;
			transition: transform 0.2s;
			width: 16px;
		}
		.collapse-toggle.expanded { transform: rotate(90deg); }
		.collapse-label {
			font-family: monospace;
			font-size: 13px;
			color: #79c0ff;
		}
		.collapse-meta {
			font-size: 11px;
			color: #8b949e;
		}

		.array-item {
			display: flex;
			align-items: flex-start;
			gap: 8px;
			padding: 4px 0;
		}
		.array-index {
			font-size: 11px;
			color: #8b949e;
			background: #21262d;
			padding: 2px 6px;
			border-radius: 3px;
			min-width: 24px;
			text-align: center;
		}
		.array-item-content { flex: 1; }
		.array-item-delete {
			background: none;
			border: none;
			color: #8b949e;
			cursor: pointer;
			padding: 4px;
			font-size: 14px;
		}
		.array-item-delete:hover { color: #da3633; }

		.add-item-btn {
			display: flex;
			align-items: center;
			gap: 4px;
			padding: 6px 12px;
			background: none;
			border: 1px dashed #30363d;
			border-radius: 4px;
			color: #8b949e;
			cursor: pointer;
			font-size: 12px;
			margin-top: 8px;
		}
		.add-item-btn:hover { border-color: #58a6ff; color: #58a6ff; }

		.inline-input {
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 4px;
			color: #c9d1d9;
			padding: 4px 8px;
			font-size: 13px;
			font-family: monospace;
			width: 100%;
		}
		.inline-input:focus { outline: none; border-color: #58a6ff; }

		.json-readonly {
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 4px;
			padding: 12px;
			font-family: monospace;
			font-size: 13px;
			overflow: auto;
			max-height: 400px;
			white-space: pre;
			color: #c9d1d9;
		}
		.json-readonly .json-key { color: #79c0ff; }
		.json-readonly .json-string { color: #a5d6ff; }
		.json-readonly .json-number { color: #79c0ff; }
		.json-readonly .json-boolean { color: #ff7b72; }
		.json-readonly .json-null { color: #8b949e; }

		/* Scope panel sections */
		.scope-section {
			margin-bottom: 20px;
		}
		.scope-section-header {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 10px 0;
			cursor: pointer;
			border-bottom: 1px solid #30363d;
			margin-bottom: 12px;
		}
		.scope-section-header:hover { color: #58a6ff; }
		.scope-section-toggle {
			font-size: 10px;
			color: #8b949e;
			transition: transform 0.2s;
		}
		.scope-section-toggle.expanded { transform: rotate(90deg); }
		.scope-section-title {
			font-size: 14px;
			font-weight: 600;
			color: #c9d1d9;
		}
		.scope-section-badge {
			font-size: 11px;
			padding: 2px 8px;
			border-radius: 10px;
			background: #21262d;
			color: #8b949e;
		}
		.scope-path {
			font-size: 12px;
			color: #8b949e;
			padding: 8px 12px;
			background: #0d1117;
			border-radius: 4px;
			margin-bottom: 12px;
			font-family: monospace;
		}

		/* Permissions Editor */
		.perm-editor {
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 6px;
			padding: 16px;
			margin-top: 12px;
		}
		.perm-section {
			margin-bottom: 16px;
		}
		.perm-section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8px;
		}
		.perm-section-title {
			font-size: 13px;
			font-weight: 600;
			color: #c9d1d9;
		}
		.perm-section-title.allow { color: #3fb950; }
		.perm-section-title.deny { color: #f85149; }
		.perm-list {
			display: flex;
			flex-wrap: wrap;
			gap: 6px;
			margin-bottom: 8px;
		}
		.perm-chip {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			padding: 4px 10px;
			background: #21262d;
			border: 1px solid #30363d;
			border-radius: 16px;
			font-size: 12px;
			font-family: monospace;
		}
		.perm-chip.allow { border-color: #238636; }
		.perm-chip.deny { border-color: #da3633; }
		/* Tool-type colors - near-black bg, light text */
		.perm-chip.tool-bash { background: #1a0f02; color: #fbbf24; border-color: #78350f; }
		.perm-chip.tool-read { background: #0a1628; color: #60a5fa; border-color: #1e3a8a; }
		.perm-chip.tool-edit { background: #120a24; color: #a78bfa; border-color: #4c1d95; }
		.perm-chip.tool-write { background: #181002; color: #facc15; border-color: #854d0e; }
		.perm-chip.tool-webfetch { background: #041418; color: #22d3ee; border-color: #155e75; }
		.perm-chip.tool-glob { background: #021208; color: #4ade80; border-color: #166534; }
		.perm-chip.tool-grep { background: #021208; color: #86efac; border-color: #166534; }
		.perm-chip.tool-task { background: #1a0610; color: #f472b6; border-color: #9d174d; }
		.perm-chip.tool-mcp { background: #0a1628; color: #93c5fd; border-color: #1e40af; }
		.perm-chip.tool-websearch { background: #120a24; color: #c4b5fd; border-color: #5b21b6; }
		.perm-chip.tool-todo { background: #1a0f02; color: #fcd34d; border-color: #92400e; }
		.perm-chip.tool-notebook { background: #180a02; color: #fdba74; border-color: #9a3412; }
		.perm-chip.tool-ask { background: #160828; color: #d8b4fe; border-color: #6b21a8; }
		.perm-chip.tool-other { background: #0a0a0a; color: #9ca3af; border-color: #374151; }
		.perm-chip-remove {
			background: none;
			border: none;
			color: #8b949e;
			cursor: pointer;
			padding: 0;
			font-size: 14px;
			line-height: 1;
		}
		.perm-chip-remove:hover { color: #f85149; }
		.perm-add-row {
			display: flex;
			gap: 8px;
			align-items: center;
		}
		.perm-input {
			flex: 1;
			background: #161b22;
			border: 1px solid #30363d;
			border-radius: 4px;
			color: #c9d1d9;
			padding: 6px 10px;
			font-size: 12px;
			font-family: monospace;
		}
		.perm-input:focus { outline: none; border-color: #58a6ff; }
		.perm-suggestions {
			margin-top: 12px;
			padding-top: 12px;
			border-top: 1px solid #30363d;
		}
		.perm-suggestions-title {
			font-size: 11px;
			color: #8b949e;
			margin-bottom: 8px;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.perm-suggestion {
			display: inline-block;
			padding: 4px 10px;
			background: #21262d;
			border: 1px dashed #30363d;
			border-radius: 4px;
			font-size: 11px;
			font-family: monospace;
			color: #8b949e;
			cursor: pointer;
			margin: 2px;
		}
		.perm-suggestion:hover {
			border-color: #58a6ff;
			color: #58a6ff;
		}
		/* Tool-type colors for suggestions - light text */
		.perm-suggestion.tool-bash { color: #fbbf24; border-color: #78350f; }
		.perm-suggestion.tool-read { color: #60a5fa; border-color: #1e3a8a; }
		.perm-suggestion.tool-edit { color: #a78bfa; border-color: #4c1d95; }
		.perm-suggestion.tool-write { color: #facc15; border-color: #854d0e; }
		.perm-suggestion.tool-webfetch { color: #22d3ee; border-color: #155e75; }
		.perm-suggestion.tool-websearch { color: #c4b5fd; border-color: #5b21b6; }
		.perm-suggestion.tool-glob { color: #4ade80; border-color: #166534; }
		.perm-suggestion.tool-grep { color: #86efac; border-color: #166534; }
		.perm-suggestion.tool-task { color: #f472b6; border-color: #9d174d; }
		.perm-suggestion.tool-mcp { color: #93c5fd; border-color: #1e40af; }
		.perm-suggestion.tool-todo { color: #fcd34d; border-color: #92400e; }
		.perm-suggestion.tool-notebook { color: #fdba74; border-color: #9a3412; }
		.perm-suggestion.tool-ask { color: #d8b4fe; border-color: #6b21a8; }
		.perm-suggestion:hover { background: #0a0a0a; }
		.perm-category {
			margin-bottom: 12px;
		}
		.perm-category-title {
			font-size: 11px;
			color: #8b949e;
			margin-bottom: 6px;
		}
		/* Modal styles */
		.modal-overlay {
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.8);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 1000;
		}
		.modal {
			background: #161b22;
			border: 1px solid #30363d;
			border-radius: 8px;
			max-width: 500px;
			width: 90%;
			max-height: 80vh;
			overflow: hidden;
			display: flex;
			flex-direction: column;
		}
		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16px;
			border-bottom: 1px solid #30363d;
		}
		.modal-title {
			font-size: 18px;
			font-weight: 600;
			color: #c9d1d9;
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.modal-close {
			background: none;
			border: none;
			color: #8b949e;
			font-size: 24px;
			cursor: pointer;
			padding: 0;
			line-height: 1;
		}
		.modal-close:hover { color: #f85149; }
		.modal-body {
			padding: 16px;
			overflow-y: auto;
		}
		.tool-desc {
			color: #8b949e;
			font-size: 14px;
			margin-bottom: 16px;
			line-height: 1.5;
		}
		.tool-section {
			margin-bottom: 16px;
		}
		.tool-section-title {
			font-size: 12px;
			color: #8b949e;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			margin-bottom: 8px;
		}
		.tool-capability {
			display: flex;
			align-items: flex-start;
			gap: 8px;
			padding: 8px;
			background: #0d1117;
			border-radius: 4px;
			margin-bottom: 4px;
			font-size: 13px;
			color: #c9d1d9;
		}
		.tool-capability-icon {
			color: #3fb950;
			font-weight: bold;
		}
		.tool-example {
			font-family: monospace;
			font-size: 12px;
			background: #0d1117;
			border: 1px solid #30363d;
			border-radius: 4px;
			padding: 8px;
			color: #79c0ff;
			margin-bottom: 4px;
		}
		.perm-chip { cursor: pointer; }
		.perm-chip:hover { opacity: 0.8; }
	</style>
</head>
<body>
	<div id="root"></div>
	<script type="text/babel">
		const { useState, useEffect, useCallback } = React;

		const API_BASE = "";
		const PROJECT_PATH = ${JSON.stringify(projectPath)};

		async function api(endpoint, options = {}) {
			const res = await fetch(API_BASE + endpoint, {
				...options,
				headers: { "Content-Type": "application/json", ...options.headers },
			});
			return res.json();
		}

		// Tool capabilities data
		const TOOL_INFO = {
			Bash: {
				description: "Execute shell commands in the terminal",
				capabilities: [
					"Run any shell command (git, npm, docker, etc.)",
					"Execute scripts and build tools",
					"Manage files and directories",
					"Install dependencies",
				],
				examples: ["Bash(npm run *)", "Bash(git *)", "Bash(make *)"],
			},
			Read: {
				description: "Read files from the filesystem",
				capabilities: [
					"Read text files of any type",
					"View images (PNG, JPG, etc.)",
					"Read PDF documents",
					"View Jupyter notebooks",
				],
				examples: ["Read", "Read(./src/**)", "Read(./*.md)"],
			},
			Edit: {
				description: "Make changes to existing files",
				capabilities: [
					"Replace text in files",
					"Insert new content",
					"Delete sections",
					"Refactor code",
				],
				examples: ["Edit", "Edit(./src/**)", "Edit(./*.ts)"],
			},
			Write: {
				description: "Create new files on the filesystem",
				capabilities: [
					"Create new source files",
					"Write configuration files",
					"Generate documentation",
					"Create scripts",
				],
				examples: ["Write", "Write(./dist/**)", "Write(./*.json)"],
			},
			WebFetch: {
				description: "Fetch and analyze web content",
				capabilities: [
					"Retrieve web pages",
					"Convert HTML to markdown",
					"Extract information from URLs",
					"Follow redirects",
				],
				examples: ["WebFetch", "WebFetch(https://docs.*)"],
			},
			WebSearch: {
				description: "Search the web for information",
				capabilities: [
					"Search for current information",
					"Find documentation",
					"Research topics",
					"Get up-to-date data",
				],
				examples: ["WebSearch"],
			},
			Glob: {
				description: "Find files by pattern matching",
				capabilities: [
					"Search for files by name patterns",
					"Find files recursively",
					"Filter by extension",
					"List directory contents",
				],
				examples: ["Glob", "Glob(**/*.ts)", "Glob(src/**/*)"],
			},
			Grep: {
				description: "Search file contents with regex",
				capabilities: [
					"Search for text patterns",
					"Find function definitions",
					"Locate imports and references",
					"Filter by file type",
				],
				examples: ["Grep", "Grep(TODO)", "Grep(function .*)"],
			},
			Task: {
				description: "Launch specialized agents for complex tasks",
				capabilities: [
					"Spawn sub-agents for research",
					"Delegate complex multi-step tasks",
					"Run background operations",
					"Coordinate parallel work",
				],
				examples: ["Task"],
			},
			TodoWrite: {
				description: "Manage task lists and track progress",
				capabilities: [
					"Create todo items",
					"Track task status",
					"Update progress",
					"Organize work",
				],
				examples: ["TodoWrite"],
			},
			NotebookEdit: {
				description: "Edit Jupyter notebook cells",
				capabilities: [
					"Modify notebook cells",
					"Add new cells",
					"Delete cells",
					"Change cell types",
				],
				examples: ["NotebookEdit", "NotebookEdit(./*.ipynb)"],
			},
			AskUserQuestion: {
				description: "Ask questions to gather user input",
				capabilities: [
					"Present multiple choice options",
					"Gather user preferences",
					"Clarify requirements",
					"Get decisions on approach",
				],
				examples: ["AskUserQuestion"],
			},
			mcp: {
				description: "Call MCP (Model Context Protocol) server tools",
				capabilities: [
					"Access external services",
					"Use custom integrations",
					"Call API endpoints",
					"Interact with databases",
				],
				examples: ["mcp__github__*", "mcp__slack__*"],
			},
		};

		// Modal component for tool info
		function ToolModal({ tool, onClose }) {
			const toolName = tool.replace(/\\(.*\\)$/, "").replace(/^mcp__.*/, "mcp");
			const info = TOOL_INFO[toolName] || TOOL_INFO[toolName.charAt(0).toUpperCase() + toolName.slice(1)] || {
				description: "Custom permission pattern",
				capabilities: ["Matches the specified pattern"],
				examples: [tool],
			};

			return (
				<div className="modal-overlay" onClick={onClose}>
					<div className="modal" onClick={e => e.stopPropagation()}>
						<div className="modal-header">
							<div className="modal-title">
								<span>{toolName}</span>
							</div>
							<button className="modal-close" onClick={onClose}>×</button>
						</div>
						<div className="modal-body">
							<p className="tool-desc">{info.description}</p>

							<div className="tool-section">
								<div className="tool-section-title">Capabilities</div>
								{info.capabilities.map((cap, i) => (
									<div key={i} className="tool-capability">
										<span className="tool-capability-icon">✓</span>
										<span>{cap}</span>
									</div>
								))}
							</div>

							<div className="tool-section">
								<div className="tool-section-title">Pattern Examples</div>
								{info.examples.map((ex, i) => (
									<div key={i} className="tool-example">{ex}</div>
								))}
							</div>
						</div>
					</div>
				</div>
			);
		}

		function App() {
			const [tab, setTab] = useState("user");
			const [loading, setLoading] = useState(false);
			const [data, setData] = useState(null);
			const [instructions, setInstructions] = useState(null);
			const [error, setError] = useState(null);
			const [connected, setConnected] = useState(false);
			const [toast, setToast] = useState(null);

			const loadData = useCallback(async () => {
				setLoading(true);
				setError(null);
				try {
					const [diagnose, instr] = await Promise.all([
						api("/api/diagnose"),
						api("/api/instructions")
					]);
					setData(diagnose);
					setInstructions(instr);
				} catch (e) {
					setError(e.message);
				}
				setLoading(false);
			}, []);

			useEffect(() => { loadData(); }, [loadData]);

			// SSE for live updates
			useEffect(() => {
				const eventSource = new EventSource("/api/events");

				eventSource.addEventListener("connected", () => {
					setConnected(true);
				});

				eventSource.addEventListener("update", (e) => {
					const data = JSON.parse(e.data);
					setToast("File changed: " + (data.filePath || "config"));
					loadData();
					setTimeout(() => setToast(null), 2000);
				});

				eventSource.onerror = () => {
					setConnected(false);
				};

				return () => eventSource.close();
			}, [loadData]);

			const tabs = [
				{ id: "user", label: "User" },
				{ id: "project", label: "Project" },
				{ id: "issues", label: "Issues" },
			];

			return (
				<div className="container">
					<header>
						<div>
							<h1>Claude Doctor</h1>
							<div className="project-path">{PROJECT_PATH}</div>
						</div>
						<div style={{display: "flex", alignItems: "center", gap: 16}}>
							<div className="live-indicator">
								<div className={"live-dot" + (connected ? "" : " disconnected")} />
								{connected ? "Live" : "Disconnected"}
							</div>
							<button className="btn btn-secondary" onClick={loadData}>Refresh</button>
						</div>
					</header>
					{toast && <div className="update-toast">{toast}</div>}

					<div className="tabs">
						{tabs.map(t => (
							<button
								key={t.id}
								className={"tab" + (tab === t.id ? " active" : "")}
								onClick={() => setTab(t.id)}
							>
								{t.label}
								{t.id === "issues" && data?.issues?.length > 0 && (
									<span style={{marginLeft: 6, color: "#d29922"}}>({data.issues.length})</span>
								)}
							</button>
						))}
					</div>

					{loading && <div className="loading">Loading...</div>}
					{error && <div className="error-msg">{error}</div>}

					{!loading && data && (
						<>
							{tab === "user" && <UserPanel data={data} instructions={instructions} onSave={loadData} />}
							{tab === "project" && <ProjectPanel data={data} instructions={instructions} onSave={loadData} />}
							{tab === "issues" && <IssuesPanel issues={data.issues} conflicts={data.conflicts} />}
						</>
					)}
				</div>
			);
		}

		function SettingsPanel({ data, onSave }) {
			const [editing, setEditing] = useState(null);
			const [message, setMessage] = useState(null);

			const layerLabels = {
				managed_policy: "Managed Policy",
				cli_flags: "CLI Flags",
				project_local: "Project Local",
				project_shared: "Project Shared",
				user: "User",
				default: "Built-in Defaults"
			};

			const writableLayers = ["user", "project_local", "project_shared"];
			const layerApiMap = {
				user: "user",
				project_local: "project-local",
				project_shared: "project-shared"
			};

			const handleEdit = (layer) => {
				setEditing(layer.source);
				setMessage(null);
			};

			const handleSave = async (content) => {
				try {
					const apiLayer = layerApiMap[editing];
					await api("/api/settings/" + apiLayer, {
						method: "PUT",
						body: JSON.stringify(content)
					});
					setMessage({ type: "success", text: "Saved successfully" });
					setEditing(null);
					onSave();
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
			};

			return (
				<div className="panel">
					<h2>Settings Hierarchy</h2>
					<p style={{fontSize: 13, color: "#8b949e", marginBottom: 16}}>
						Settings are merged top-to-bottom. Higher precedence wins.
					</p>

					{message && (
						<div className={message.type === "success" ? "success-msg" : "error-msg"}>
							{message.text}
						</div>
					)}

					{data.layers.map((layer, i) => (
						<div key={i} className="layer">
							<div className="layer-header">
								<span className="layer-title">{layerLabels[layer.source] || layer.source}</span>
								<span className={"badge" + (layer.exists ? "" : " missing")}>
									{layer.exists ? "exists" : "missing"}
								</span>
							</div>
							{layer.path && <div className="layer-path">{layer.path}</div>}

							{editing === layer.source ? (
								<SettingsEditor
									initialContent={layer.content || {}}
									onSave={handleSave}
									onCancel={() => setEditing(null)}
								/>
							) : (
								<>
									{layer.content && (
										<pre style={{
											marginTop: 8,
											fontSize: 12,
											background: "#161b22",
											padding: 8,
											borderRadius: 4,
											overflow: "auto",
											maxHeight: 150
										}}>
											{JSON.stringify(layer.content, null, 2)}
										</pre>
									)}
									{writableLayers.includes(layer.source) && (
										<div className="actions">
											<button className="btn btn-secondary" onClick={() => handleEdit(layer)}>
												{layer.exists ? "Edit" : "Create"}
											</button>
										</div>
									)}
								</>
							)}
						</div>
					))}

					<h3>Merged Settings</h3>
					<pre style={{
						fontSize: 12,
						background: "#0d1117",
						padding: 12,
						borderRadius: 4,
						overflow: "auto",
						border: "1px solid #30363d"
					}}>
						{JSON.stringify(data.merged, null, 2)}
					</pre>
				</div>
			);
		}

		// Permissions Editor - specialized UI for permissions object
		function PermissionsEditor({ value, onChange }) {
			const [allowInput, setAllowInput] = useState("");
			const [denyInput, setDenyInput] = useState("");
			const [modalTool, setModalTool] = useState(null);

			// Ensure value has the right structure
			const permissions = value || {};
			const allowList = permissions.allow || [];
			const denyList = permissions.deny || [];

			// Built-in tools
			const builtInTools = ["Bash", "Read", "Edit", "Write", "WebFetch", "Glob", "Grep", "Task"];

			// Common permission patterns organized by category
			const suggestions = {
				"Common Tools": [
					"Edit",
					"Read",
					"Write",
					"Bash",
					"WebFetch",
					"WebSearch",
					"Glob",
					"Grep",
					"Task",
				],
				"Bash Patterns": [
					"Bash(npm run *)",
					"Bash(npm test*)",
					"Bash(npm install*)",
					"Bash(git *)",
					"Bash(make *)",
					"Bash(cargo *)",
					"Bash(python *)",
					"Bash(node *)",
				],
				"File Patterns": [
					"Read(./src/**)",
					"Edit(./src/**)",
					"Read(./tests/**)",
					"Edit(./tests/**)",
					"Write(./dist/**)",
				],
				"Deny Suggestions": [
					"Read(./.env)",
					"Read(./.env.*)",
					"Read(./secrets/**)",
					"Read(./**/credentials*)",
					"Read(./**/*.pem)",
					"Read(./**/*.key)",
					"Bash(rm -rf *)",
					"Bash(sudo *)",
				],
			};

			// Get tool type for color coding
			const getToolType = (perm) => {
				const lower = perm.toLowerCase();
				if (lower === "bash" || lower.startsWith("bash(")) return "bash";
				if (lower === "read" || lower.startsWith("read(")) return "read";
				if (lower === "edit" || lower.startsWith("edit(")) return "edit";
				if (lower === "write" || lower.startsWith("write(")) return "write";
				if (lower === "webfetch" || lower.startsWith("webfetch(")) return "webfetch";
				if (lower === "websearch" || lower.startsWith("websearch(")) return "websearch";
				if (lower === "glob" || lower.startsWith("glob(")) return "glob";
				if (lower === "grep" || lower.startsWith("grep(")) return "grep";
				if (lower === "task" || lower.startsWith("task(")) return "task";
				if (lower === "todowrite" || lower.startsWith("todowrite(")) return "todo";
				if (lower === "notebookedit" || lower.startsWith("notebookedit(")) return "notebook";
				if (lower === "askuserquestion" || lower.startsWith("askuserquestion(")) return "ask";
				if (lower.startsWith("mcp__") || lower.startsWith("mcp(")) return "mcp";
				return "other";
			};

			const handleAddAllow = (perm) => {
				const trimmed = (perm || allowInput).trim();
				if (trimmed && !allowList.includes(trimmed)) {
					onChange({ ...permissions, allow: [...allowList, trimmed] });
					setAllowInput("");
				}
			};

			const handleAddDeny = (perm) => {
				const trimmed = (perm || denyInput).trim();
				if (trimmed && !denyList.includes(trimmed)) {
					onChange({ ...permissions, deny: [...denyList, trimmed] });
					setDenyInput("");
				}
			};

			const handleRemoveAllow = (index) => {
				const newList = allowList.filter((_, i) => i !== index);
				onChange({ ...permissions, allow: newList });
			};

			const handleRemoveDeny = (index) => {
				const newList = denyList.filter((_, i) => i !== index);
				onChange({ ...permissions, deny: newList });
			};

			return (
				<div className="perm-editor">
					{/* Allow Section */}
					<div className="perm-section">
						<div className="perm-section-header">
							<span className="perm-section-title allow">Allow</span>
							<span style={{fontSize: 11, color: "#8b949e"}}>{allowList.length} rules</span>
						</div>
						<div className="perm-list">
							{allowList.length === 0 ? (
								<span style={{fontSize: 12, color: "#8b949e", fontStyle: "italic"}}>No allow rules</span>
							) : (
								allowList.map((perm, i) => (
									<span key={i} className={"perm-chip allow tool-" + getToolType(perm)} onClick={() => setModalTool(perm)}>
										{perm}
										<button className="perm-chip-remove" onClick={e => { e.stopPropagation(); handleRemoveAllow(i); }}>×</button>
									</span>
								))
							)}
						</div>
						<div className="perm-add-row">
							<input
								type="text"
								className="perm-input"
								placeholder="Add permission pattern (e.g., Bash(npm *))"
								value={allowInput}
								onChange={e => setAllowInput(e.target.value)}
								onKeyDown={e => e.key === "Enter" && handleAddAllow()}
							/>
							<button className="btn btn-secondary" onClick={() => handleAddAllow()} style={{padding: "6px 12px", fontSize: 12}}>
								+ Allow
							</button>
						</div>
					</div>

					{/* Deny Section */}
					<div className="perm-section">
						<div className="perm-section-header">
							<span className="perm-section-title deny">Deny</span>
							<span style={{fontSize: 11, color: "#8b949e"}}>{denyList.length} rules</span>
						</div>
						<div className="perm-list">
							{denyList.length === 0 ? (
								<span style={{fontSize: 12, color: "#8b949e", fontStyle: "italic"}}>No deny rules</span>
							) : (
								denyList.map((perm, i) => (
									<span key={i} className={"perm-chip deny tool-" + getToolType(perm)} onClick={() => setModalTool(perm)}>
										{perm}
										<button className="perm-chip-remove" onClick={e => { e.stopPropagation(); handleRemoveDeny(i); }}>×</button>
									</span>
								))
							)}
						</div>
						<div className="perm-add-row">
							<input
								type="text"
								className="perm-input"
								placeholder="Add deny pattern (e.g., Read(./.env))"
								value={denyInput}
								onChange={e => setDenyInput(e.target.value)}
								onKeyDown={e => e.key === "Enter" && handleAddDeny()}
							/>
							<button className="btn btn-secondary" onClick={() => handleAddDeny()} style={{padding: "6px 12px", fontSize: 12}}>
								+ Deny
							</button>
						</div>
					</div>

					{/* Suggestions */}
					<div className="perm-suggestions">
						<div className="perm-suggestions-title">Quick Add Suggestions</div>
						{Object.entries(suggestions).map(([category, items]) => (
							<div key={category} className="perm-category">
								<div className="perm-category-title">{category}</div>
								{items.map((item, i) => {
									const isAllow = category !== "Deny Suggestions";
									const alreadyAdded = isAllow ? allowList.includes(item) : denyList.includes(item);
									const toolType = getToolType(item);
									return (
										<span
											key={i}
											className={"perm-suggestion tool-" + toolType}
											style={alreadyAdded ? {opacity: 0.4, cursor: "default"} : {}}
											onClick={() => !alreadyAdded && (isAllow ? handleAddAllow(item) : handleAddDeny(item))}
										>
											{isAllow ? "+" : "-"} {item}
										</span>
									);
								})}
							</div>
						))}
					</div>

					{/* Tool Info Modal */}
					{modalTool && <ToolModal tool={modalTool} onClose={() => setModalTool(null)} />}
				</div>
			);
		}

		// Syntax-highlighted JSON for read-only display
		function SyntaxHighlightedJson({ data }) {
			const highlight = (obj, indent = 0) => {
				const pad = "  ".repeat(indent);
				const nl = "\\n";
				if (obj === null) return <span className="json-null">null</span>;
				if (typeof obj === "boolean") return <span className="json-boolean">{String(obj)}</span>;
				if (typeof obj === "number") return <span className="json-number">{obj}</span>;
				if (typeof obj === "string") return <span className="json-string">"{obj}"</span>;
				if (Array.isArray(obj)) {
					if (obj.length === 0) return "[]";
					return (
						<>
							{"[" + nl}
							{obj.map((item, i) => (
								<span key={i}>
									{pad}  {highlight(item, indent + 1)}
									{i < obj.length - 1 ? "," + nl : nl}
								</span>
							))}
							{pad}]
						</>
					);
				}
				if (typeof obj === "object") {
					const keys = Object.keys(obj);
					if (keys.length === 0) return "{}";
					return (
						<>
							{"{" + nl}
							{keys.map((key, i) => (
								<span key={key}>
									{pad}  <span className="json-key">"{key}"</span>: {highlight(obj[key], indent + 1)}
									{i < keys.length - 1 ? "," + nl : nl}
								</span>
							))}
							{pad}{"}"}
						</>
					);
				}
				return String(obj);
			};
			return <pre className="json-readonly">{highlight(data)}</pre>;
		}

		// ValueEditor: renders appropriate input based on type
		function ValueEditor({ value, onChange, onDelete }) {
			const getType = (v) => {
				if (v === null) return "null";
				if (Array.isArray(v)) return "array";
				return typeof v;
			};
			const type = getType(value);

			if (type === "boolean") {
				return (
					<div style={{display: "flex", alignItems: "center", gap: 8}}>
						<input
							type="checkbox"
							className="checkbox-field"
							checked={value}
							onChange={e => onChange(e.target.checked)}
						/>
						<span className="field-type">boolean</span>
						{onDelete && <button className="array-item-delete" onClick={onDelete}>×</button>}
					</div>
				);
			}

			if (type === "number") {
				return (
					<div style={{display: "flex", alignItems: "center", gap: 8}}>
						<input
							type="number"
							className="inline-input"
							value={value}
							onChange={e => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
							style={{maxWidth: 150}}
						/>
						<span className="field-type">number</span>
						{onDelete && <button className="array-item-delete" onClick={onDelete}>×</button>}
					</div>
				);
			}

			if (type === "string") {
				return (
					<div style={{display: "flex", alignItems: "center", gap: 8}}>
						<input
							type="text"
							className="inline-input"
							value={value}
							onChange={e => onChange(e.target.value)}
						/>
						<span className="field-type">string</span>
						{onDelete && <button className="array-item-delete" onClick={onDelete}>×</button>}
					</div>
				);
			}

			if (type === "array") {
				return <ArrayEditor value={value} onChange={onChange} onDelete={onDelete} />;
			}

			if (type === "object") {
				return <ObjectEditor value={value} onChange={onChange} onDelete={onDelete} />;
			}

			// null or unknown
			return (
				<div style={{display: "flex", alignItems: "center", gap: 8}}>
					<span style={{color: "#8b949e", fontStyle: "italic"}}>null</span>
					<span className="field-type">null</span>
					{onDelete && <button className="array-item-delete" onClick={onDelete}>×</button>}
				</div>
			);
		}

		// ObjectEditor: collapsible container for objects
		function ObjectEditor({ value, onChange, onDelete, label }) {
			const [expanded, setExpanded] = useState(true);
			const [newKey, setNewKey] = useState("");
			const [newType, setNewType] = useState("string");

			const keys = Object.keys(value || {});

			const handleKeyChange = (key, newValue) => {
				onChange({ ...value, [key]: newValue });
			};

			const handleKeyDelete = (key) => {
				const next = { ...value };
				delete next[key];
				onChange(next);
			};

			const handleAddKey = () => {
				if (!newKey.trim() || value.hasOwnProperty(newKey)) return;
				let defaultValue;
				switch (newType) {
					case "boolean": defaultValue = false; break;
					case "number": defaultValue = 0; break;
					case "array": defaultValue = []; break;
					case "object": defaultValue = {}; break;
					default: defaultValue = "";
				}
				onChange({ ...value, [newKey]: defaultValue });
				setNewKey("");
			};

			return (
				<div>
					<div className="collapse-header" onClick={() => setExpanded(!expanded)}>
						<span className={"collapse-toggle" + (expanded ? " expanded" : "")}>▶</span>
						{label && <span className="collapse-label">{label}</span>}
						<span className="collapse-meta">{"{" + keys.length + " keys}"}</span>
						<span className="field-type">object</span>
						{onDelete && (
							<button className="array-item-delete" onClick={e => { e.stopPropagation(); onDelete(); }}>×</button>
						)}
					</div>
					{expanded && (
						<div className="nested-container">
							{keys.map(key => (
								<div key={key} style={{marginBottom: 8}}>
									<div style={{display: "flex", alignItems: "flex-start", gap: 8}}>
										<span className="collapse-label" style={{minWidth: 100, paddingTop: 4}}>{key}:</span>
										<div style={{flex: 1}}>
											{key === "permissions" ? (
												<PermissionsEditor
													value={value[key]}
													onChange={v => handleKeyChange(key, v)}
												/>
											) : (
												<ValueEditor
													value={value[key]}
													onChange={v => handleKeyChange(key, v)}
													onDelete={() => handleKeyDelete(key)}
												/>
											)}
										</div>
									</div>
								</div>
							))}
							{keys.length === 0 && (
								<p style={{color: "#8b949e", fontSize: 12, padding: 4}}>Empty object</p>
							)}
							<div style={{display: "flex", gap: 8, marginTop: 8}}>
								<input
									type="text"
									className="inline-input"
									placeholder="New key"
									value={newKey}
									onChange={e => setNewKey(e.target.value)}
									onKeyDown={e => e.key === "Enter" && handleAddKey()}
									style={{maxWidth: 120}}
								/>
								<select
									value={newType}
									onChange={e => setNewType(e.target.value)}
									style={{
										background: "#161b22",
										border: "1px solid #30363d",
										borderRadius: 4,
										color: "#c9d1d9",
										padding: "4px 8px",
										fontSize: 12
									}}
								>
									<option value="string">string</option>
									<option value="number">number</option>
									<option value="boolean">boolean</option>
									<option value="array">array</option>
									<option value="object">object</option>
								</select>
								<button className="add-item-btn" onClick={handleAddKey} style={{marginTop: 0}}>+ Add</button>
							</div>
						</div>
					)}
				</div>
			);
		}

		// ArrayEditor: collapsible container for arrays
		function ArrayEditor({ value, onChange, onDelete }) {
			const [expanded, setExpanded] = useState(true);
			const [newType, setNewType] = useState("string");

			const arr = value || [];

			const handleItemChange = (index, newValue) => {
				const next = [...arr];
				next[index] = newValue;
				onChange(next);
			};

			const handleItemDelete = (index) => {
				const next = arr.filter((_, i) => i !== index);
				onChange(next);
			};

			const handleAddItem = () => {
				let defaultValue;
				switch (newType) {
					case "boolean": defaultValue = false; break;
					case "number": defaultValue = 0; break;
					case "array": defaultValue = []; break;
					case "object": defaultValue = {}; break;
					default: defaultValue = "";
				}
				onChange([...arr, defaultValue]);
			};

			return (
				<div>
					<div className="collapse-header" onClick={() => setExpanded(!expanded)}>
						<span className={"collapse-toggle" + (expanded ? " expanded" : "")}>▶</span>
						<span className="collapse-meta">{"[" + arr.length + " items]"}</span>
						<span className="field-type">array</span>
						{onDelete && (
							<button className="array-item-delete" onClick={e => { e.stopPropagation(); onDelete(); }}>×</button>
						)}
					</div>
					{expanded && (
						<div className="nested-container">
							{arr.map((item, i) => (
								<div key={i} className="array-item">
									<span className="array-index">{i}</span>
									<div className="array-item-content">
										<ValueEditor
											value={item}
											onChange={v => handleItemChange(i, v)}
											onDelete={() => handleItemDelete(i)}
										/>
									</div>
								</div>
							))}
							{arr.length === 0 && (
								<p style={{color: "#8b949e", fontSize: 12, padding: 4}}>Empty array</p>
							)}
							<div style={{display: "flex", gap: 8, marginTop: 8}}>
								<select
									value={newType}
									onChange={e => setNewType(e.target.value)}
									style={{
										background: "#161b22",
										border: "1px solid #30363d",
										borderRadius: 4,
										color: "#c9d1d9",
										padding: "4px 8px",
										fontSize: 12
									}}
								>
									<option value="string">string</option>
									<option value="number">number</option>
									<option value="boolean">boolean</option>
									<option value="array">array</option>
									<option value="object">object</option>
								</select>
								<button className="add-item-btn" onClick={handleAddItem} style={{marginTop: 0}}>+ Add item</button>
							</div>
						</div>
					)}
				</div>
			);
		}

		function SettingsEditor({ initialContent, onSave, onCancel }) {
			const [tab, setTab] = useState("form");
			const [formData, setFormData] = useState(initialContent);
			const [jsonText, setJsonText] = useState(JSON.stringify(initialContent, null, 2));
			const [validation, setValidation] = useState({ valid: true, message: "" });
			const [jsonEditing, setJsonEditing] = useState(false);

			// Sync form data to JSON when switching tabs
			const handleTabSwitch = (newTab) => {
				if (tab === "form" && newTab === "json") {
					setJsonText(JSON.stringify(formData, null, 2));
					setJsonEditing(false);
				} else if (tab === "json" && newTab === "form") {
					if (jsonEditing) {
						try {
							const parsed = JSON.parse(jsonText);
							setFormData(parsed);
							setValidation({ valid: true, message: "" });
						} catch (e) {
							setValidation({ valid: false, message: "Invalid JSON: " + e.message });
							return;
						}
					}
				}
				setTab(newTab);
			};

			const validateJson = () => {
				try {
					JSON.parse(jsonText);
					setValidation({ valid: true, message: "Valid JSON" });
				} catch (e) {
					setValidation({ valid: false, message: "Invalid JSON: " + e.message });
				}
			};

			const handleStartJsonEdit = () => {
				setJsonText(JSON.stringify(formData, null, 2));
				setJsonEditing(true);
			};

			const handleCancelJsonEdit = () => {
				setJsonText(JSON.stringify(formData, null, 2));
				setJsonEditing(false);
				setValidation({ valid: true, message: "" });
			};

			const handleSave = () => {
				if (tab === "json" && jsonEditing) {
					try {
						const parsed = JSON.parse(jsonText);
						onSave(parsed);
					} catch (e) {
						setValidation({ valid: false, message: "Cannot save invalid JSON" });
					}
				} else {
					onSave(formData);
				}
			};

			return (
				<div style={{marginTop: 12}}>
					<div className="editor-tabs">
						<button
							className={"editor-tab" + (tab === "form" ? " active" : "")}
							onClick={() => handleTabSwitch("form")}
						>
							Form
						</button>
						<button
							className={"editor-tab" + (tab === "json" ? " active" : "")}
							onClick={() => handleTabSwitch("json")}
						>
							JSON
						</button>
					</div>

					{tab === "form" ? (
						<div>
							<ObjectEditor
								value={formData}
								onChange={setFormData}
								label={null}
							/>
						</div>
					) : (
						<div>
							{validation.message && (
								<div className={"validation-msg " + (validation.valid ? "valid" : "invalid")}>
									{validation.message}
								</div>
							)}
							{jsonEditing ? (
								<>
									<textarea
										value={jsonText}
										onChange={e => {
											setJsonText(e.target.value);
											setValidation({ valid: true, message: "" });
										}}
										rows={12}
										style={{fontFamily: "monospace"}}
									/>
									<div className="actions">
										<button className="btn btn-secondary" onClick={validateJson}>Validate</button>
										<button className="btn btn-secondary" onClick={handleCancelJsonEdit}>Cancel Edit</button>
									</div>
								</>
							) : (
								<>
									<SyntaxHighlightedJson data={formData} />
									<div className="actions">
										<button className="btn btn-secondary" onClick={handleStartJsonEdit}>Edit JSON</button>
									</div>
								</>
							)}
						</div>
					)}

					<div className="actions" style={{marginTop: 16}}>
						<button className="btn" onClick={handleSave}>Save</button>
						<button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
					</div>
				</div>
			);
		}

		// Collapsible section component
		function ScopeSection({ title, badge, children, defaultExpanded = true }) {
			const [expanded, setExpanded] = useState(defaultExpanded);
			return (
				<div className="scope-section">
					<div className="scope-section-header" onClick={() => setExpanded(!expanded)}>
						<span className={"scope-section-toggle" + (expanded ? " expanded" : "")}>▶</span>
						<span className="scope-section-title">{title}</span>
						{badge && <span className="scope-section-badge">{badge}</span>}
					</div>
					{expanded && children}
				</div>
			);
		}

		// User Panel - shows user-level config
		function UserPanel({ data, instructions, onSave }) {
			const [editing, setEditing] = useState(null);
			const [editContent, setEditContent] = useState("");
			const [message, setMessage] = useState(null);
			const [checking, setChecking] = useState(null);
			const [checkResult, setCheckResult] = useState({});
			const [toggling, setToggling] = useState(null);

			// Filter user-level data
			const userSettings = data.settings?.layers?.find(l => l.source === "user");
			const userMcpSource = data.mcp?.sources?.find(s => s.source === "user_global");
			const userMcpServers = data.mcp?.servers?.filter(s => s.source === "user_global") || [];
			const userInstr = instructions?.layers?.find(l => l.source === "user");

			const handleSettingsSave = async (content) => {
				try {
					await api("/api/settings/user", { method: "PUT", body: JSON.stringify(content) });
					setMessage({ type: "success", text: "Settings saved" });
					setEditing(null);
					onSave();
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
			};

			const handleInstructionsSave = async () => {
				try {
					await api("/api/instructions/user", {
						method: "PUT",
						body: editContent,
						headers: { "Content-Type": "text/plain" }
					});
					setMessage({ type: "success", text: "Instructions saved" });
					setEditing(null);
					onSave();
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
			};

			const handleMcpCheck = async (serverName) => {
				setChecking(serverName);
				try {
					const result = await api("/api/mcp/check/" + serverName, { method: "POST" });
					setCheckResult(prev => ({ ...prev, [serverName]: result }));
				} catch (e) {
					setCheckResult(prev => ({ ...prev, [serverName]: { error: e.message } }));
				}
				setChecking(null);
			};

			const handlePluginToggle = async (plugin) => {
				setToggling(plugin.fullName);
				try {
					await api("/api/plugins/" + encodeURIComponent(plugin.fullName), {
						method: "PUT",
						body: JSON.stringify({ enabled: plugin.status !== "enabled" })
					});
					onSave();
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
				setToggling(null);
			};

			return (
				<div className="panel">
					<h2>User Configuration</h2>
					<div className="scope-path">~/.claude/</div>

					{message && (
						<div className={message.type === "success" ? "success-msg" : "error-msg"}>
							{message.text}
						</div>
					)}

					{/* Settings Section */}
					<ScopeSection title="Settings" badge={userSettings?.exists ? "exists" : "missing"}>
						<div className="layer-path">{userSettings?.path}</div>
						{editing === "settings" ? (
							<SettingsEditor
								initialContent={userSettings?.content || {}}
								onSave={handleSettingsSave}
								onCancel={() => setEditing(null)}
							/>
						) : (
							<>
								{userSettings?.content && (
									<pre style={{fontSize: 12, background: "#161b22", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 150}}>
										{JSON.stringify(userSettings.content, null, 2)}
									</pre>
								)}
								<div className="actions">
									<button className="btn btn-secondary" onClick={() => setEditing("settings")}>
										{userSettings?.exists ? "Edit" : "Create"}
									</button>
								</div>
							</>
						)}
					</ScopeSection>

					{/* MCP Servers Section */}
					<ScopeSection title="MCP Servers" badge={userMcpServers.length + " servers"}>
						<div className="layer-path">{userMcpSource?.path}</div>
						{userMcpServers.length === 0 ? (
							<p style={{color: "#8b949e", fontSize: 13}}>No MCP servers configured</p>
						) : (
							userMcpServers.map((server, i) => {
								const result = checkResult[server.name];
								return (
									<div key={i} className="server-item">
										<div>
											<div className="server-name">{server.name}</div>
											<div className="server-info">
												{server.transport}
												{server.url && <span> | {server.url}</span>}
												{server.command && <span> | {server.command}</span>}
											</div>
											{result && (
												<div style={{marginTop: 4, fontSize: 12}}>
													{result.reachable ? (
														<span style={{color: "#238636"}}>Reachable {result.latencyMs && "(" + result.latencyMs + "ms)"}</span>
													) : (
														<span style={{color: "#da3633"}}>{result.error || "Unreachable"}</span>
													)}
												</div>
											)}
										</div>
										<div style={{display: "flex", gap: 8, alignItems: "center"}}>
											<span className={"badge" + (server.disabled ? " disabled" : "")}>{server.disabled ? "disabled" : "enabled"}</span>
											<button className="btn btn-secondary" onClick={() => handleMcpCheck(server.name)} disabled={checking === server.name || server.disabled} style={{padding: "4px 8px", fontSize: 12}}>
												{checking === server.name ? "..." : "Check"}
											</button>
										</div>
									</div>
								);
							})
						)}
					</ScopeSection>

					{/* Instructions Section */}
					<ScopeSection title="Instructions (CLAUDE.md)" badge={userInstr?.exists ? userInstr.lineCount + " lines" : "missing"}>
						<div className="layer-path">{userInstr?.path}</div>
						{editing === "instructions" ? (
							<div style={{marginTop: 12}}>
								<textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={15} style={{fontFamily: "monospace"}} />
								<div className="actions">
									<button className="btn" onClick={handleInstructionsSave}>Save</button>
									<button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
								</div>
							</div>
						) : (
							<>
								{userInstr?.content && (
									<pre style={{marginTop: 8, fontSize: 12, background: "#161b22", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 200, whiteSpace: "pre-wrap"}}>
										{userInstr.content}
									</pre>
								)}
								<div className="actions">
									<button className="btn btn-secondary" onClick={() => { setEditing("instructions"); setEditContent(userInstr?.content || ""); }}>
										{userInstr?.exists ? "Edit" : "Create"}
									</button>
								</div>
							</>
						)}
					</ScopeSection>

					{/* Plugins Section */}
					<ScopeSection title="Plugins" badge={data.plugins?.enabledCount + " enabled"}>
						<div style={{marginBottom: 8, fontSize: 13, color: "#8b949e"}}>
							{data.plugins?.enabledCount || 0} enabled, {data.plugins?.disabledCount || 0} disabled
						</div>
						{data.plugins?.plugins?.length === 0 ? (
							<p style={{color: "#8b949e", fontSize: 13}}>No plugins installed</p>
						) : (
							data.plugins?.plugins?.map((plugin, i) => (
								<div key={i} className="plugin-item">
									<div>
										<div className="plugin-name">{plugin.fullName}</div>
										<div className="plugin-info">{plugin.version && <span>v{plugin.version}</span>}</div>
									</div>
									<div className={"toggle" + (plugin.status === "enabled" ? " on" : "")} onClick={() => handlePluginToggle(plugin)} style={{opacity: toggling === plugin.fullName ? 0.5 : 1}} />
								</div>
							))
						)}
					</ScopeSection>
				</div>
			);
		}

		// Project Panel - shows project-level config
		function ProjectPanel({ data, instructions, onSave }) {
			const [editing, setEditing] = useState(null);
			const [editContent, setEditContent] = useState("");
			const [message, setMessage] = useState(null);
			const [checking, setChecking] = useState(null);
			const [checkResult, setCheckResult] = useState({});

			// Filter project-level data
			const projectShared = data.settings?.layers?.find(l => l.source === "project_shared");
			const projectLocal = data.settings?.layers?.find(l => l.source === "project_local");
			const projectMcpSource = data.mcp?.sources?.find(s => s.source === "project");
			const projectMcpServers = data.mcp?.servers?.filter(s => s.source === "project") || [];
			const projectClaudeInstr = instructions?.layers?.find(l => l.source === "project_claude_dir");
			const projectRootInstr = instructions?.layers?.find(l => l.source === "project_root");

			const handleSettingsSave = async (content, layer) => {
				const apiLayer = layer === "project_shared" ? "project-shared" : "project-local";
				try {
					await api("/api/settings/" + apiLayer, { method: "PUT", body: JSON.stringify(content) });
					setMessage({ type: "success", text: "Settings saved" });
					setEditing(null);
					onSave();
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
			};

			const handleInstructionsSave = async (apiPath) => {
				try {
					await api("/api/instructions/" + apiPath, {
						method: "PUT",
						body: editContent,
						headers: { "Content-Type": "text/plain" }
					});
					setMessage({ type: "success", text: "Instructions saved" });
					setEditing(null);
					onSave();
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
			};

			const handleMcpCheck = async (serverName) => {
				setChecking(serverName);
				try {
					const result = await api("/api/mcp/check/" + serverName, { method: "POST" });
					setCheckResult(prev => ({ ...prev, [serverName]: result }));
				} catch (e) {
					setCheckResult(prev => ({ ...prev, [serverName]: { error: e.message } }));
				}
				setChecking(null);
			};

			return (
				<div className="panel">
					<h2>Project Configuration</h2>
					<div className="scope-path">.claude/</div>

					{message && (
						<div className={message.type === "success" ? "success-msg" : "error-msg"}>
							{message.text}
						</div>
					)}

					{/* Shared Settings Section */}
					<ScopeSection title="Settings (Shared)" badge={projectShared?.exists ? "exists" : "missing"}>
						<div className="layer-path">{projectShared?.path}</div>
						<p style={{fontSize: 12, color: "#8b949e", marginBottom: 8}}>Committed to repo, shared with team</p>
						{editing === "settings_shared" ? (
							<SettingsEditor
								initialContent={projectShared?.content || {}}
								onSave={(c) => handleSettingsSave(c, "project_shared")}
								onCancel={() => setEditing(null)}
							/>
						) : (
							<>
								{projectShared?.content && (
									<pre style={{fontSize: 12, background: "#161b22", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 150}}>
										{JSON.stringify(projectShared.content, null, 2)}
									</pre>
								)}
								<div className="actions">
									<button className="btn btn-secondary" onClick={() => setEditing("settings_shared")}>
										{projectShared?.exists ? "Edit" : "Create"}
									</button>
								</div>
							</>
						)}
					</ScopeSection>

					{/* Local Settings Section */}
					<ScopeSection title="Settings (Local)" badge={projectLocal?.exists ? "exists" : "missing"}>
						<div className="layer-path">{projectLocal?.path}</div>
						<p style={{fontSize: 12, color: "#8b949e", marginBottom: 8}}>Git-ignored, machine-specific</p>
						{editing === "settings_local" ? (
							<SettingsEditor
								initialContent={projectLocal?.content || {}}
								onSave={(c) => handleSettingsSave(c, "project_local")}
								onCancel={() => setEditing(null)}
							/>
						) : (
							<>
								{projectLocal?.content && (
									<pre style={{fontSize: 12, background: "#161b22", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 150}}>
										{JSON.stringify(projectLocal.content, null, 2)}
									</pre>
								)}
								<div className="actions">
									<button className="btn btn-secondary" onClick={() => setEditing("settings_local")}>
										{projectLocal?.exists ? "Edit" : "Create"}
									</button>
								</div>
							</>
						)}
					</ScopeSection>

					{/* MCP Servers Section */}
					<ScopeSection title="MCP Servers" badge={projectMcpServers.length + " servers"}>
						<div className="layer-path">{projectMcpSource?.path}</div>
						{projectMcpServers.length === 0 ? (
							<p style={{color: "#8b949e", fontSize: 13}}>No MCP servers configured</p>
						) : (
							projectMcpServers.map((server, i) => {
								const result = checkResult[server.name];
								return (
									<div key={i} className="server-item">
										<div>
											<div className="server-name">{server.name}</div>
											<div className="server-info">
												{server.transport}
												{server.url && <span> | {server.url}</span>}
												{server.command && <span> | {server.command}</span>}
											</div>
											{result && (
												<div style={{marginTop: 4, fontSize: 12}}>
													{result.reachable ? (
														<span style={{color: "#238636"}}>Reachable {result.latencyMs && "(" + result.latencyMs + "ms)"}</span>
													) : (
														<span style={{color: "#da3633"}}>{result.error || "Unreachable"}</span>
													)}
												</div>
											)}
										</div>
										<div style={{display: "flex", gap: 8, alignItems: "center"}}>
											<span className={"badge" + (server.disabled ? " disabled" : "")}>{server.disabled ? "disabled" : "enabled"}</span>
											<button className="btn btn-secondary" onClick={() => handleMcpCheck(server.name)} disabled={checking === server.name || server.disabled} style={{padding: "4px 8px", fontSize: 12}}>
												{checking === server.name ? "..." : "Check"}
											</button>
										</div>
									</div>
								);
							})
						)}
					</ScopeSection>

					{/* Instructions (.claude/CLAUDE.md) */}
					<ScopeSection title="Instructions (.claude/CLAUDE.md)" badge={projectClaudeInstr?.exists ? projectClaudeInstr.lineCount + " lines" : "missing"}>
						<div className="layer-path">{projectClaudeInstr?.path}</div>
						{editing === "instr_claude" ? (
							<div style={{marginTop: 12}}>
								<textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={15} style={{fontFamily: "monospace"}} />
								<div className="actions">
									<button className="btn" onClick={() => handleInstructionsSave("project-claude")}>Save</button>
									<button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
								</div>
							</div>
						) : (
							<>
								{projectClaudeInstr?.content && (
									<pre style={{marginTop: 8, fontSize: 12, background: "#161b22", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 200, whiteSpace: "pre-wrap"}}>
										{projectClaudeInstr.content}
									</pre>
								)}
								<div className="actions">
									<button className="btn btn-secondary" onClick={() => { setEditing("instr_claude"); setEditContent(projectClaudeInstr?.content || ""); }}>
										{projectClaudeInstr?.exists ? "Edit" : "Create"}
									</button>
								</div>
							</>
						)}
					</ScopeSection>

					{/* Instructions (root CLAUDE.md) */}
					<ScopeSection title="Instructions (CLAUDE.md)" badge={projectRootInstr?.exists ? projectRootInstr.lineCount + " lines" : "missing"}>
						<div className="layer-path">{projectRootInstr?.path}</div>
						{editing === "instr_root" ? (
							<div style={{marginTop: 12}}>
								<textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={15} style={{fontFamily: "monospace"}} />
								<div className="actions">
									<button className="btn" onClick={() => handleInstructionsSave("project")}>Save</button>
									<button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
								</div>
							</div>
						) : (
							<>
								{projectRootInstr?.content && (
									<pre style={{marginTop: 8, fontSize: 12, background: "#161b22", padding: 8, borderRadius: 4, overflow: "auto", maxHeight: 200, whiteSpace: "pre-wrap"}}>
										{projectRootInstr.content}
									</pre>
								)}
								<div className="actions">
									<button className="btn btn-secondary" onClick={() => { setEditing("instr_root"); setEditContent(projectRootInstr?.content || ""); }}>
										{projectRootInstr?.exists ? "Edit" : "Create"}
									</button>
								</div>
							</>
						)}
					</ScopeSection>
				</div>
			);
		}

		function McpPanel({ data, onSave }) {
			const [checking, setChecking] = useState(null);
			const [checkResult, setCheckResult] = useState({});

			const handleCheck = async (serverName) => {
				setChecking(serverName);
				try {
					const result = await api("/api/mcp/check/" + serverName, { method: "POST" });
					setCheckResult(prev => ({ ...prev, [serverName]: result }));
				} catch (e) {
					setCheckResult(prev => ({ ...prev, [serverName]: { error: e.message } }));
				}
				setChecking(null);
			};

			const sourceLabels = { user_global: "User (~/.claude.json)", project: "Project (.mcp.json)" };

			return (
				<div className="panel">
					<h2>MCP Servers</h2>

					<div style={{marginBottom: 16}}>
						{data.sources.map((src, i) => (
							<div key={i} style={{fontSize: 13, marginBottom: 4}}>
								<span style={{color: "#8b949e"}}>{sourceLabels[src.source]}:</span>{" "}
								<span className={"badge" + (src.exists ? "" : " missing")} style={{marginLeft: 8}}>
									{src.exists ? "exists" : "missing"}
								</span>
							</div>
						))}
					</div>

					{data.servers.length === 0 ? (
						<p style={{color: "#8b949e"}}>No MCP servers configured</p>
					) : (
						data.servers.map((server, i) => {
							const result = checkResult[server.name];
							return (
								<div key={i} className="server-item">
									<div>
										<div className="server-name">{server.name}</div>
										<div className="server-info">
											{server.transport} | {sourceLabels[server.source]}
											{server.url && <span> | {server.url}</span>}
											{server.command && <span> | {server.command}</span>}
										</div>
										{result && (
											<div style={{marginTop: 4, fontSize: 12}}>
												{result.reachable ? (
													<span style={{color: "#238636"}}>
														Reachable {result.latencyMs && "(" + result.latencyMs + "ms)"}
													</span>
												) : (
													<span style={{color: "#da3633"}}>
														{result.error || "Unreachable"}
													</span>
												)}
											</div>
										)}
									</div>
									<div style={{display: "flex", gap: 8, alignItems: "center"}}>
										<span className={"badge" + (server.disabled ? " disabled" : "")}>
											{server.disabled ? "disabled" : "enabled"}
										</span>
										<button
											className="btn btn-secondary"
											onClick={() => handleCheck(server.name)}
											disabled={checking === server.name || server.disabled}
											style={{padding: "4px 8px", fontSize: 12}}
										>
											{checking === server.name ? "..." : "Check"}
										</button>
									</div>
								</div>
							);
						})
					)}
				</div>
			);
		}

		function PluginsPanel({ data, onSave }) {
			const [toggling, setToggling] = useState(null);
			const [message, setMessage] = useState(null);

			const handleToggle = async (plugin) => {
				setToggling(plugin.fullName);
				setMessage(null);
				try {
					await api("/api/plugins/" + encodeURIComponent(plugin.fullName), {
						method: "PUT",
						body: JSON.stringify({ enabled: plugin.status !== "enabled" })
					});
					setMessage({ type: "success", text: "Plugin " + (plugin.status === "enabled" ? "disabled" : "enabled") });
					onSave();
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
				setToggling(null);
			};

			return (
				<div className="panel">
					<h2>Plugins</h2>
					<div style={{marginBottom: 16, fontSize: 13, color: "#8b949e"}}>
						{data.enabledCount} enabled, {data.disabledCount} disabled
					</div>

					{message && (
						<div className={message.type === "success" ? "success-msg" : "error-msg"}>
							{message.text}
						</div>
					)}

					{data.plugins.length === 0 ? (
						<p style={{color: "#8b949e"}}>No plugins installed</p>
					) : (
						data.plugins.map((plugin, i) => (
							<div key={i} className="plugin-item">
								<div>
									<div className="plugin-name">{plugin.fullName}</div>
									<div className="plugin-info">
										{plugin.version && <span>v{plugin.version}</span>}
									</div>
								</div>
								<div
									className={"toggle" + (plugin.status === "enabled" ? " on" : "")}
									onClick={() => handleToggle(plugin)}
									style={{opacity: toggling === plugin.fullName ? 0.5 : 1}}
								/>
							</div>
						))
					)}
				</div>
			);
		}

		function InstructionsPanel({ onSave }) {
			const [data, setData] = useState(null);
			const [loading, setLoading] = useState(true);
			const [editing, setEditing] = useState(null);
			const [editContent, setEditContent] = useState("");
			const [message, setMessage] = useState(null);

			const levelLabels = {
				project_claude_dir: "Project (.claude/CLAUDE.md)",
				project_root: "Project Root (CLAUDE.md)",
				user: "User (~/.claude/CLAUDE.md)"
			};

			const levelApiMap = {
				project_claude_dir: "project-claude",
				project_root: "project",
				user: "user"
			};

			useEffect(() => {
				loadInstructions();
			}, []);

			const loadInstructions = async () => {
				setLoading(true);
				try {
					const result = await api("/api/instructions");
					setData(result);
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
				setLoading(false);
			};

			const handleEdit = (layer) => {
				setEditing(layer.source);
				setEditContent(layer.content || "");
				setMessage(null);
			};

			const handleSave = async () => {
				try {
					const apiLevel = levelApiMap[editing];
					await api("/api/instructions/" + apiLevel, {
						method: "PUT",
						body: editContent,
						headers: { "Content-Type": "text/plain" }
					});
					setMessage({ type: "success", text: "Saved successfully" });
					setEditing(null);
					loadInstructions();
					onSave();
				} catch (e) {
					setMessage({ type: "error", text: e.message });
				}
			};

			if (loading) return <div className="loading">Loading...</div>;

			return (
				<div className="panel">
					<h2>CLAUDE.md Instructions</h2>
					<div style={{marginBottom: 16, fontSize: 13, color: "#8b949e"}}>
						Total: {data?.totalLines || 0} lines
					</div>

					{message && (
						<div className={message.type === "success" ? "success-msg" : "error-msg"}>
							{message.text}
						</div>
					)}

					{data?.layers.map((layer, i) => (
						<div key={i} className="layer">
							<div className="layer-header">
								<span className="layer-title">{levelLabels[layer.source] || layer.source}</span>
								<span className={"badge" + (layer.exists ? "" : " missing")}>
									{layer.exists ? layer.lineCount + " lines" : "missing"}
								</span>
							</div>
							<div className="layer-path">{layer.path}</div>

							{editing === layer.source ? (
								<div style={{marginTop: 12}}>
									<textarea
										value={editContent}
										onChange={e => setEditContent(e.target.value)}
										rows={15}
										style={{fontFamily: "monospace"}}
									/>
									<div className="actions">
										<button className="btn" onClick={handleSave}>Save</button>
										<button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
									</div>
								</div>
							) : (
								<>
									{layer.content && (
										<pre style={{
											marginTop: 8,
											fontSize: 12,
											background: "#161b22",
											padding: 8,
											borderRadius: 4,
											overflow: "auto",
											maxHeight: 200,
											whiteSpace: "pre-wrap"
										}}>
											{layer.content}
										</pre>
									)}
									<div className="actions">
										<button className="btn btn-secondary" onClick={() => handleEdit(layer)}>
											{layer.exists ? "Edit" : "Create"}
										</button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			);
		}

		function IssuesPanel({ issues, conflicts }) {
			const severityColors = {
				error: "#da3633",
				warning: "#d29922",
				info: "#58a6ff"
			};

			const allIssues = issues || [];
			const allConflicts = conflicts || [];

			return (
				<div className="panel">
					<h2>Detected Issues</h2>

					{allIssues.length === 0 && allConflicts.length === 0 ? (
						<p style={{color: "#238636", padding: 20, textAlign: "center"}}>
							No issues detected
						</p>
					) : (
						<>
							{allIssues.map((issue, i) => (
								<div key={i} className={"issue " + issue.severity}>
									<div className="issue-title" style={{color: severityColors[issue.severity]}}>
										[{issue.category}] {issue.message}
									</div>
									{issue.path && (
										<div className="issue-desc">{issue.path}</div>
									)}
								</div>
							))}

							{allConflicts.length > 0 && (
								<>
									<h3>Setting Conflicts</h3>
									{allConflicts.map((conflict, i) => (
										<div key={i} className="issue warning">
											<div className="issue-title">{conflict.key}</div>
											<div className="issue-desc">
												{conflict.values.map((v, j) => (
													<div key={j}>
														{v.source}: {JSON.stringify(v.value)}
													</div>
												))}
											</div>
										</div>
									))}
								</>
							)}
						</>
					)}
				</div>
			);
		}

		const root = ReactDOM.createRoot(document.getElementById("root"));
		root.render(<App />);
	</script>
</body>
</html>`;
}
