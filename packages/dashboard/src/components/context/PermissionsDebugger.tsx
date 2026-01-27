import { useState } from "react";
import { usePermissionsDebug } from "@/hooks/usePermissionsDebug";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CardLoader } from "@/components/ui/card-loader";
import { Spinner } from "@/components/ui/spinner";
import { Shield, ShieldCheck, ShieldX, ShieldQuestion, ShieldAlert } from "lucide-react";

const VERDICT_CONFIG: Record<string, { icon: typeof Shield; color: string; label: string }> = {
  allowed: { icon: ShieldCheck, color: "bg-green-500/20 text-green-400", label: "Allowed" },
  denied: { icon: ShieldX, color: "bg-red-500/20 text-red-400", label: "Denied" },
  ask: { icon: ShieldAlert, color: "bg-yellow-500/20 text-yellow-400", label: "Ask" },
  no_match: { icon: ShieldQuestion, color: "bg-gray-500/20 text-gray-400", label: "No Match" },
};

const QUICK_TESTS = [
  "Bash(npm test)",
  "Read(*)",
  "Task(*)",
  "Write(*)",
  "Bash(git push)",
];

export function PermissionsDebugger() {
  const { rules, isLoading, debugQuery, debugResult, isDebugging } = usePermissionsDebug();
  const [query, setQuery] = useState("");
  const [showAllRules, setShowAllRules] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) debugQuery(query.trim());
  }

  function handleQuickTest(q: string) {
    setQuery(q);
    debugQuery(q);
  }

  if (isLoading) return <CardLoader />;

  const verdict = debugResult ? VERDICT_CONFIG[debugResult.verdict] : null;
  const VerdictIcon = verdict?.icon ?? Shield;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permissions Debugger
        </CardTitle>
        <CardDescription>
          Test how Claude Code will handle a tool request ({rules.length} rules loaded)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder='e.g. Bash(npm test)'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="font-mono"
          />
          <Button type="submit" disabled={isDebugging || !query.trim()}>
            {isDebugging ? <Spinner className="mr-2" /> : null}
            Check
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {QUICK_TESTS.map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              className="font-mono text-xs"
              onClick={() => handleQuickTest(q)}
            >
              {q}
            </Button>
          ))}
        </div>

        {debugResult && (
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-4 rounded-lg ${verdict?.color}`}>
              <VerdictIcon className="h-8 w-8" />
              <div>
                <div className="text-lg font-bold">{verdict?.label}</div>
                <div className="text-sm font-mono">{debugResult.query}</div>
              </div>
            </div>

            {debugResult.matchedRule && (
              <div className="text-sm">
                <span className="text-muted-foreground">Matched: </span>
                <Badge variant="outline" className="font-mono">{debugResult.matchedRule.pattern}</Badge>
                <span className="text-muted-foreground ml-2">from </span>
                <Badge variant="secondary">{debugResult.matchedRule.source}</Badge>
              </div>
            )}
          </div>
        )}

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllRules(!showAllRules)}
          >
            {showAllRules ? "Hide" : "Show"} all rules ({rules.length})
          </Button>

          {showAllRules && (
            <div className="mt-2 rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Pattern</th>
                    <th className="px-3 py-2 text-left">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-3 py-2">
                        <Badge
                          className={
                            rule.type === "deny" ? "bg-red-500/20 text-red-400" :
                            rule.type === "allow" ? "bg-green-500/20 text-green-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }
                        >
                          {rule.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-mono">{rule.pattern}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{rule.source}</Badge>
                      </td>
                    </tr>
                  ))}
                  {rules.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                        No permission rules configured
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
