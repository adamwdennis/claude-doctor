import { useQuery } from "@tanstack/react-query";
import { api, type McpCollection, type McpCheckResult } from "@/lib/api";
import { useState, useCallback } from "react";

export function useMcp() {
  const [checkResults, setCheckResults] = useState<
    Record<string, McpCheckResult>
  >({});
  const [checkingServers, setCheckingServers] = useState<Set<string>>(
    new Set()
  );

  const query = useQuery({
    queryKey: ["mcp"],
    queryFn: () => api.mcp.list(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const checkServer = useCallback(async (serverName: string) => {
    setCheckingServers((prev) => new Set(prev).add(serverName));
    try {
      const result = await api.mcp.check(serverName);
      setCheckResults((prev) => ({
        ...prev,
        [serverName]: result,
      }));
    } finally {
      setCheckingServers((prev) => {
        const next = new Set(prev);
        next.delete(serverName);
        return next;
      });
    }
  }, []);

  const checkAllServers = useCallback(
    async (servers: Array<{ name: string }>) => {
      await Promise.all(servers.map((s) => checkServer(s.name)));
    },
    [checkServer]
  );

  return {
    data: query.data,
    servers: query.data?.servers ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    checkServer,
    checkAllServers,
    isChecking: checkingServers.size > 0,
    checkingServers,
    checkResults,
  };
}

export type { McpCollection, McpCheckResult };
