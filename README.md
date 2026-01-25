# claude-doctor

CLI tool to diagnose and understand your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) configuration hierarchy, MCP servers, plugins, and CLAUDE.md instructions.

## Installation

```bash
npm install -g claude-doctor
```

Or run directly:

```bash
npx claude-doctor
```

**Requires Node.js >= 20.19**

## Usage

```bash
claude-doctor [options] [command]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --project <path>` | Project directory | Current directory |
| `-f, --format <type>` | Output format: `tree`, `json`, `html` | `tree` |
| `-o, --output <file>` | Write output to file | stdout |
| `-V, --version` | Show version | |
| `-h, --help` | Show help | |

### Commands

| Command | Description |
|---------|-------------|
| `config` | Show settings hierarchy (all 6 layers) |
| `mcp [--check]` | Show MCP server configuration (with connectivity check) |
| `plugins` | Show installed plugins and their status |
| `instructions` | Show CLAUDE.md merge order |
| `stats [--days N]` | Show usage statistics (default: 30 days) |
| `diagnose` | Full diagnostic report (default command) |

## Example Output

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

## Configuration Sources

### Settings Hierarchy (highest → lowest precedence)

1. **Managed Policy** - `/etc/claude-code/` (enterprise)
2. **CLI Flags** - Runtime arguments
3. **Project Local** - `.claude/settings.local.json` (gitignored)
4. **Project Shared** - `.claude/settings.json` (committed)
5. **User** - `~/.claude/settings.json`
6. **Built-in Defaults** - Hardcoded defaults

### CLAUDE.md Instructions (highest → lowest precedence)

1. `.claude/CLAUDE.md` - Project-specific (in .claude dir)
2. `./CLAUDE.md` - Project root
3. `~/.claude/CLAUDE.md` - User global

### MCP Servers

1. **User Global** - `~/.claude.json`
2. **Project** - `.mcp.json`
3. **Plugin-provided** - From installed plugins
4. **Project Overrides** - Project-specific settings

## Output Formats

### Tree (default)

Colored ASCII tree with status indicators:
- `[*]` - Found/Active
- `[ ]` - Not found
- `[!]` - Warning/Default
- `[E]` - Enabled
- `[D]` - Disabled

### JSON

Full structured data for programmatic use:

```bash
claude-doctor diagnose --format json > report.json
```

### HTML

Interactive dark-themed report:

```bash
claude-doctor diagnose --format html -o report.html
```

## Issue Detection

The tool automatically detects:

- Missing project-level CLAUDE.md
- Disabled MCP servers
- Unreachable MCP endpoints (with `--check`)
- Disabled plugins
- Settings conflicts between layers
- Missing configuration files

## Development

### Tech Stack

Built with the modern [VoidZero](https://voidzero.dev/) toolchain:

| Tool | Purpose |
|------|---------|
| **TypeScript** | Language (ESM) |
| **[tsdown](https://tsdown.dev)** | Bundler (Rolldown-powered) |
| **[oxlint](https://oxc.rs/docs/guide/usage/linter)** | Linter (30x faster than ESLint) |
| **[oxfmt](https://oxc.rs/docs/guide/usage/formatter)** | Formatter (30x faster than Prettier) |
| **[Vitest](https://vitest.dev)** | Test runner |
| **[Commander.js](https://github.com/tj/commander.js)** | CLI framework |
| **[Chalk](https://github.com/chalk/chalk)** | Terminal styling |

### Scripts

```bash
npm run build       # Build for production
npm run dev         # Watch mode
npm run lint        # Lint + format (fix)
npm run lint:check  # Lint + format (check only)
npm run format      # Format only
npm run test        # Run tests
npm run test:watch  # Watch mode tests
npm run start       # Run built CLI
```

### Project Structure

```
src/
├── index.ts              # Entry point (with shebang)
├── cli.ts                # Commander setup
├── commands/             # CLI commands
│   ├── config.ts
│   ├── mcp.ts
│   ├── plugins.ts
│   ├── instructions.ts
│   ├── stats.ts
│   └── diagnose.ts
├── collectors/           # Data collection
│   ├── settings.collector.ts
│   ├── mcp.collector.ts
│   ├── plugins.collector.ts
│   ├── instructions.collector.ts
│   └── stats.collector.ts
├── models/               # TypeScript interfaces
│   ├── config.model.ts
│   ├── mcp.model.ts
│   ├── plugin.model.ts
│   ├── stats.model.ts
│   └── diagnostic.model.ts
├── analyzers/            # Issue/conflict detection
│   ├── issue.analyzer.ts
│   └── conflict.analyzer.ts
├── renderers/            # Output formatters
│   ├── tree.renderer.ts
│   ├── json.renderer.ts
│   └── html.renderer.ts
└── utils/                # Helpers
    ├── paths.ts
    ├── file.ts
    └── merge.ts
```

## License

MIT
