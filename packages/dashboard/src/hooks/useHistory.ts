import { useQuery } from "@tanstack/react-query";
import { api, type HistoryCollection, type Session } from "@/lib/api";

export function useHistory(limit = 100) {
  const query = useQuery({
    queryKey: ["history", limit],
    queryFn: () => api.history.get(limit),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export type { HistoryCollection, Session };
