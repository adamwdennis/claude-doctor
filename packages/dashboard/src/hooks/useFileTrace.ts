import { useQuery } from "@tanstack/react-query";
import { api, type FileTraceCollection } from "@/lib/api";

export function useFileTrace() {
  const query = useQuery({
    queryKey: ["file-trace"],
    queryFn: () => api.fileTrace.get(),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export type { FileTraceCollection };
