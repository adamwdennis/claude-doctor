import { useAgents } from "@/hooks/useAgents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardLoader } from "@/components/ui/card-loader";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot } from "lucide-react";
import type { AgentInfo } from "@/lib/api";

interface AgentsPanelProps {
  search: string;
}

function groupByPlugin(agents: AgentInfo[]): Map<string, AgentInfo[]> {
  const grouped = new Map<string, AgentInfo[]>();
  for (const agent of agents) {
    const key = agent.pluginFullName;
    const list = grouped.get(key) ?? [];
    list.push(agent);
    grouped.set(key, list);
  }
  return grouped;
}

function matchesSearch(agent: AgentInfo, query: string): boolean {
  const lower = query.toLowerCase();
  return (
    agent.name.toLowerCase().includes(lower) ||
    agent.description.toLowerCase().includes(lower)
  );
}

export function AgentsPanel({ search }: AgentsPanelProps) {
  const { agents, isLoading, error, toggleAgent, toggleSingleAgent, isToggling } =
    useAgents();

  if (isLoading) {
    return <CardLoader />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load agents: {error.message}</AlertDescription>
      </Alert>
    );
  }

  const filtered = search
    ? agents.filter((a) => matchesSearch(a, search))
    : agents;
  const grouped = groupByPlugin(filtered);

  function handlePluginToggle(pluginFullName: string, pluginAgents: AgentInfo[]) {
    const allEnabled = pluginAgents.every((a) => a.agentEnabled);
    const someEnabled = pluginAgents.some((a) => a.agentEnabled);
    const pluginEnabled = pluginAgents[0].enabled;

    if (someEnabled && !allEnabled) {
      // indeterminate → enable all agents
      for (const a of pluginAgents) {
        if (!a.agentEnabled) {
          toggleSingleAgent(a.agentId, true);
        }
      }
    } else if (allEnabled) {
      // all on → disable plugin
      toggleAgent(pluginFullName, false);
    } else {
      // all off → enable plugin + all agents
      if (!pluginEnabled) {
        toggleAgent(pluginFullName, true);
      }
      for (const a of pluginAgents) {
        if (!a.agentEnabled) {
          toggleSingleAgent(a.agentId, true);
        }
      }
    }
  }

  function handleAgentToggle(agentId: string, checked: boolean) {
    toggleSingleAgent(agentId, checked);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agents</h1>
        <p className="text-sm text-muted-foreground">
          {agents.length} agent(s) from {groupByPlugin(agents).size} plugin(s)
        </p>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="px-4 py-8 text-center text-muted-foreground">
            {search
              ? "No agents match your search."
              : "No agents found. Install plugins with agents to see them here."}
          </CardContent>
        </Card>
      ) : (
        Array.from(grouped.entries()).map(([pluginFullName, pluginAgents]) => {
          const allAgentsEnabled = pluginAgents.every((a) => a.agentEnabled);
          const someAgentsEnabled = pluginAgents.some((a) => a.agentEnabled);
          const isIndeterminate = someAgentsEnabled && !allAgentsEnabled;
          const pluginEnabled = pluginAgents[0].enabled;

          return (
            <Card key={pluginFullName}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{pluginFullName}</CardTitle>
                    <Badge
                      variant={
                        isIndeterminate
                          ? "outline"
                          : pluginEnabled && allAgentsEnabled
                            ? "default"
                            : "secondary"
                      }
                    >
                      {isIndeterminate
                        ? "partial"
                        : pluginEnabled && allAgentsEnabled
                          ? "enabled"
                          : "disabled"}
                    </Badge>
                  </div>
                  <Switch
                    checked={pluginEnabled && allAgentsEnabled}
                    indeterminate={isIndeterminate}
                    onCheckedChange={() =>
                      handlePluginToggle(pluginFullName, pluginAgents)
                    }
                    disabled={isToggling}
                    aria-label={`Toggle ${pluginFullName}`}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {pluginAgents.map((agent) => (
                  <div
                    key={agent.agentId}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{agent.name}</span>
                        {agent.model && (
                          <Badge variant="outline" className="text-xs">
                            {agent.model}
                          </Badge>
                        )}
                      </div>
                      {agent.description && (
                        <p className="text-xs text-muted-foreground">
                          {agent.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={agent.agentEnabled}
                      onCheckedChange={(checked) =>
                        handleAgentToggle(agent.agentId, checked)
                      }
                      disabled={isToggling || !agent.enabled}
                      aria-label={`Toggle ${agent.name}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
