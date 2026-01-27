import { useMemo, useState } from "react";
import { useHistory, type Session } from "@/hooks/useHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Calendar, MessageSquare, Wrench, Coins, Hash, ArrowUpDown } from "lucide-react";
import { SessionTimeline } from "./SessionTimeline";

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return String(tokens);
}

function parseDate(dateStr: string): Date {
  const num = Number(dateStr);
  if (!Number.isNaN(num) && num > 1_000_000_000) {
    return new Date(num);
  }
  return new Date(dateStr);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDate(dateStr: string): string {
  const d = parseDate(dateStr);
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  let hh = d.getHours();
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  return `${yyyy}-${mm}-${dd}@${pad(hh)}:${min}:${sec} ${ampm}`;
}

enum SortField {
  Date = "date",
  Messages = "messages",
  ToolCalls = "toolCalls",
  Tokens = "tokens",
  Cost = "cost",
}

type SortDir = "asc" | "desc";

function sortSessions(sessions: Session[], field: SortField, dir: SortDir): Session[] {
  const mult = dir === "asc" ? 1 : -1;
  return [...sessions].sort((a, b) => {
    switch (field) {
      case SortField.Date:
        return mult * (parseDate(a.startedAt).getTime() - parseDate(b.startedAt).getTime());
      case SortField.Messages:
        return mult * (a.messageCount - b.messageCount);
      case SortField.ToolCalls:
        return mult * (a.toolCalls.length - b.toolCalls.length);
      case SortField.Tokens:
        return mult * ((a.tokensIn + a.tokensOut) - (b.tokensIn + b.tokensOut));
      case SortField.Cost:
        return mult * (a.costUsd - b.costUsd);
    }
  });
}

function formatDateRange(first: string, last: string): string {
  const f = parseDate(first);
  const l = parseDate(last);
  return `${f.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${l.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

interface SessionRowProps {
  session: Session;
}

function hasTokenData(session: Session): boolean {
  return session.tokensIn > 0 || session.tokensOut > 0 || session.costUsd > 0;
}

function SessionRow({ session }: SessionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const showTokens = hasTokenData(session);

  function handleClick() {
    setExpanded(!expanded);
  }

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={handleClick}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">
              {formatDate(session.startedAt)}
            </span>
            {session.model && (
              <Badge variant="outline" className="text-xs">
                {session.model}
              </Badge>
            )}
          </div>
          {session.cwd && (
            <div className="text-xs text-muted-foreground truncate">
              {session.cwd}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1" title="Messages">
            <MessageSquare className="h-3 w-3" />
            {session.messageCount}
          </span>
          <span className="flex items-center gap-1" title="Tool calls">
            <Wrench className="h-3 w-3" />
            {session.toolCalls.length}
          </span>
          <span className="flex items-center gap-1" title="Tokens">
            <Hash className="h-3 w-3" />
            {showTokens ? formatTokens(session.tokensIn + session.tokensOut) : "N/A"}
          </span>
          <span className="flex items-center gap-1 min-w-[60px]" title="Cost">
            <Coins className="h-3 w-3" />
            {showTokens ? formatCost(session.costUsd) : "N/A"}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 pl-10 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Tokens In:</span>{" "}
              <span className="font-mono">
                {showTokens ? formatTokens(session.tokensIn) : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Tokens Out:</span>{" "}
              <span className="font-mono">
                {showTokens ? formatTokens(session.tokensOut) : "N/A"}
              </span>
            </div>
          </div>
          {session.toolCalls.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {session.toolCalls.map((tool) => (
                <Badge key={tool} variant="secondary" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          )}
          <SessionTimeline sessionId={session.id} />
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: SortField.Date, label: "Date" },
  { field: SortField.Messages, label: "Messages" },
  { field: SortField.ToolCalls, label: "Tool Calls" },
  { field: SortField.Tokens, label: "Tokens" },
  { field: SortField.Cost, label: "Cost" },
];

export function MemoryPanel() {
  const { data, isLoading, error } = useHistory(100);
  const [sortField, setSortField] = useState<SortField>(SortField.Date);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(() => {
    if (!data) return [];
    return sortSessions(data.sessions, sortField, sortDir);
  }, [data, sortField, sortDir]);

  function handleToggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  if (isLoading) {
    return <CardLoader />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load history: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>No history data available</AlertDescription>
      </Alert>
    );
  }

  const { totals, dateRange } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Memory</h1>
        {dateRange && (
          <p className="text-sm text-muted-foreground">
            {formatDateRange(dateRange.first, dateRange.last)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Sessions"
          value={totals.sessionCount}
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          label="Messages"
          value={totals.messageCount}
          icon={<MessageSquare className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          label="Tool Calls"
          value={totals.toolCallCount}
          icon={<Wrench className="h-5 w-5 text-orange-500" />}
        />
        <StatCard
          label="Tokens In"
          value={formatTokens(totals.tokensIn)}
          icon={<Hash className="h-5 w-5 text-purple-500" />}
        />
        <StatCard
          label="Tokens Out"
          value={formatTokens(totals.tokensOut)}
          icon={<Hash className="h-5 w-5 text-pink-500" />}
        />
        <StatCard
          label="Total Cost"
          value={formatCost(totals.costUsd)}
          icon={<Coins className="h-5 w-5 text-yellow-500" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Sessions</CardTitle>
          <div className="flex items-center gap-1">
            {SORT_OPTIONS.map((opt) => (
              <Button
                key={opt.field}
                variant={sortField === opt.field ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleToggleSort(opt.field)}
                className="gap-1 text-xs"
              >
                {opt.label}
                {sortField === opt.field && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              No sessions found
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              {sorted.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
