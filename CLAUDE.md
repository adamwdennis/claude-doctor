# claude-doctor

CLI + dashboard to diagnose Claude Code configuration.

## Monorepo

```
packages/
├── cli/        # @claude-doctor/cli - Node CLI
└── dashboard/  # @claude-doctor/dashboard - React UI
```

Uses pnpm workspaces. Run from root or filter: `pnpm --filter @claude-doctor/cli <cmd>`

## CLI Package

### Stack

- TypeScript ESM, tsdown bundler, vitest
- Linting: `oxlint src --fix && oxfmt --write src`
- Format: tabs, double quotes, semicolons (see .oxfmtrc.json)

### Structure

```
src/
├── commands/     # CLI command handlers
├── collectors/   # Data collection (settings, mcp, plugins, etc.)
├── models/       # TypeScript interfaces + enums
├── analyzers/    # Issue/conflict detection
├── renderers/    # Output formatters (tree, json, html)
├── server/       # HTTP server for dashboard
│   └── handlers/ # API endpoint handlers
└── utils/        # Shared helpers
```

### Commands

```bash
pnpm --filter cli build      # Build
pnpm --filter cli dev        # Watch mode
pnpm --filter cli lint       # Lint + format
pnpm --filter cli test       # Run tests
```

## Dashboard Package

### Stack

- React 19, Vite, TypeScript
- Tailwind CSS + Radix UI primitives
- TanStack Query + Router
- Playwright for E2E tests

### Structure

```
src/
├── components/
│   ├── ui/        # Radix primitives (shadcn style)
│   ├── layout/    # Header, Sidebar
│   ├── settings/  # Settings editors
│   └── [feature]/ # Feature-specific components
├── hooks/         # Custom hooks (useMcp, useSettings, etc.)
├── contexts/      # React context providers
└── types/         # Shared types
```

### Commands

```bash
pnpm --filter dashboard dev   # Dev server
pnpm --filter dashboard build # Production build
pnpm --filter dashboard test  # Playwright E2E
```

## Code Conventions

- Use string enums over string const unions
- No barrel files for components
- Event handlers above render: `handleClickSave`, `handleChangeName`
- Final step after code changes: lint, then fix any errors
