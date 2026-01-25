import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { HomePage } from "@/components/home/HomePage";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { McpPanel } from "@/components/mcp/McpPanel";
import { IssuesPanel } from "@/components/issues/IssuesPanel";
import { StatsPanel } from "@/components/stats/StatsPanel";
import { LiveUpdatesProvider } from "@/contexts/LiveUpdatesProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tab, TABS, DEFAULT_TAB, isValidTab } from "@/types/tabs";

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = isValidTab(tabParam) ? tabParam : DEFAULT_TAB;

  const handleTabChange = useCallback(
    (tab: Tab) => {
      setSearchParams((prev) => {
        prev.set("tab", tab);
        return prev;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= TABS.length) {
        handleTabChange(TABS[num - 1]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTabChange]);

  function renderContent() {
    switch (activeTab) {
      case Tab.Home:
        return <HomePage onNavigate={handleTabChange} />;
      case Tab.User:
        return <SettingsPanel layer="user" title="User Settings" />;
      case Tab.Project:
        return <SettingsPanel layer="project-local" title="Project Settings" />;
      case Tab.Issues:
        return <IssuesPanel />;
      case Tab.Mcp:
        return <McpPanel />;
      case Tab.Stats:
        return <StatsPanel />;
    }
  }

  return (
    <LiveUpdatesProvider>
      <TooltipProvider>
        <Toaster position="bottom-right" theme="dark" richColors />
        <div className="flex h-screen">
          <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 overflow-auto p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </LiveUpdatesProvider>
  );
}
