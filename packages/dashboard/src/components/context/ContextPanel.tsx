import { useContextBudget } from "@/hooks/useContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import { Badge } from "@/components/ui/badge";
import { MergePreview } from "./MergePreview";
import { PermissionsDebugger } from "./PermissionsDebugger";
import { HooksViewer } from "./HooksViewer";
import { ContextBreakdownChart } from "./ContextBreakdownChart";

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return String(tokens);
}

export function ContextPanel() {
  const { data, isLoading, error } = useContextBudget();

  if (isLoading) return <CardLoader />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load context: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  const usageColor =
    data.usagePercent > 80 ? "text-red-400" :
    data.usagePercent > 50 ? "text-yellow-400" :
    "text-green-400";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Context Window</h1>
        <p className="text-sm text-muted-foreground">
          What Claude receives before your first message
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatTokens(data.totalTokens)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Context Used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${usageColor}`}>
              {data.usagePercent}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Model Limit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              {formatTokens(data.modelLimit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Breakdown</CardTitle>
          <CardDescription>By source category</CardDescription>
        </CardHeader>
        <CardContent>
          <ContextBreakdownChart sources={data.sources} />
          <div className="mt-4 space-y-2">
            {data.sources.map((source) => (
              <div key={source.source} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{source.label}</span>
                  {source.details && (
                    <span className="text-xs text-muted-foreground">({source.details})</span>
                  )}
                </div>
                <Badge variant="secondary">{formatTokens(source.tokenEstimate)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <MergePreview />
      <PermissionsDebugger />
      <HooksViewer />
    </div>
  );
}
