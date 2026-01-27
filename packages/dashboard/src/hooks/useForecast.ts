import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useForecast(days = 30) {
  const query = useQuery({
    queryKey: ["stats", "forecast", days],
    queryFn: () => api.stats.forecast(days),
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
