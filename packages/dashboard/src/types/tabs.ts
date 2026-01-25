export enum Tab {
  Home = "home",
  User = "user",
  Project = "project",
  Issues = "issues",
  Mcp = "mcp",
  Stats = "stats",
}

export const TABS = Object.values(Tab);
export const DEFAULT_TAB = Tab.Home;

export function isValidTab(value: string | null): value is Tab {
  return value !== null && TABS.includes(value as Tab);
}
