import { useMcpTools } from "@/hooks/useMcpTools";
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
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function McpToolsPanel() {
  const { data, isLoading, error } = useMcpTools();
  const [filter, setFilter] = useState("");

  if (isLoading) return <CardLoader />;
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load MCP tools: {error.message}</AlertDescription>
      </Alert>
    );
  }
  if (!data) return null;

  const filtered = filter
    ? data.tools.filter(
        (t) =>
          t.name.toLowerCase().includes(filter.toLowerCase()) ||
          t.server.toLowerCase().includes(filter.toLowerCase()) ||
          t.description.toLowerCase().includes(filter.toLowerCase())
      )
    : data.tools;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Inventory</CardTitle>
        <CardDescription>
          {data.totalTools} tools from {data.servers.length} server(s) — ~{data.totalTokens.toLocaleString()} tokens total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Filter tools..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {data.totalTools === 0 ? "No MCP tools discovered" : "No matching tools"}
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Server</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tool) => (
                  <tr key={`${tool.server}-${tool.name}`} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-mono">{tool.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{tool.server}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {tool.description}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="secondary">~{tool.tokenEstimate}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
