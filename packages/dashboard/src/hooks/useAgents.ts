import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AgentsCollection } from "@/lib/api";

export function useAgents() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.agents.list(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      pluginFullName,
      enabled,
    }: {
      pluginFullName: string;
      enabled: boolean;
    }) => api.agents.toggle(pluginFullName, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  const toggleSingleAgentMutation = useMutation({
    mutationFn: ({
      agentId,
      enabled,
    }: {
      agentId: string;
      enabled: boolean;
    }) => api.agents.toggleAgent(agentId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  function handleToggle(pluginFullName: string, enabled: boolean) {
    toggleMutation.mutate({ pluginFullName, enabled });
  }

  function handleToggleSingleAgent(agentId: string, enabled: boolean) {
    toggleSingleAgentMutation.mutate({ agentId, enabled });
  }

  return {
    data: query.data,
    agents: query.data?.agents ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    toggleAgent: handleToggle,
    toggleSingleAgent: handleToggleSingleAgent,
    isToggling: toggleMutation.isPending || toggleSingleAgentMutation.isPending,
  };
}

export type { AgentsCollection };
