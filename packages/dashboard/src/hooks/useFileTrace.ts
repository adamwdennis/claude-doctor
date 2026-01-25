import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useFileRead(path: string | null) {
  return useQuery({
    queryKey: ["file-trace-read", path],
    queryFn: () => (path ? api.fileTrace.read(path) : Promise.resolve(null)),
    enabled: !!path,
  });
}

export function useFileSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ path, content }: { path: string; content: string }) =>
      api.fileTrace.save(path, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["file-trace-read", variables.path] });
      queryClient.invalidateQueries({ queryKey: ["file-trace"] });
    },
  });
}

export type { FileTraceCollection };
