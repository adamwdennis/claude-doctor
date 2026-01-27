import { useMergedInstructions } from "@/hooks/useInstructions";
import { useInstructionsLint } from "@/hooks/useInstructionsLint";
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
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  project_claude_dir: "border-l-blue-500 bg-blue-500/5",
  project_root: "border-l-green-500 bg-green-500/5",
  user: "border-l-purple-500 bg-purple-500/5",
};

const SOURCE_LABELS: Record<string, string> = {
  project_claude_dir: "Project (.claude/)",
  project_root: "Project Root",
  user: "User Global",
};

const SOURCE_BADGE_COLORS: Record<string, string> = {
  project_claude_dir: "bg-blue-500/20 text-blue-400",
  project_root: "bg-green-500/20 text-green-400",
  user: "bg-purple-500/20 text-purple-400",
};

const LINT_ICONS: Record<string, typeof AlertCircle> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function MergePreview() {
  const { data, isLoading, error } = useMergedInstructions();
  const { data: lintData } = useInstructionsLint();

  if (isLoading) return <CardLoader />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load instructions: {error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!data) return null;

  const lintIssues = lintData?.issues ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>CLAUDE.md Merge Preview</CardTitle>
            <CardDescription>
              {data.blocks.length} file(s), {data.totalLines} lines, ~{data.totalTokens} tokens
            </CardDescription>
          </div>
          {lintIssues.length > 0 && (
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
              {lintIssues.length} lint issue(s)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lintIssues.length > 0 && (
          <div className="space-y-2">
            {lintIssues.map((issue, i) => {
              const Icon = LINT_ICONS[issue.severity] ?? Info;
              return (
                <Alert key={i} variant={issue.severity === "error" ? "destructive" : "default"}>
                  <Icon className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <span className="font-medium">[{issue.ruleId}]</span> {issue.message}
                    {issue.suggestion && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        {issue.suggestion}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        )}

        {data.blocks.map((block) => (
          <div
            key={block.path}
            className={`border-l-4 rounded-r-lg p-4 ${SOURCE_COLORS[block.source] ?? ""}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className={SOURCE_BADGE_COLORS[block.source] ?? ""}>
                  {SOURCE_LABELS[block.source] ?? block.source}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{block.path}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Lines {block.startLine}-{block.endLine}</span>
                <Badge variant="secondary">~{block.tokenEstimate} tokens</Badge>
              </div>
            </div>
            <pre className="text-xs font-mono bg-background/50 rounded p-3 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
              {block.content}
            </pre>
          </div>
        ))}

        {data.blocks.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No CLAUDE.md files found
          </div>
        )}
      </CardContent>
    </Card>
  );
}
