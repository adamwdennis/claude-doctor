import { useEffect, useRef } from "react";
import { useMcp } from "@/hooks/useMcp";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

export function McpPanel() {
  const {
    servers,
    isLoading,
    error,
    checkServer,
    checkAllServers,
    checkingServers,
    checkResults,
  } = useMcp();

  const checkedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unchecked = servers.filter((s) => !checkedRef.current.has(s.name));
    if (unchecked.length > 0) {
      unchecked.forEach((s) => checkedRef.current.add(s.name));
      checkAllServers(unchecked);
    }
  }, [servers, checkAllServers]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load MCP config: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>MCP Servers</CardTitle>
          <CardDescription>
            {servers.length} server(s) configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No MCP servers configured
            </div>
          ) : (
            <div className="space-y-4">
              {servers.map((server) => {
                const result = checkResults[server.name];
                const isCheckingThis = checkingServers.has(server.name);
                return (
                  <Card key={server.name}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {server.name}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {server.source}
                          </Badge>
                        </div>
                        {isCheckingThis ? (
                          <Badge variant="secondary">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            checking
                          </Badge>
                        ) : result ? (
                          <Badge
                            variant={result.reachable ? "success" : "destructive"}
                          >
                            {result.reachable ? (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {result.reachable ? "reachable" : "unreachable"}
                          </Badge>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="secondary">{server.transport}</Badge>
                          {server.disabled && (
                            <Badge variant="outline">disabled</Badge>
                          )}
                        </div>
                        {server.command && (
                          <div className="font-mono text-sm">
                            {server.command} {server.args?.join(" ")}
                          </div>
                        )}
                        {server.url && (
                          <div className="font-mono text-sm">{server.url}</div>
                        )}
                        {server.env && Object.keys(server.env).length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Env: {Object.keys(server.env).join(", ")}
                          </div>
                        )}
                        {result?.error && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertDescription>{result.error}</AlertDescription>
                          </Alert>
                        )}
                        {result?.resolvedCommand && (
                          <div className="text-xs text-muted-foreground">
                            Resolved: {result.resolvedCommand}
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkServer(server.name)}
                          disabled={isCheckingThis}
                          aria-label={`Recheck connectivity for ${server.name}`}
                        >
                          {isCheckingThis ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Recheck
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
