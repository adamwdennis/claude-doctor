import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function usePermissionsDebug() {
  const summaryQuery = useQuery({
    queryKey: ["permissions", "summary"],
    queryFn: () => api.permissions.summary(),
  });

  const debugMutation = useMutation({
    mutationFn: (query: string) => api.permissions.debug(query),
  });

  return {
    rules: summaryQuery.data?.rules ?? [],
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
    debugQuery: debugMutation.mutate,
    debugResult: debugMutation.data,
    isDebugging: debugMutation.isPending,
  };
}
