import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useInstructionsLint() {
  const query = useQuery({
    queryKey: ["instructions", "lint"],
    queryFn: () => api.instructions.lint(),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
