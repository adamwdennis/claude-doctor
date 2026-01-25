import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tab } from "@/types/tabs";
import {
	AlertCircle,
	AlertTriangle,
	Plug,
	Blocks,
	FileCode,
} from "lucide-react";

interface QuickStatsProps {
	errorCount: number;
	warningCount: number;
	mcpReachable: number;
	mcpTotal: number;
	pluginCount: number;
	configFileCount: number;
	onNavigate: (tab: Tab) => void;
}

interface StatCardProps {
	label: string;
	value: string | number;
	icon: typeof AlertCircle;
	color: string;
	onClick: () => void;
}

function StatCard({ label, value, icon: Icon, color, onClick }: StatCardProps) {
	return (
		<Card
			className="cursor-pointer transition-colors hover:bg-accent/50"
			onClick={onClick}
		>
			<CardContent className="flex items-center gap-3 p-4">
				<div className={cn("rounded-md p-2", color)}>
					<Icon className="h-5 w-5 text-white" />
				</div>
				<div>
					<div className="text-2xl font-bold">{value}</div>
					<div className="text-xs text-muted-foreground">{label}</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function QuickStats({
	errorCount,
	warningCount,
	mcpReachable,
	mcpTotal,
	pluginCount,
	configFileCount,
	onNavigate,
}: QuickStatsProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
			<StatCard
				label="Errors"
				value={errorCount}
				icon={AlertCircle}
				color="bg-red-500"
				onClick={() => onNavigate(Tab.Issues)}
			/>
			<StatCard
				label="Warnings"
				value={warningCount}
				icon={AlertTriangle}
				color="bg-yellow-500"
				onClick={() => onNavigate(Tab.Issues)}
			/>
			<StatCard
				label="MCP Servers"
				value={`${mcpReachable}/${mcpTotal}`}
				icon={Plug}
				color="bg-blue-500"
				onClick={() => onNavigate(Tab.Mcp)}
			/>
			<StatCard
				label="Plugins"
				value={pluginCount}
				icon={Blocks}
				color="bg-purple-500"
				onClick={() => onNavigate(Tab.Stats)}
			/>
			<StatCard
				label="Config Files"
				value={configFileCount}
				icon={FileCode}
				color="bg-amber-500"
				onClick={() => onNavigate(Tab.User)}
			/>
		</div>
	);
}
