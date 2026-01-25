import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Plus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PermissionsEditorProps {
  permissions: string[];
  onChange: (permissions: string[]) => void;
}

const TOOL_INFO: Record<
  string,
  { description: string; capabilities: string[]; examples: string[] }
> = {
  Bash: {
    description: "Execute shell commands",
    capabilities: [
      "Run any shell command",
      "Execute scripts",
      "Manage processes",
    ],
    examples: ["npm install", "git status", "docker compose up"],
  },
  Read: {
    description: "Read files from the filesystem",
    capabilities: [
      "Read text files",
      "Read images",
      "Read PDFs",
      "Read notebooks",
    ],
    examples: ["src/index.ts", "README.md", "config.json"],
  },
  Edit: {
    description: "Edit existing files",
    capabilities: [
      "Replace text in files",
      "Insert content",
      "Delete content",
    ],
    examples: ["Fix typos", "Update imports", "Refactor code"],
  },
  Write: {
    description: "Create or overwrite files",
    capabilities: ["Create new files", "Overwrite existing files"],
    examples: ["Create component", "Generate config", "Write tests"],
  },
  Glob: {
    description: "Find files by pattern",
    capabilities: ["Search by filename", "Filter by extension", "Recursive search"],
    examples: ["**/*.ts", "src/**/*.tsx", "*.json"],
  },
  Grep: {
    description: "Search file contents",
    capabilities: ["Regex search", "Case-insensitive", "Count matches"],
    examples: ["function.*test", "import.*react", "TODO:"],
  },
  WebFetch: {
    description: "Fetch web content",
    capabilities: ["GET requests", "Parse HTML", "Extract data"],
    examples: ["Fetch docs", "Check API", "Download content"],
  },
  WebSearch: {
    description: "Search the web",
    capabilities: ["Web search", "Find resources", "Research"],
    examples: ["React hooks", "TypeScript patterns", "API docs"],
  },
  Task: {
    description: "Launch sub-agents",
    capabilities: ["Parallel execution", "Specialized agents", "Background tasks"],
    examples: ["Explore codebase", "Run tests", "Review code"],
  },
  TodoWrite: {
    description: "Manage task lists",
    capabilities: ["Create todos", "Update status", "Track progress"],
    examples: ["Add task", "Mark complete", "Update priority"],
  },
  NotebookEdit: {
    description: "Edit Jupyter notebooks",
    capabilities: ["Edit cells", "Add cells", "Delete cells"],
    examples: ["Update code cell", "Add markdown", "Fix output"],
  },
  AskUserQuestion: {
    description: "Ask user for input",
    capabilities: ["Multi-choice questions", "Free text input", "Confirmations"],
    examples: ["Clarify requirements", "Choose option", "Confirm action"],
  },
};

const TOOL_COLORS: Record<string, string> = {
  Bash: "bg-amber-950 text-amber-300 border-amber-800",
  Read: "bg-blue-950 text-blue-300 border-blue-800",
  Edit: "bg-purple-950 text-purple-300 border-purple-800",
  Write: "bg-yellow-950 text-yellow-300 border-yellow-800",
  Glob: "bg-green-950 text-green-300 border-green-800",
  Grep: "bg-emerald-950 text-emerald-300 border-emerald-800",
  WebFetch: "bg-cyan-950 text-cyan-300 border-cyan-800",
  WebSearch: "bg-violet-950 text-violet-300 border-violet-800",
  Task: "bg-pink-950 text-pink-300 border-pink-800",
  TodoWrite: "bg-orange-950 text-orange-300 border-orange-800",
  NotebookEdit: "bg-rose-950 text-rose-300 border-rose-800",
  AskUserQuestion: "bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800",
  mcp: "bg-indigo-950 text-indigo-300 border-indigo-800",
};

function getToolType(permission: string): string {
  const lower = permission.toLowerCase();
  if (lower.startsWith("mcp__")) return "mcp";
  for (const tool of Object.keys(TOOL_INFO)) {
    if (lower.startsWith(tool.toLowerCase())) return tool;
  }
  return "other";
}

export function PermissionsEditor({
  permissions,
  onChange,
}: PermissionsEditorProps) {
  const [newPermission, setNewPermission] = useState("");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  function handleAddPermission() {
    if (newPermission && !permissions.includes(newPermission)) {
      onChange([...permissions, newPermission]);
      setNewPermission("");
    }
  }

  function handleRemovePermission(perm: string) {
    onChange(permissions.filter((p) => p !== perm));
  }

  function handleBadgeClick(perm: string) {
    const tool = getToolType(perm);
    if (tool in TOOL_INFO) {
      setSelectedTool(tool);
    }
  }

  const suggestions = Object.keys(TOOL_INFO).filter(
    (tool) => !permissions.some((p) => p.startsWith(tool))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {permissions.map((perm) => {
            const tool = getToolType(perm);
            const colorClass =
              TOOL_COLORS[tool] ?? "bg-gray-950 text-gray-300 border-gray-800";
            return (
              <motion.div
                key={perm}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "cursor-pointer gap-1 border pr-1",
                    colorClass
                  )}
                  onClick={() => handleBadgeClick(perm)}
                >
                  {perm}
                  <button
                    className="ml-1 rounded-full p-0.5 hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePermission(perm);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Add permission (e.g., Bash, Read:*)"
          value={newPermission}
          onChange={(e) => setNewPermission(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddPermission()}
        />
        <Button variant="outline" onClick={handleAddPermission}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Quick add:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 6).map((tool) => {
              const colorClass =
                TOOL_COLORS[tool] ?? "bg-gray-950 text-gray-300 border-gray-800";
              return (
                <Badge
                  key={tool}
                  variant="outline"
                  className={cn(
                    "cursor-pointer border opacity-60 hover:opacity-100",
                    colorClass
                  )}
                  onClick={() => onChange([...permissions, tool])}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {tool}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {selectedTool}
            </DialogTitle>
            <DialogDescription>
              {selectedTool && TOOL_INFO[selectedTool]?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTool && TOOL_INFO[selectedTool] && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Capabilities</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {TOOL_INFO[selectedTool].capabilities.map((cap, i) => (
                    <li key={i}>{cap}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-medium">Examples</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {TOOL_INFO[selectedTool].examples.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
