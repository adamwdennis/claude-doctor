import { cn } from "@/lib/utils";
import { Tab } from "@/types/tabs";
import {
  House,
  User,
  FolderGit2,
  FileSearch,
  AlertTriangle,
  Plug,
  Brain,
  Bot,
  ScanEye,
  GitCompare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const NAV_ITEMS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: Tab.Home, label: "Home", icon: House },
  { id: Tab.User, label: "User", icon: User },
  { id: Tab.Project, label: "Project", icon: FolderGit2 },
  { id: Tab.Files, label: "Files", icon: FileSearch },
  { id: Tab.Issues, label: "Issues", icon: AlertTriangle },
  { id: Tab.Mcp, label: "MCP", icon: Plug },
  { id: Tab.Memory, label: "Memory", icon: Brain },
  { id: Tab.Agents, label: "Agents", icon: Bot },
  { id: Tab.Context, label: "Context", icon: ScanEye },
  { id: Tab.Snapshots, label: "Snapshots", icon: GitCompare },
];

export function Sidebar({ activeTab, onTabChange, collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      className="flex h-full flex-col border-r bg-sidebar glass"
      animate={{ width: collapsed ? 64 : 224 }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-semibold text-sidebar-foreground truncate"
          >
            Claude Doctor
          </motion.span>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2" aria-label="Main navigation">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          const button = (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex w-full items-center rounded-lg py-2 text-sm font-medium transition-colors overflow-hidden",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              {isActive && (
                <>
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-sidebar-accent"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                  <motion.div
                    layoutId="sidebar-accent-bar"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-sidebar-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                </>
              )}
              <Icon className={cn("relative z-10 h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && (
                <motion.span
                  className="relative z-10 truncate"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger
                  onClick={() => onTabChange(item.id)}
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex w-full items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors px-2 overflow-hidden",
                    isActive
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-lg bg-sidebar-accent"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                      <motion.div
                        layoutId="sidebar-accent-bar"
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-sidebar-primary"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    </>
                  )}
                  <Icon className={cn("relative z-10 h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>
      <div className="mt-auto">
        <div className="border-t p-2 flex items-center justify-center">
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          {!collapsed && (
            <span className="ml-2 text-xs text-muted-foreground">
              Press [ or 1-9
            </span>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
