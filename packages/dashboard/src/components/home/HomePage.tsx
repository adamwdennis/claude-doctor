import { useEffect } from "react";
import { Tab } from "@/types/tabs";
import { useStats } from "@/hooks/useStats";
import { useIssues } from "@/hooks/useIssues";
import { useMcp } from "@/hooks/useMcp";
import { HealthBanner } from "./HealthBanner";
import { QuickStats } from "./QuickStats";
import { CriticalIssues } from "./CriticalIssues";
import { McpStatus } from "./McpStatus";
import { AnimatedLoader } from "@/components/ui/animated-loader";

interface HomePageProps {
	onNavigate: (tab: Tab) => void;
}

interface StatsData {
	issues?: {
		error: number;
		warning: number;
		info: number;
	};
	mcpServers?: number;
	plugins?: number;
	configFiles?: Array<{ name: string; exists: boolean }>;
}

export function HomePage({ onNavigate }: HomePageProps) {
	const { stats, isLoading: statsLoading } = useStats() as {
		stats: StatsData;
		isLoading: boolean;
	};
	const { issues, isLoading: issuesLoading } = useIssues();
	const {
		servers,
		checkResults,
		checkingServers,
		checkAllServers,
		isLoading: mcpLoading,
	} = useMcp();

	// Auto-check MCP servers on mount and every 30s
	useEffect(() => {
		if (servers.length > 0) {
			checkAllServers(servers);
		}
	}, [servers, checkAllServers]);

	useEffect(() => {
		if (servers.length === 0) return;

		const interval = setInterval(() => {
			checkAllServers(servers);
		}, 30000);

		return () => clearInterval(interval);
	}, [servers, checkAllServers]);

	const isLoading = statsLoading || issuesLoading || mcpLoading;

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<AnimatedLoader />
			</div>
		);
	}

	const errorCount = stats.issues?.error ?? 0;
	const warningCount = stats.issues?.warning ?? 0;
	const mcpTotal = stats.mcpServers ?? 0;
	const pluginCount = stats.plugins ?? 0;
	const configFileCount =
		stats.configFiles?.filter((f) => f.exists).length ?? 0;

	// Count reachable servers
	const mcpReachable = Object.values(checkResults).filter(
		(r) => r.reachable
	).length;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<p className="text-sm text-muted-foreground">
					Claude Code configuration health overview
				</p>
			</div>

			<HealthBanner errorCount={errorCount} warningCount={warningCount} />

			<QuickStats
				errorCount={errorCount}
				warningCount={warningCount}
				mcpReachable={mcpReachable}
				mcpTotal={mcpTotal}
				pluginCount={pluginCount}
				configFileCount={configFileCount}
				onNavigate={onNavigate}
			/>

			<div className="grid gap-6 lg:grid-cols-2">
				<CriticalIssues issues={issues} onNavigate={onNavigate} />
				<McpStatus
					servers={servers}
					checkResults={checkResults}
					checkingServers={checkingServers}
					onNavigate={onNavigate}
				/>
			</div>
		</div>
	);
}
