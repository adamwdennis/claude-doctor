import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSessionDetail(sessionId: string | null) {
  const query = useQuery({
    queryKey: ["history", sessionId],
    queryFn: () => api.history.getSession(sessionId!),
    enabled: !!sessionId,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
