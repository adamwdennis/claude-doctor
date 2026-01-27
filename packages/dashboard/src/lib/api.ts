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
}

export interface AgentsCollection {
  agents: AgentInfo[];
  enabledCount: number;
  disabledCount: number;
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
  },
  mcp: {
    list: () => fetchJson<McpCollection>(`${API_BASE}/mcp`),
    check: (server: string) =>
      fetchJson<McpCheckResult>(`${API_BASE}/mcp/check/${server}`, {
        method: "POST",
      }),
  },
  issues: {
    list: () => fetchJson<DiagnosticIssue[]>(`${API_BASE}/issues`),
  },
  stats: {
    get: () => fetchJson<Record<string, unknown>>(`${API_BASE}/stats`),
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
  },
};
