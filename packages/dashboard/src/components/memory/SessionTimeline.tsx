import { useSessionDetail } from "@/hooks/useSessionDetail";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare, Wrench, Zap, Play, AlertCircle } from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: typeof MessageSquare; color: string; label: string }> = {
  session_start: { icon: Play, color: "text-green-400", label: "Session Start" },
  message: { icon: MessageSquare, color: "text-blue-400", label: "Message" },
  tool_call: { icon: Wrench, color: "text-amber-400", label: "Tool Call" },
  api_request: { icon: Zap, color: "text-muted-foreground", label: "API Request" },
  api_response: { icon: Zap, color: "text-muted-foreground", label: "API Response" },
};

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

interface SessionTimelineProps {
  sessionId: string;
}

export function SessionTimeline({ sessionId }: SessionTimelineProps) {
  const { data, isLoading, error } = useSessionDetail(sessionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Spinner />
        <span className="ml-2 text-sm text-muted-foreground">Loading session...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-red-400">
        <AlertCircle className="h-4 w-4" />
        Failed to load session details
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-1 py-2">
      <div className="text-xs text-muted-foreground mb-2">
        {data.entryCount} entries in session
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        {data.entries.map((entry, i) => {
          const config = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.message;
          const Icon = config.icon;
          return (
            <div key={i} className="relative flex items-start gap-3 py-1.5 pl-2">
              <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background border ${config.color}`}>
                <Icon className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                  {entry.toolName && (
                    <Badge variant="outline" className="text-xs font-mono">{entry.toolName}</Badge>
                  )}
                  {entry.costUsd !== undefined && entry.costUsd > 0 && (
                    <span className="text-xs text-muted-foreground">{formatCost(entry.costUsd)}</span>
                  )}
                </div>
                {entry.message && (
                  <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                    {entry.message}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {new Date(Number(entry.timestamp) || entry.timestamp).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
