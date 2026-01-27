import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useMergedInstructions() {
  const query = useQuery({
    queryKey: ["instructions", "merged"],
    queryFn: () => api.instructions.merged(),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
