import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tab } from "@/types/tabs";
import { ChevronRight, Circle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { McpServerConfig, McpCheckResult } from "@/lib/api";

interface McpStatusProps {
	servers: McpServerConfig[];
	checkResults: Record<string, McpCheckResult>;
	checkingServers: Set<string>;
	onNavigate: (tab: Tab) => void;
}

export function McpStatus({
	servers,
	checkResults,
	checkingServers,
	onNavigate,
}: McpStatusProps) {
	const displayServers = servers.slice(0, 5);
	const hasMore = servers.length > 5;

	function handleClickViewAll() {
		onNavigate(Tab.Mcp);
	}

	function handleClickServer() {
		onNavigate(Tab.Mcp);
	}

	function getStatusIndicator(serverName: string) {
		const isChecking = checkingServers.has(serverName);
		const result = checkResults[serverName];

		if (isChecking) {
			return <Spinner className="text-muted-foreground" />;
		}

		if (!result) {
			return <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />;
		}

		if (result.reachable) {
			return <Circle className="h-3 w-3 fill-green-500 text-green-500" />;
		}

		return <Circle className="h-3 w-3 fill-red-500 text-red-500" />;
	}

	function getStatusText(serverName: string) {
		const isChecking = checkingServers.has(serverName);
		const result = checkResults[serverName];

		if (isChecking) return "checking...";
		if (!result) return "not checked";
		if (result.reachable) return "reachable";
		return "unreachable";
	}

	if (servers.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base font-medium">
						MCP Server Status
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						No MCP servers configured
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-base font-medium">
					MCP Server Status
				</CardTitle>
				<Button
					variant="ghost"
					size="sm"
					className="text-xs"
					onClick={handleClickViewAll}
				>
					View All
					<ChevronRight className="ml-1 h-3 w-3" />
				</Button>
			</CardHeader>
			<CardContent className="space-y-2">
				{displayServers.map((server) => (
					<button
						key={server.name}
						onClick={handleClickServer}
						className="flex w-full items-center justify-between rounded-md p-2 text-left text-sm transition-colors hover:bg-accent/50"
					>
						<div className="flex items-center gap-2">
							{getStatusIndicator(server.name)}
							<span className="font-mono">{server.name}</span>
						</div>
						<span
							className={cn(
								"text-xs",
								checkResults[server.name]?.reachable
									? "text-green-600 dark:text-green-400"
									: checkResults[server.name]
										? "text-red-600 dark:text-red-400"
										: "text-muted-foreground"
							)}
						>
							{getStatusText(server.name)}
						</span>
					</button>
				))}
				{hasMore && (
					<div className="pt-1 text-xs text-muted-foreground">
						+{servers.length - 5} more servers
					</div>
				)}
			</CardContent>
		</Card>
	);
}
