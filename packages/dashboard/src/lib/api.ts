const API_BASE = "/api";

export interface SettingsData {
  layer: string;
  path: string;
  exists: boolean;
  data: Record<string, unknown>;
}

export interface McpServerConfig {
  name: string;
  source: string;
  transport: string;
  status: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  disabled?: boolean;
}

export interface McpSource {
  source: string;
  path: string;
  exists: boolean;
}

export interface McpCollection {
  servers: McpServerConfig[];
  sources: McpSource[];
}

export interface McpCheckResult {
  reachable: boolean;
  error?: string;
  resolvedCommand?: string;
}

export interface DiagnosticIssue {
  severity: "error" | "warning" | "info";
  category: string;
  message: string;
  file?: string;
  suggestion?: string;
  fix?: DiagnosticIssueFix;
}

export interface DiagnosticIssueFix {
  type: string;
  label: string;
  payload: Record<string, unknown>;
}

export enum FileTraceType {
  Instructions = "instructions",
  Settings = "settings",
  Mcp = "mcp",
  ClaudeDir = "claude-dir",
}

export interface FileTraceEntry {
  path: string;
  type: FileTraceType;
  exists: boolean;
  size?: number;
}

export interface FileTraceLevel {
  directory: string;
  isProjectRoot: boolean;
  isUserHome: boolean;
  files: FileTraceEntry[];
}

export interface FileTraceCollection {
  levels: FileTraceLevel[];
  projectPath: string;
  homePath: string;
}

export interface Session {
  id: string;
  startedAt: string;
  endedAt?: string;
  messageCount: number;
  toolCalls: string[];
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  cwd?: string;
  model?: string;
}

export interface HistoryCollection {
  sessions: Session[];
  totals: {
    sessionCount: number;
    messageCount: number;
    toolCallCount: number;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
  };
  dateRange?: {
    first: string;
    last: string;
  };
}

export interface AgentInfo {
  name: string;
  description: string;
  pluginName: string;
  pluginFullName: string;
  model: string;
  filePath: string;
  enabled: boolean;
  agentId: string;
  agentEnabled: boolean;
}

export interface AgentsCollection {
  agents: AgentInfo[];
  enabledCount: number;
  disabledCount: number;
}

// Context Budget (F1)
export interface ContextSourceEntry {
  source: string;
  label: string;
  tokenEstimate: number;
  details?: string;
}

export interface ContextBudget {
  sources: ContextSourceEntry[];
  totalTokens: number;
  modelLimit: number;
  usagePercent: number;
}

// MCP Tools (F5)
export interface ToolInventoryItem {
  name: string;
  server: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  tokenEstimate: number;
}

export interface McpToolsCollection {
  tools: ToolInventoryItem[];
  servers: string[];
  totalTokens: number;
  totalTools: number;
}

// Merge Preview (F3)
export interface MergedInstructionsBlock {
  source: string;
  path: string;
  content: string;
  tokenEstimate: number;
  startLine: number;
  endLine: number;
}

export interface MergedInstructionsResult {
  blocks: MergedInstructionsBlock[];
  mergedContent: string;
  totalTokens: number;
  totalLines: number;
}

// Instructions Lint (F8)
export interface InstructionsLintIssue {
  severity: string;
  message: string;
  source: string;
  line?: number;
  suggestion?: string;
  ruleId: string;
}

export interface InstructionsLintResult {
  issues: InstructionsLintIssue[];
  totalIssues: number;
}

// Permissions (F4)
export interface PermissionRule {
  pattern: string;
  source: string;
  sourcePath: string;
  type: "allow" | "deny" | "ask";
}

export interface PermissionDebugResult {
  query: string;
  verdict: string;
  matchedRule?: PermissionRule;
  allRules: PermissionRule[];
}

// Hooks (F9)
export interface HookEntry {
  event: string;
  command: string;
  matcher?: string;
  timeout?: number;
  source: string;
  sourcePath: string;
}

export interface HooksCollection {
  hooks: HookEntry[];
  totalHooks: number;
}

// Effective Config (F2)
export interface EffectiveConfigEntry {
  key: string;
  value: unknown;
  source: string;
  overrides: { source: string; value: unknown }[];
}

export interface EffectiveConfig {
  entries: EffectiveConfigEntry[];
}

// Snapshots (F7)
export interface SnapshotMeta {
  id: string;
  name: string;
  createdAt: string;
  projectPath: string;
}

export interface SnapshotDiff {
  left: SnapshotMeta;
  right: SnapshotMeta;
  entries: DiffEntry[];
}

export interface DiffEntry {
  path: string;
  changeType: "added" | "removed" | "changed";
  oldValue?: unknown;
  newValue?: unknown;
}

// Session Detail (F6)
export interface HistoryEntry {
  timestamp: string;
  type: string;
  sessionId?: string;
  toolName?: string;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  message?: string;
  model?: string;
  cwd?: string;
}

