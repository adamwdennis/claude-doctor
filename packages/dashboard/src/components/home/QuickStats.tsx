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
import { CountUp } from "@/components/reactbits/CountUp";

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
	const numericValue = typeof value === "number" ? value : null;
	return (
		<Card
			className="cursor-pointer transition-all hover:bg-accent/50 hover:shadow-[0_0_15px_rgba(var(--glow-rgb,255_255_255),0.08)] glow-border"
			onClick={onClick}
		>
			<CardContent className="flex items-center gap-3 p-4">
				<div className={cn("rounded-lg p-2.5 shadow-lg", color)}>
					<Icon className="h-5 w-5 text-white drop-shadow-sm" />
				</div>
				<div>
					<div className="text-2xl font-bold">
						{numericValue !== null ? (
							<CountUp to={numericValue} />
						) : (
							value
						)}
					</div>
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
				color="bg-gradient-to-br from-red-500 to-red-700"
				onClick={() => onNavigate(Tab.Issues)}
			/>
			<StatCard
				label="Warnings"
				value={warningCount}
				icon={AlertTriangle}
				color="bg-gradient-to-br from-yellow-500 to-amber-600"
				onClick={() => onNavigate(Tab.Issues)}
			/>
			<StatCard
				label="MCP Servers"
				value={`${mcpReachable}/${mcpTotal}`}
				icon={Plug}
				color="bg-gradient-to-br from-blue-500 to-blue-700"
				onClick={() => onNavigate(Tab.Mcp)}
			/>
			<StatCard
				label="Plugins"
				value={pluginCount}
				icon={Blocks}
				color="bg-gradient-to-br from-purple-500 to-violet-700"
				onClick={() => onNavigate(Tab.Agents)}
			/>
			<StatCard
				label="Config Files"
				value={configFileCount}
				icon={FileCode}
				color="bg-gradient-to-br from-amber-500 to-orange-600"
				onClick={() => onNavigate(Tab.User)}
			/>
		</div>
	);
}
