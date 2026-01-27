import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSnapshots() {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["snapshots"],
    queryFn: () => api.snapshots.list(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string | undefined) => api.snapshots.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.snapshots.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snapshots"] });
    },
  });

  const diffMutation = useMutation({
    mutationFn: ({ leftId, rightId }: { leftId: string; rightId: string }) =>
      api.snapshots.diff(leftId, rightId),
  });

  return {
    snapshots: listQuery.data?.snapshots ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    createSnapshot: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteSnapshot: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    diffSnapshots: diffMutation.mutate,
    diffResult: diffMutation.data,
    isDiffing: diffMutation.isPending,
  };
}