export interface SessionDetail {
  session: Session;
  entries: HistoryEntry[];
  entryCount: number;
}

// Cost Forecast (F11)
export interface DailyCost {
  date: string;
  cost: number;
  sessions: number;
  tokens: number;
}

export interface CostForecast {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyProjection: number;
  trend: "up" | "down" | "stable";
  periodAnalyzedDays: number;
  dataPoints: DailyCost[];
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  settings: {
    get: (layer: string) =>
      fetchJson<SettingsData>(`${API_BASE}/settings/${layer}`),
    save: (layer: string, data: Record<string, unknown>) =>
      fetchJson<{ success: boolean }>(`${API_BASE}/settings/${layer}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    effective: () =>
      fetchJson<EffectiveConfig>(`${API_BASE}/settings/effective`),
  },
  mcp: {
    list: () => fetchJson<McpCollection>(`${API_BASE}/mcp`),
    check: (server: string) =>
      fetchJson<McpCheckResult>(`${API_BASE}/mcp/check/${server}`, {
        method: "POST",
      }),
    tools: () => fetchJson<McpToolsCollection>(`${API_BASE}/mcp/tools`),
  },
  issues: {
    list: () => fetchJson<DiagnosticIssue[]>(`${API_BASE}/issues`),
  },
  stats: {
    get: () => fetchJson<Record<string, unknown>>(`${API_BASE}/stats`),
    forecast: (days = 30) =>
      fetchJson<CostForecast>(`${API_BASE}/stats/forecast?days=${days}`),
  },
  fileTrace: {
    get: () => fetchJson<FileTraceCollection>(`${API_BASE}/file-trace`),
    read: (path: string) =>
      fetchJson<{ path: string; content: string }>(
        `${API_BASE}/file-trace/read?path=${encodeURIComponent(path)}`
      ),
    save: (path: string, content: string) =>
      fetchJson<{ success: boolean; path: string }>(`${API_BASE}/file-trace/save`, {
        method: "PUT",
        body: JSON.stringify({ path, content }),
      }),
  },
  history: {
    get: (limit = 100) =>
      fetchJson<HistoryCollection>(`${API_BASE}/history?limit=${limit}`),
    getSession: (sessionId: string) =>
      fetchJson<SessionDetail>(`${API_BASE}/history/${encodeURIComponent(sessionId)}`),
  },
  agents: {
    list: () => fetchJson<AgentsCollection>(`${API_BASE}/agents`),
    toggle: (pluginFullName: string, enabled: boolean) =>
      fetchJson<{ success: boolean; pluginFullName: string; enabled: boolean }>(
        `${API_BASE}/agents/toggle`,
        {
          method: "POST",
          body: JSON.stringify({ pluginFullName, enabled }),
        }
      ),
    toggleAgent: (agentId: string, enabled: boolean) =>
      fetchJson<{ success: boolean; agentId: string; enabled: boolean }>(
        `${API_BASE}/agents/toggle-agent`,
        {
          method: "POST",
          body: JSON.stringify({ agentId, enabled }),
        }
      ),
  },
  context: {
    get: () => fetchJson<ContextBudget>(`${API_BASE}/context`),
  },
  instructions: {
    merged: () => fetchJson<MergedInstructionsResult>(`${API_BASE}/instructions/merged`),
    lint: () => fetchJson<InstructionsLintResult>(`${API_BASE}/instructions/lint`),
  },
  permissions: {
    summary: () => fetchJson<{ rules: PermissionRule[] }>(`${API_BASE}/permissions/summary`),
    debug: (query: string) =>
      fetchJson<PermissionDebugResult>(`${API_BASE}/permissions/debug`, {
        method: "POST",
        body: JSON.stringify({ query }),
      }),
  },
  hooks: {
    get: () => fetchJson<HooksCollection>(`${API_BASE}/hooks`),
  },
  snapshots: {
    list: () => fetchJson<{ snapshots: SnapshotMeta[] }>(`${API_BASE}/snapshots`),
    create: (name?: string) =>
      fetchJson<SnapshotMeta>(`${API_BASE}/snapshots`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    get: (id: string) =>
      fetchJson<{ meta: SnapshotMeta; report: unknown }>(`${API_BASE}/snapshots/${id}`),
    delete: (id: string) =>
      fetchJson<{ success: boolean }>(`${API_BASE}/snapshots/${id}`, {
        method: "DELETE",
      }),
    diff: (leftId: string, rightId: string) =>
      fetchJson<SnapshotDiff>(`${API_BASE}/snapshots/diff`, {
        method: "POST",
        body: JSON.stringify({ leftId, rightId }),
      }),
  },
  fix: {
    apply: (fixType: string, payload: Record<string, unknown>) =>
      fetchJson<{ success: boolean }>(`${API_BASE}/fix`, {
        method: "POST",
        body: JSON.stringify({ fixType, payload }),
      }),
  },
};
