import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useFix() {
  const queryClient = useQueryClient();

  const fixMutation = useMutation({
    mutationFn: ({ fixType, payload }: { fixType: string; payload: Record<string, unknown> }) =>
      api.fix.apply(fixType, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  return {
    applyFix: fixMutation.mutate,
    isApplying: fixMutation.isPending,
    error: fixMutation.error,
  };
}
