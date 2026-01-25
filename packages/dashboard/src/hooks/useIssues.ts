import { useQuery } from "@tanstack/react-query";
import { api, type DiagnosticIssue } from "@/lib/api";

export function useIssues() {
  const query = useQuery({
    queryKey: ["issues"],
    queryFn: () => api.issues.list(),
  });

  return {
    issues: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export type { DiagnosticIssue };
