export enum Tab {
  Home = "home",
  User = "user",
  Project = "project",
  Files = "files",
  Issues = "issues",
  Mcp = "mcp",
  Memory = "memory",
  Agents = "agents",
  Context = "context",
  Snapshots = "snapshots",
}

export const TABS = Object.values(Tab);
export const DEFAULT_TAB = Tab.Home;

export function isValidTab(value: string | null): value is Tab {
  return value !== null && TABS.includes(value as Tab);
}
