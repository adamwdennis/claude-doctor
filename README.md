# claude-doctor

**Finally understand your Claude Code setup.**

[![npm version](https://img.shields.io/npm/v/@claude-doctor/cli.svg)](https://www.npmjs.com/package/@claude-doctor/cli)
[![GitHub](https://img.shields.io/github/stars/adamwdennis/claude-doctor?style=social)](https://github.com/adamwdennis/claude-doctor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Claude Code's configuration is powerful but complex—6 layers of settings, multiple CLAUDE.md files, MCP servers from different sources, dozens of plugins. When something isn't working, good luck figuring out why.

**claude-doctor** gives you instant visibility into your entire Claude Code configuration hierarchy.

```
npx claude-doctor
```

```
Claude Code Configuration
Project: /path/to/your/project

Settings Hierarchy
├── [ ] Managed Policy: /etc/claude-code (not found)
├── [*] Project Local: .claude/settings.local.json
│   └── permissions: {1 entries}
├── [ ] Project Shared: .claude/settings.json (not found)
├── [*] User: ~/.claude/settings.json
│   └── enabledPlugins: {17 entries}
└── [!] Built-in Defaults
      └── enableBetaTools: false

MCP Servers
├── [E] github (http) - User Global ✓ 173ms
├── [E] playwright (stdio) - User Global
└── [D] figma (disabled)

Plugins (12 enabled / 7 disabled)
├── [E] commit-commands@claude-plugins-official
├── [E] linear@claude-plugins-official
└── [D] context7@claude-plugins-official

CLAUDE.md Instructions
├── [ ] Project (.claude/): .claude/CLAUDE.md (not found)
├── [ ] Project Root: ./CLAUDE.md (not found)
└── [*] User Global: ~/.claude/CLAUDE.md (39 lines)

Usage Stats (Last 30 days)
├── Messages: 1,247
├── Sessions: 89
├── Tool Calls: 4,832
└── Cost: $12.34

Issues (1 warnings)
└── [W] No project-level CLAUDE.md found
```

## Why claude-doctor?

**Debug configuration issues fast.** Stop guessing why Claude ignores your CLAUDE.md or why an MCP server isn't available. See exactly which config files exist, their precedence, and what's overriding what.

**Understand the full picture.** Claude Code pulls settings from 6 different layers, instructions from 3 CLAUDE.md locations, and MCP servers from multiple sources. claude-doctor shows you everything in one view.

**Catch problems automatically.** Built-in issue detection warns you about disabled servers, missing instructions, settings conflicts, and unreachable endpoints.

**Track your usage.** See messages sent, sessions, tool calls, and costs over time.

## Installation

```bash
npm install -g @claude-doctor/cli
```

Or run directly:

```bash
npx claude-doctor
```

**Requires Node.js >= 20.19**

## Commands

| Command | Description |
|---------|-------------|
| `diagnose` | Full diagnostic report (default) |
| `config` | Settings hierarchy (all 6 layers) |
| `mcp [--check]` | MCP servers (with optional connectivity test) |
| `plugins` | Installed plugins and status |
| `instructions` | CLAUDE.md merge order |
| `stats [--days N]` | Usage statistics |
| `serve` | Launch interactive web dashboard |

## Options

| Option | Description |
|--------|-------------|
| `-p, --project <path>` | Project directory (default: cwd) |
| `-f, --format <type>` | Output: `tree`, `json`, `html` |
| `-o, --output <file>` | Write to file instead of stdout |

## Output Formats

**Tree** (default) — Colored ASCII with status indicators:
- `[*]` Found/Active
- `[ ]` Not found
- `[E]` Enabled
- `[D]` Disabled
- `[!]` Warning

**JSON** — Structured data for scripts and automation:
```bash
claude-doctor diagnose --format json > report.json
```

**HTML** — Interactive dark-themed report:
```bash
claude-doctor diagnose --format html -o report.html
```

**Web Dashboard** — Live interactive UI:
```bash
claude-doctor serve
```

## What It Checks

### Settings Hierarchy (highest → lowest precedence)

1. **Managed Policy** — `/etc/claude-code/` (enterprise)
2. **CLI Flags** — Runtime arguments
3. **Project Local** — `.claude/settings.local.json` (gitignored)
4. **Project Shared** — `.claude/settings.json` (committed)
5. **User** — `~/.claude/settings.json`
6. **Built-in Defaults**

### CLAUDE.md Instructions (highest → lowest precedence)

1. `.claude/CLAUDE.md` — Project-specific
2. `./CLAUDE.md` — Project root
3. `~/.claude/CLAUDE.md` — User global

### MCP Servers

1. **User Global** — `~/.claude.json`
2. **Project** — `.mcp.json`
3. **Plugin-provided** — From installed plugins
4. **Project Overrides** — Local settings

## Issue Detection

claude-doctor automatically flags:

- Missing project-level CLAUDE.md
- Disabled MCP servers
- Unreachable MCP endpoints (with `--check`)
- Disabled plugins
- Settings conflicts between layers
- Missing configuration files

## Contributing

Issues and PRs welcome at [github.com/adamwdennis/claude-doctor](https://github.com/adamwdennis/claude-doctor).

## License

MIT
