import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useHooks() {
  const query = useQuery({
    queryKey: ["hooks"],
    queryFn: () => api.hooks.get(),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
