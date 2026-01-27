import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useEffectiveConfig() {
  const query = useQuery({
    queryKey: ["settings", "effective"],
    queryFn: () => api.settings.effective(),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
