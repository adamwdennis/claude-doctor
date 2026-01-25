import { cn } from "@/lib/utils";
import { Tab } from "@/types/tabs";
import {
  House,
  User,
  FolderGit2,
  AlertTriangle,
  Plug,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { FileTracePanel } from "@/components/filetrace/FileTracePanel";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const NAV_ITEMS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: Tab.Home, label: "Home", icon: House },
  { id: Tab.User, label: "User", icon: User },
  { id: Tab.Project, label: "Project", icon: FolderGit2 },
  { id: Tab.Issues, label: "Issues", icon: AlertTriangle },
  { id: Tab.Mcp, label: "MCP", icon: Plug },
  { id: Tab.Stats, label: "Stats", icon: BarChart3 },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-semibold text-sidebar-foreground">
          Claude Doctor
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-2" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-sidebar-accent"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto">
        <FileTracePanel />
        <div className="border-t p-4 text-xs text-muted-foreground">
          Press 1-6 to switch tabs
        </div>
      </div>
    </aside>
  );
}
