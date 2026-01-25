import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useStats() {
  const query = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.stats.get(),
  });

  return {
    stats: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
