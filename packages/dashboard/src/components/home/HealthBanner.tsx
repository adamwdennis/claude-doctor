import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface HealthBannerProps {
	errorCount: number;
	warningCount: number;
}

export function HealthBanner({ errorCount, warningCount }: HealthBannerProps) {
	const hasErrors = errorCount > 0;
	const hasWarnings = warningCount > 0;

	function getStatus() {
		if (hasErrors) {
			return {
				variant: "error" as const,
				icon: XCircle,
				text: `${errorCount} critical issue${errorCount !== 1 ? "s" : ""}`,
				bg: "bg-red-500/10 border-red-500/30",
				iconColor: "text-red-500",
				textColor: "text-red-700 dark:text-red-300",
			};
		}
		if (hasWarnings) {
			return {
				variant: "warning" as const,
				icon: AlertTriangle,
				text: `${warningCount} warning${warningCount !== 1 ? "s" : ""}`,
				bg: "bg-yellow-500/10 border-yellow-500/30",
				iconColor: "text-yellow-500",
				textColor: "text-yellow-700 dark:text-yellow-300",
			};
		}
		return {
			variant: "success" as const,
			icon: CheckCircle2,
			text: "All systems healthy",
			bg: "bg-green-500/10 border-green-500/30",
			iconColor: "text-green-500",
			textColor: "text-green-700 dark:text-green-300",
		};
	}

	const status = getStatus();
	const Icon = status.icon;

	return (
		<div
			className={cn(
				"flex items-center gap-3 rounded-lg border p-4",
				status.bg
			)}
		>
			<Icon className={cn("h-6 w-6", status.iconColor)} />
			<span className={cn("font-medium", status.textColor)}>
				{status.text}
			</span>
		</div>
	);
}
