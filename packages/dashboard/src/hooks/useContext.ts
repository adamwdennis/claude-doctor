import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useContextBudget() {
  const query = useQuery({
    queryKey: ["context"],
    queryFn: () => api.context.get(),
    staleTime: 30_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
