import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useMcpTools() {
  const query = useQuery({
    queryKey: ["mcp", "tools"],
    queryFn: () => api.mcp.tools(),
    staleTime: 30_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
