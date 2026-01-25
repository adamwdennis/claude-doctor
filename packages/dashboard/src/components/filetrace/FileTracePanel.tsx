import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FileText, FileJson, Check, X, Home, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileTrace } from "@/hooks/useFileTrace";
import { FileTraceType, type FileTraceEntry, type FileTraceLevel } from "@/lib/api";
import { FileEditorModal } from "./FileEditorModal";

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

function getRelativePath(filePath: string, dirPath: string): string {
  if (filePath.startsWith(dirPath)) {
    return filePath.slice(dirPath.length + 1);
  }
  return getFileName(filePath);
}

function getFileIcon(entry: FileTraceEntry) {
  if (entry.type === FileTraceType.ClaudeDir) {
    return <Folder className="h-3.5 w-3.5 text-blue-400" />;
  }
  if (entry.path.endsWith(".json")) {
    return <FileJson className="h-3.5 w-3.5 text-yellow-400" />;
  }
  return <FileText className="h-3.5 w-3.5 text-gray-400" />;
}

function isEditableFile(entry: FileTraceEntry): boolean {
  if (!entry.exists) return false;
  if (entry.type === FileTraceType.ClaudeDir) return false;
  return entry.path.endsWith(".json") || entry.path.endsWith(".md");
}

function getStatusIcon(exists: boolean) {
  if (exists) {
    return <Check className="h-3 w-3 text-green-500" />;
  }
  return <X className="h-3 w-3 text-gray-500" />;
}

function formatSize(size?: number): string {
  if (size === undefined) return "";
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
  return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

interface LevelItemProps {
  level: FileTraceLevel;
  onFileClick: (path: string) => void;
}

function LevelItem({ level, onFileClick }: LevelItemProps) {
  const [expanded, setExpanded] = useState(level.isProjectRoot);
  const existingFiles = level.files.filter((f) => f.exists);
  const hasFiles = level.files.length > 0;

  const handleClick = () => {
    if (hasFiles) {
      setExpanded(!expanded);
    }
  };

  const dirName = level.directory.split("/").pop() || level.directory;

  return (
    <div className="text-xs">
      <button
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left hover:bg-sidebar-accent/50",
          !hasFiles && "opacity-50 cursor-default"
        )}
      >
        {hasFiles ? (
          expanded ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3" />
        )}
        <Folder className="h-3.5 w-3.5 shrink-0 text-blue-400" />
        <span className="truncate font-medium">{dirName}</span>
        {level.isProjectRoot && (
          <span className="ml-auto" title="Project root">
            <GitBranch className="h-3 w-3 shrink-0 text-green-400" />
          </span>
        )}
        {level.isUserHome && (
          <span className="ml-auto" title="Home directory">
            <Home className="h-3 w-3 shrink-0 text-orange-400" />
          </span>
        )}
        {!level.isProjectRoot && !level.isUserHome && existingFiles.length > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {existingFiles.length}
          </span>
        )}
      </button>
      {expanded && hasFiles && (
        <div className="ml-3 border-l border-sidebar-border pl-2 pt-0.5">
          {level.files.map((file) => {
            const editable = isEditableFile(file);
            const handleClick = () => {
              if (editable) onFileClick(file.path);
            };
            return (
              <div
                key={file.path}
                onClick={handleClick}
                className={cn(
                  "flex items-center gap-1.5 py-0.5 px-1 rounded",
                  !file.exists && "opacity-40",
                  editable && "cursor-pointer hover:bg-sidebar-accent/50"
                )}
                title={editable ? `Click to edit: ${file.path}` : file.path}
              >
                {getFileIcon(file)}
                <span className="truncate">{getRelativePath(file.path, level.directory)}</span>
                <span className="ml-auto flex items-center gap-1">
                  {file.size !== undefined && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatSize(file.size)}
                    </span>
                  )}
                  {getStatusIcon(file.exists)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FileTracePanel() {
  const { data, isLoading, error } = useFileTrace();
  const [expanded, setExpanded] = useState(true);
  const [editingPath, setEditingPath] = useState<string | null>(null);

  function handleFileClick(path: string) {
    setEditingPath(path);
  }

  function handleCloseModal() {
    setEditingPath(null);
  }

  if (isLoading) {
    return (
      <div className="px-2 py-1.5 text-xs text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <div className="border-t">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent/50"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span>Config Files</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {data.levels.reduce((acc, l) => acc + l.files.filter((f) => f.exists).length, 0)} found
        </span>
      </button>
      {expanded && (
        <div className="max-h-64 overflow-y-auto px-2 pb-2">
          {data.levels.map((level) => (
            <LevelItem key={level.directory} level={level} onFileClick={handleFileClick} />
          ))}
        </div>
      )}
      <FileEditorModal path={editingPath} onClose={handleCloseModal} />
    </div>
  );
}
