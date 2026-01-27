import { useState } from "react";
import { useEffectiveConfig } from "@/hooks/useEffectiveConfig";
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
import { ChevronDown, ChevronRight } from "lucide-react";

export function EffectiveConfigPanel() {
  const { data, isLoading, error } = useEffectiveConfig();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  if (isLoading) return <CardLoader />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load effective config: {error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!data) return null;

  function handleToggleKey(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Effective Configuration</CardTitle>
        <CardDescription>
          Final merged values across all settings layers ({data.entries.length} keys)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium w-8" />
                <th className="px-4 py-3 text-left font-medium">Key</th>
                <th className="px-4 py-3 text-left font-medium">Value</th>
                <th className="px-4 py-3 text-left font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.map((entry) => {
                const isExpanded = expandedKeys.has(entry.key);
                const hasOverrides = entry.overrides.length > 0;
                return (
                  <tr key={entry.key} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      {hasOverrides && (
                        <button onClick={() => handleToggleKey(entry.key)} className="text-muted-foreground">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">{entry.key}</td>
                    <td className="px-4 py-3">
                      <pre className="text-xs font-mono max-w-xs truncate">
                        {JSON.stringify(entry.value)}
                      </pre>
                      {isExpanded && entry.overrides.map((o, i) => (
                        <div key={i} className="mt-1 text-xs line-through text-muted-foreground font-mono">
                          {JSON.stringify(o.value)}
                          <Badge variant="outline" className="ml-2 text-xs">{o.source}</Badge>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{entry.source}</Badge>
                      {hasOverrides && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          +{entry.overrides.length} overridden
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
