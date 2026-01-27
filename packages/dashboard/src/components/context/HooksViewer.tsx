import { useHooks } from "@/hooks/useHooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import { Webhook } from "lucide-react";

const EVENT_COLORS: Record<string, string> = {
  PreToolUse: "bg-blue-500/20 text-blue-400",
  PostToolUse: "bg-green-500/20 text-green-400",
  Notification: "bg-purple-500/20 text-purple-400",
  Stop: "bg-red-500/20 text-red-400",
};

export function HooksViewer() {
  const { data, isLoading, error } = useHooks();

  if (isLoading) return <CardLoader />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load hooks: {error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!data || data.totalHooks === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Hooks
          </CardTitle>
          <CardDescription>No hooks configured</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Group by event
  const grouped = new Map<string, typeof data.hooks>();
  for (const hook of data.hooks) {
    const existing = grouped.get(hook.event) ?? [];
    existing.push(hook);
    grouped.set(hook.event, existing);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Hooks
        </CardTitle>
        <CardDescription>{data.totalHooks} hook(s) configured</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...grouped.entries()].map(([event, hooks]) => (
          <div key={event}>
            <Badge className={`mb-2 ${EVENT_COLORS[event] ?? ""}`}>{event}</Badge>
            <div className="space-y-2 ml-2">
              {hooks.map((hook, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="font-mono text-sm">{hook.command}</div>
                    {hook.matcher && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Matcher: <span className="font-mono">{hook.matcher}</span>
                      </div>
                    )}
                    {hook.timeout && (
                      <div className="text-xs text-muted-foreground">
                        Timeout: {hook.timeout}ms
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{hook.source}</Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
