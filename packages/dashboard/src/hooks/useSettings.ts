import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type SettingsData } from "@/lib/api";

export function useSettings(layer: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["settings", layer],
    queryFn: () => api.settings.get(layer),
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.settings.save(layer, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", layer] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    save: mutation.mutate,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  };
}

export type { SettingsData };
